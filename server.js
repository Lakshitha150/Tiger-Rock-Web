require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { normalizePriceUnit } = require('./pricing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Google Auth & Admin Session Storage
const activeAdminSessions = new Set();
const https = require('https');

// Helper to verify Google ID Token via Google API
const verifyGoogleIdToken = (idToken) => {
  return new Promise((resolve, reject) => {
    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error_description || parsed.error) {
            return reject(new Error(parsed.error_description || parsed.error));
          }
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// Admin Protection Middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please sign in with the admin username and password.' });
  }

  // Basic auth fallback support for legacy API requests
  if (authHeader.startsWith('Basic ')) {
    const creds = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    if (creds[0] === (process.env.ADMIN_USER || 'admin') && creds[1] === (process.env.ADMIN_PASS || 'tigerrock2026')) {
      return next();
    }
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (activeAdminSessions.has(token)) {
    return next();
  }

  return res.status(401).json({ error: 'Session expired or unauthorized. Please sign in with the admin username and password.' });
};

// Admin username/password authentication endpoint
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = (process.env.ADMIN_USER || 'admin').toString().trim();
  const expectedPass = (process.env.ADMIN_PASS || '2026').toString();

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  if (String(username).trim() !== expectedUser || String(password) !== expectedPass) {
    return res.status(403).json({ error: 'Invalid admin credentials.' });
  }

  const crypto = require('crypto');
  const sessionToken = 'tr_admin_' + crypto.randomBytes(32).toString('hex');
  activeAdminSessions.add(sessionToken);

  return res.json({
    success: true,
    token: sessionToken,
    user: {
      username: expectedUser,
      displayName: 'Admin'
    }
  });
});

// Protect all /api/admin/* endpoints
app.use('/api/admin', adminAuth);

// Connect to SQLite DB
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function(err, row) {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function(err, rows) {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return String(value);

  return value
    .replace(/\u0000/g, '')
    .replace(/[\uFFFD]/g, '')
    .replace(/[\u0001-\u001F\u007F-\u009F]/g, '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sanitizeExistingRecords() {
  const rooms = await allAsync('SELECT id, name, description, room_type, condition, image_url FROM rooms');
  for (const room of rooms) {
    const cleanedName = normalizeText(room.name);
    const cleanedDescription = normalizeText(room.description);
    const cleanedType = normalizeText(room.room_type);
    const cleanedCondition = normalizeText(room.condition);
    const cleanedImage = normalizeText(room.image_url);

    if (cleanedName !== room.name || cleanedDescription !== room.description || cleanedType !== room.room_type || cleanedCondition !== room.condition || cleanedImage !== room.image_url) {
      await runAsync(
        `UPDATE rooms SET name = ?, description = ?, room_type = ?, condition = ?, image_url = ? WHERE id = ?`,
        [cleanedName, cleanedDescription, cleanedType, cleanedCondition, cleanedImage, room.id]
      );
    }
  }

  const amenities = await allAsync('SELECT id, name FROM room_amenities');
  for (const amenity of amenities) {
    const cleanedName = normalizeText(amenity.name);
    if (cleanedName !== amenity.name) {
      await runAsync('UPDATE room_amenities SET name = ? WHERE id = ?', [cleanedName, amenity.id]);
    }
  }

  const facilities = await allAsync('SELECT id, name FROM room_facilities');
  for (const facility of facilities) {
    const cleanedName = normalizeText(facility.name);
    if (cleanedName !== facility.name) {
      await runAsync('UPDATE room_facilities SET name = ? WHERE id = ?', [cleanedName, facility.id]);
    }
  }

  const enhancements = await allAsync('SELECT id, name FROM room_enhancements');
  for (const enhancement of enhancements) {
    const cleanedName = normalizeText(enhancement.name);
    if (cleanedName !== enhancement.name) {
      await runAsync('UPDATE room_enhancements SET name = ? WHERE id = ?', [cleanedName, enhancement.id]);
    }
  }
}

async function ensureSchema() {
  await runAsync(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    total_quantity INTEGER NOT NULL,
    room_type TEXT DEFAULT '',
    condition TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    price_unit TEXT DEFAULT 'per night'
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    checkIn TEXT NOT NULL,
    checkOut TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    guest_phone TEXT,
    guests INTEGER,
    total_cost REAL,
    status TEXT DEFAULT 'confirmed',
    source TEXT DEFAULT 'website',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS room_amenities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS room_facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS room_enhancements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )`);

  const existingColumns = await allAsync(`PRAGMA table_info(rooms)`);
  const columnNames = existingColumns.map((col) => col.name);
  if (!columnNames.includes('description')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN description TEXT DEFAULT ''`);
  }
  if (!columnNames.includes('image_url')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN image_url TEXT DEFAULT ''`);
  }
  if (!columnNames.includes('room_type')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN room_type TEXT DEFAULT ''`);
  }
  if (!columnNames.includes('condition')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN condition TEXT DEFAULT ''`);
  }
  if (!columnNames.includes('price_unit')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN price_unit TEXT DEFAULT 'per night'`);
  }
  await runAsync(`UPDATE rooms SET price_unit = COALESCE(NULLIF(price_unit, ''), 'per night') WHERE price_unit IS NULL OR price_unit = ''`);

  if (!columnNames.includes('type')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN type TEXT DEFAULT 'cabana'`);
  }
  if (!columnNames.includes('is_offer')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN is_offer BOOLEAN DEFAULT 0`);
  }
  if (!columnNames.includes('offer_text')) {
    await runAsync(`ALTER TABLE rooms ADD COLUMN offer_text TEXT DEFAULT ''`);
  }
  
  // We no longer destroy legacy rooms here because they are seeded in init_db.js


  await sanitizeExistingRecords();
}

// Configure your email transporter (requires real credentials to work)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your provider
  auth: {
    user: 'dambullatigerrock@gmail.com', // Replace with actual email
    pass: process.env.GMAIL_APP_PASSWORD // Loaded from .env file securely
  }
});

ensureSchema().catch((err) => {
  console.error('Schema initialization failed', err);
});

// Function to generate PDF receipt and send email & whatsapp
function handleReceiptAndNotifications(booking, roomName) {
  const doc = new PDFDocument();
  const pdfPath = `./receipts/receipt_TR-${booking.id}.pdf`;
  
  if (!fs.existsSync('./receipts')){
    fs.mkdirSync('./receipts');
  }

  doc.pipe(fs.createWriteStream(pdfPath));
  
  doc.fontSize(25).text('Dambulla Tiger Rock', { align: 'center' });
  doc.moveDown();
  doc.fontSize(20).text('Booking Reservation Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Booking ID: TR-${booking.id}`);
  doc.text(`Guest Name: ${booking.guest_name}`);
  doc.text(`Room: ${roomName}`);
  doc.text(`Check In: ${booking.checkIn}`);
  doc.text(`Check Out: ${booking.checkOut}`);
  doc.text(`Guests: ${booking.guests}`);
  doc.moveDown();
  doc.fontSize(16).text(`Total Amount: $${booking.total_cost}`);
  doc.text(`Payment Status: Cash on Arrival`, { color: 'green' });
  
  doc.end();

  // Wait for PDF to finish writing, then send email
  setTimeout(() => {
    // 1. Send Email Notification
    if (booking.guest_email) {
      const mailOptions = {
        from: 'dambullatigerrock@gmail.com',
        to: booking.guest_email,
        bcc: 'dambullatigerrock@gmail.com', // Hotel receives a copy
        subject: `Your Reservation Confirmation - TR-${booking.id}`,
        text: `Dear ${booking.guest_name},\n\nThank you for booking with Dambulla Tiger Rock!\nPlease find your reservation receipt attached. Payment is expected upon arrival in cash.\n\nBest Regards,\nThe Tiger Rock Team`,
        attachments: [{
          filename: `receipt_TR-${booking.id}.pdf`,
          path: pdfPath
        }]
      };

      /*
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Note: Email sending failed (Check credentials):', error.message);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      */
      console.log(`[Email disabled] Generated PDF for TR-${booking.id} but did not send email.`);
    }

    // 2. Send WhatsApp Notification (Mock implementation - requires Twilio/Meta API)
    if (booking.guest_phone) {
      console.log(`[WhatsApp API Placeholder] -> Sending message to ${booking.guest_phone}:`);
      console.log(`"Dear ${booking.guest_name}, your booking TR-${booking.id} for ${roomName} is confirmed! Please pay $${booking.total_cost} on arrival."`);
      // To implement real WhatsApp messaging, use the Twilio Node.js SDK:
      // const client = require('twilio')(accountSid, authToken);
      // client.messages.create({
      //   body: `Your booking for ${roomName} is confirmed! ID: TR-${booking.id}. Pay on arrival.`,
      //   from: 'whatsapp:+14155238886',
      //   to: `whatsapp:${booking.guest_phone}`
      // });
    }
  }, 1500); 
}

// Shared Rooms Handler
const fetchRoomsHandler = async (req, res) => {
  try {
    const rooms = await allAsync('SELECT * FROM rooms ORDER BY name ASC');
    const roomIds = rooms.map((room) => room.id);
    const amenities = roomIds.length
      ? await allAsync(`SELECT * FROM room_amenities WHERE room_id IN (${roomIds.map(() => '?').join(',')}) ORDER BY id ASC`, roomIds)
      : [];
    const facilities = roomIds.length
      ? await allAsync(`SELECT * FROM room_facilities WHERE room_id IN (${roomIds.map(() => '?').join(',')}) ORDER BY id ASC`, roomIds)
      : [];
    const enhancements = roomIds.length
      ? await allAsync(`SELECT * FROM room_enhancements WHERE room_id IN (${roomIds.map(() => '?').join(',')}) ORDER BY id ASC`, roomIds)
      : [];

    const amenitiesByRoom = {};
    amenities.forEach((item) => {
      if (!amenitiesByRoom[item.room_id]) amenitiesByRoom[item.room_id] = [];
      amenitiesByRoom[item.room_id].push(item);
    });

    const facilitiesByRoom = {};
    facilities.forEach((item) => {
      if (!facilitiesByRoom[item.room_id]) facilitiesByRoom[item.room_id] = [];
      facilitiesByRoom[item.room_id].push(item);
    });

    const enhancementsByRoom = {};
    enhancements.forEach((item) => {
      if (!enhancementsByRoom[item.room_id]) enhancementsByRoom[item.room_id] = [];
      enhancementsByRoom[item.room_id].push({
        ...item,
        price: Number(item.price || 0),
        name: normalizeText(item.name)
      });
    });

    res.json(rooms.map((room) => ({
      ...room,
      name: normalizeText(room.name),
      description: normalizeText(room.description),
      room_type: normalizeText(room.room_type),
      condition: normalizeText(room.condition),
      image_url: normalizeText(room.image_url),
      price: Number(room.price || 0),
      price_unit: normalizePriceUnit(room.price_unit),
      type: normalizeText(room.type || 'cabana'),
      is_offer: Boolean(room.is_offer),
      offer_text: normalizeText(room.offer_text),
      amenities: (amenitiesByRoom[room.id] || []).map((item) => ({
        ...item,
        name: normalizeText(item.name)
      })),
      facilities: (facilitiesByRoom[room.id] || []).map((item) => ({
        ...item,
        name: normalizeText(item.name)
      })),
      enhancements: (enhancementsByRoom[room.id] || []).map((item) => ({
        ...item,
        name: normalizeText(item.name)
      }))
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get('/api/rooms', fetchRoomsHandler);
app.get('/api/admin/rooms', fetchRoomsHandler);

app.get('/api/admin/bookings', (req, res) => {
  const query = `
    SELECT b.*, r.name as room_name 
    FROM bookings b 
    LEFT JOIN rooms r ON b.room_id = r.id 
    ORDER BY b.checkIn ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

  app.post('/api/admin/rooms', async (req, res) => {
    try {
      const { id, name, price, total_quantity, room_type, condition, description, image_url, price_unit, type, is_offer, offer_text } = req.body;
      if (!id || !name || price === undefined || total_quantity === undefined) {
        return res.status(400).json({ error: 'id, name, price, and total_quantity are required' });
      }
  
      await runAsync(
        `INSERT INTO rooms (id, name, price, total_quantity, room_type, condition, description, image_url, price_unit, type, is_offer, offer_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           price = excluded.price,
           total_quantity = excluded.total_quantity,
           room_type = excluded.room_type,
           condition = excluded.condition,
           description = excluded.description,
           image_url = excluded.image_url,
           price_unit = excluded.price_unit,
           type = excluded.type,
           is_offer = excluded.is_offer,
           offer_text = excluded.offer_text`,
        [id, name, price, total_quantity, room_type || '', condition || '', description || '', image_url || '', normalizePriceUnit(price_unit), type || 'cabana', is_offer ? 1 : 0, offer_text || '']
      );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/rooms/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM room_amenities WHERE room_id = ?', [req.params.id]);
    await runAsync('DELETE FROM room_facilities WHERE room_id = ?', [req.params.id]);
    await runAsync('DELETE FROM room_enhancements WHERE room_id = ?', [req.params.id]);
    await runAsync('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/rooms/:id/amenities', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await runAsync('INSERT INTO room_amenities (room_id, name) VALUES (?, ?)', [req.params.id, name]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/amenities/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await runAsync('UPDATE room_amenities SET name = ? WHERE id = ?', [normalizeText(name), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/amenities/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM room_amenities WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/rooms/:id/enhancements', async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await runAsync('INSERT INTO room_enhancements (room_id, name, price) VALUES (?, ?, ?)', [req.params.id, normalizeText(name), Number(price || 0)]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/enhancements/:id', async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await runAsync('UPDATE room_enhancements SET name = ?, price = ? WHERE id = ?', [normalizeText(name), Number(price || 0), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/enhancements/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM room_enhancements WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/rooms/:id/facilities', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await runAsync('INSERT INTO room_facilities (room_id, name) VALUES (?, ?)', [req.params.id, name]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/facilities/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await runAsync('UPDATE room_facilities SET name = ? WHERE id = ?', [normalizeText(name), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/facilities/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM room_facilities WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/availability
app.get('/api/availability', (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut are required' });
  }

  db.all('SELECT * FROM rooms', [], (err, rooms) => {
    if (err) return res.status(500).json({ error: err.message });

    const query = `
      SELECT room_id, COUNT(*) as booked_count 
      FROM bookings 
      WHERE status != 'cancelled' 
      AND checkIn < ? AND checkOut > ?
      GROUP BY room_id
    `;
    
    db.all(query, [checkOut, checkIn], (err, bookedCounts) => {
      if (err) return res.status(500).json({ error: err.message });

      const bookedMap = {};
      bookedCounts.forEach(row => {
        bookedMap[row.room_id] = row.booked_count;
      });

      const availability = rooms.map(room => {
        const booked = bookedMap[room.id] || 0;
        return {
          id: room.id,
          name: room.name,
          price: room.price,
          total_quantity: room.total_quantity,
          booked_count: booked,
          available: Math.max(0, room.total_quantity - booked)
        };
      });

      res.json(availability);
    });
  });
});

// POST /api/bookings
app.post('/api/bookings', (req, res) => {
  const { room_id, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, totalCost, source } = req.body;
  
  if (!room_id || !checkIn || !checkOut || !guestName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO bookings (room_id, checkIn, checkOut, guest_name, guest_email, guest_phone, guests, total_cost, status, source) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
  `;
  const params = [room_id, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, totalCost, source || 'website'];
  
  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    const bookingId = this.lastID;
    
    // Fetch room name for the receipt
    db.get('SELECT name FROM rooms WHERE id = ?', [room_id], (err, room) => {
      if (!err && room) {
        handleReceiptAndNotifications({
          id: bookingId,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          checkIn,
          checkOut,
          guests,
          total_cost: totalCost
        }, room.name);
      }
    });

    res.json({ success: true, booking_id: bookingId });
  });
});

// GET /api/bookings
app.get('/api/bookings', (req, res) => {
  const query = `
    SELECT b.*, r.name as room_name 
    FROM bookings b 
    JOIN rooms r ON b.room_id = r.id 
    ORDER BY b.checkIn ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// DELETE /api/bookings/:id
app.delete('/api/bookings/:id', (req, res) => {
  db.run('DELETE FROM bookings WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deleted: this.changes });
  });
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = {
  normalizeText
};
