const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Create rooms table
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    total_quantity INTEGER NOT NULL,
    room_type TEXT DEFAULT '',
    condition TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT ''
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

  // Insert default rooms (using REPLACE so we can rerun this script to reset default counts)
  const stmt = db.prepare('INSERT OR REPLACE INTO rooms (id, name, price, total_quantity, room_type, condition, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  
  // Seed the new viewpoint-access experience as the default room option.
  stmt.run('viewpoint-access', 'Viewpoint Access Pass', 40, 10, 'Short Access', 'Excellent', 'Short access pass for the viewpoint for 1-2 hours, ideal for a quick visit rather than an overnight stay.', 'assets/images/viewpoint-scenery/dambulla-tiger-rock-viewpoint-1.jpeg');
  stmt.finalize();

  console.log('Database initialized successfully with default rooms.');
});

db.close();
