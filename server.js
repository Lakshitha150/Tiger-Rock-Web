require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));
// Serve the receipts directory so users can download PDFs
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Connect to SQLite DB
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Configure your email transporter (requires real credentials to work)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your provider
  auth: {
    user: 'dambullatigerrock@gmail.com', // Replace with actual email
    pass: process.env.GMAIL_APP_PASSWORD // Loaded from .env file securely
  }
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

// GET /api/rooms
app.get('/api/rooms', (req, res) => {
  db.all('SELECT * FROM rooms', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
