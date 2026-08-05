const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Drop tables to recreate with new schema
  db.run(`DROP TABLE IF EXISTS room_enhancements`);
  db.run(`DROP TABLE IF EXISTS room_facilities`);
  db.run(`DROP TABLE IF EXISTS room_amenities`);
  db.run(`DROP TABLE IF EXISTS bookings`);
  db.run(`DROP TABLE IF EXISTS rooms`);

  // Create rooms table
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    total_quantity INTEGER NOT NULL,
    room_type TEXT DEFAULT '',
    condition TEXT DEFAULT '',
    description TEXT,
    image_url TEXT,
    type TEXT DEFAULT 'cabana',
    price_unit TEXT DEFAULT 'per night',
    is_offer BOOLEAN DEFAULT 0,
    offer_text TEXT DEFAULT ''
  )`);

  // Create bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
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

  db.run(`CREATE TABLE IF NOT EXISTS room_amenities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS room_facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS room_enhancements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )`);

  // =============================================
  // SEED ROOMS
  // =============================================
  const roomStmt = db.prepare('INSERT OR REPLACE INTO rooms (id, name, price, total_quantity, room_type, condition, description, image_url, type, price_unit, is_offer, offer_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  // 1. A-Frame Cabana (we have 2 identical cabanas)
  roomStmt.run('a-frame-cabana', 'A-Frame Cabana', 35, 2, 'Cabana', 'Excellent',
    'Premium boho styling, double-decker mezzanine layout, low platform bed, desk work zone, and jungle views. Includes full access to viewpoint.',
    'assets/images/cabana-architecture/dambulla-tiger-rock-cabana-interior-13.jpeg', 'cabana', 'per night', 1, 'Book from official website for $35');

  // 2. 360° Rock Trail & Viewpoint Access
  roomStmt.run('rock-trail', '360° Rock Trail & Viewpoint Pass', 6, 20, 'Activity', 'Excellent',
    'Hike through massive granite boulders to reach the 360° summit viewing nets, tea deck, and panoramic rock viewpoints during sunrise or sunset.',
    'assets/images/viewpoint-scenery/dambulla-tiger-rock-viewpoint-1.jpeg', 'experience', 'per person', 1, 'Free for foreigners');

  // 3. Quad Bike Ride
  roomStmt.run('quad-bike', 'Quad Bike Ride', 0, 5, 'Activity', 'Excellent',
    'Explore the rugged off-road pathways and nature trails around the property on our premium ATVs.',
    'assets/images/pathways-nature/dambulla-tiger-rock-atv-adventure-1.jpeg', 'experience', 'per person', 0, '');

  roomStmt.finalize();

  // =============================================
  // SEED AMENITIES (with emojis)
  // =============================================
  const amenityStmt = db.prepare('INSERT INTO room_amenities (room_id, name) VALUES (?, ?)');

  // A-Frame Cabana amenities
  amenityStmt.run('a-frame-cabana', '🛏️ Low Platform Double Bed');
  amenityStmt.run('a-frame-cabana', '🪟 Floor-to-Ceiling Glass Windows');
  amenityStmt.run('a-frame-cabana', '🌿 Private Jungle Views');
  amenityStmt.run('a-frame-cabana', '💡 Warm Ambient Lighting');
  amenityStmt.run('a-frame-cabana', '🪑 Desk Work Zone');
  amenityStmt.run('a-frame-cabana', '🏔️ Mezzanine Loft Level');
  amenityStmt.run('a-frame-cabana', '🚿 Attached Bathroom');
  amenityStmt.run('a-frame-cabana', '🎒 Towels & Linen Provided');

  // 360° Rock Trail & Viewpoint amenities
  amenityStmt.run('rock-trail', '🌄 Panoramic 360° Summit Views');
  amenityStmt.run('rock-trail', '🌅 Sunrise & Sunset Sessions');
  amenityStmt.run('rock-trail', '📸 Photo-Friendly Spots');
  amenityStmt.run('rock-trail', '🧗 Guided Rock Climb');
  amenityStmt.run('rock-trail', '☕ Sunrise Tea Deck');

  // Quad Bike amenities
  amenityStmt.run('quad-bike', '🏍️ Premium ATV Vehicles');
  amenityStmt.run('quad-bike', '🗺️ Guided Trail Route');
  amenityStmt.run('quad-bike', '🪖 Safety Helmet Provided');
  amenityStmt.run('quad-bike', '📸 Photo Stops Along Trail');

  amenityStmt.finalize();

  // =============================================
  // SEED FACILITIES (with emojis)
  // =============================================
  const facilityStmt = db.prepare('INSERT INTO room_facilities (room_id, name) VALUES (?, ?)');

  // A-Frame Cabana facilities
  facilityStmt.run('a-frame-cabana', '🅿️ Free Parking');
  facilityStmt.run('a-frame-cabana', '📶 Free Wi-Fi');
  facilityStmt.run('a-frame-cabana', '🔒 24/7 Security');
  facilityStmt.run('a-frame-cabana', '🍳 Breakfast Available');
  facilityStmt.run('a-frame-cabana', '🏔️ Viewpoint Access Included');
  facilityStmt.run('a-frame-cabana', '🧹 Daily Housekeeping');

  // Rock Trail facilities
  facilityStmt.run('rock-trail', '🥾 Trail & Summit Access');
  facilityStmt.run('rock-trail', '🎫 Entry Ticket Included');
  facilityStmt.run('rock-trail', '🧭 Guide Available');
  facilityStmt.run('rock-trail', '💧 Water Provided');

  // Quad Bike facilities
  facilityStmt.run('quad-bike', '🥾 Off-Road Trail Access');
  facilityStmt.run('quad-bike', '🛡️ Safety Gear Included');
  facilityStmt.run('quad-bike', '🧑‍🏫 Instructor Supervision');
  facilityStmt.run('quad-bike', '🅿️ Free Parking');

  facilityStmt.finalize();

  // =============================================
  // SEED ENHANCEMENTS (paid add-ons with emojis)
  // =============================================
  const enhStmt = db.prepare('INSERT INTO room_enhancements (room_id, name, price) VALUES (?, ?, ?)');

  // A-Frame Cabana enhancements (reminder: viewpoint access is already INCLUDED free)
  enhStmt.run('a-frame-cabana', '🍳 Breakfast Package (per person)', 5);
  enhStmt.run('a-frame-cabana', '🥘 Dinner Package (per person)', 8);
  enhStmt.run('a-frame-cabana', '🔥 BBQ Night Setup', 25);
  enhStmt.run('a-frame-cabana', '🕐 Late Checkout (until 2 PM)', 10);
  enhStmt.run('a-frame-cabana', '🚐 Airport Transfer (one way)', 45);
  enhStmt.run('a-frame-cabana', '🎂 Birthday / Anniversary Decoration', 20);
  enhStmt.run('a-frame-cabana', '🏍️ Quad Bike Add-On (per person)', 15);
  enhStmt.run('a-frame-cabana', 'Custom Trip Arrangement', 0);
  enhStmt.run('a-frame-cabana', 'Pidurangala Rock Sunrise Trip', 0);
  enhStmt.run('a-frame-cabana', 'Sigiriya Rock Fortress Trip', 6);
  enhStmt.run('a-frame-cabana', 'Wildlife Safari Trip', 0);

  // Rock Trail enhancements
  enhStmt.run('rock-trail', '📸 Photography Guide', 10);
  enhStmt.run('rock-trail', '☕ Sunrise Tea & Snacks', 3);
  enhStmt.run('rock-trail', '🔦 Sunset Session Add-On', 5);

  // Quad Bike enhancements
  enhStmt.run('quad-bike', '⏱️ Extended Ride (extra 30 min)', 10);
  enhStmt.run('quad-bike', '👫 Dual Rider (2 persons, 1 ATV)', 8);
  enhStmt.run('quad-bike', '📸 GoPro Recording', 5);

  // Sigiriya Trip enhancements
  enhStmt.run('sigiriya-trip', '🧑‍🏫 Private Guide (English)', 15);
  enhStmt.run('sigiriya-trip', '🍱 Packed Lunch', 5);
  enhStmt.run('sigiriya-trip', '📸 Photography Package', 10);

  // Pidurangala Trip enhancements
  enhStmt.run('pidurangala-trip', '☕ Sunrise Breakfast Pack', 5);
  enhStmt.run('pidurangala-trip', '🧑‍🏫 Private Guide', 15);
  enhStmt.run('pidurangala-trip', '📸 Drone Photography', 20);

  // Safari Trip enhancements
  enhStmt.run('safari-trip', '⏱️ Full Day Safari (8 hrs)', 30);
  enhStmt.run('safari-trip', '🍱 Picnic Lunch Package', 8);
  enhStmt.run('safari-trip', '🔭 Binoculars Rental', 3);

  // Custom Trip enhancements
  enhStmt.run('custom-trip', '🚐 Air-Conditioned Vehicle', 20);
  enhStmt.run('custom-trip', '🧑‍🏫 English-Speaking Guide', 15);
  enhStmt.run('custom-trip', '🍱 Meal Package', 8);

  enhStmt.finalize();

  console.log('Database initialized successfully with 4 packages + amenities + facilities + enhancements.');
});

db.close();
