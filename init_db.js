const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Create rooms table
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    total_quantity INTEGER NOT NULL
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

  // Insert default rooms (using REPLACE so we can rerun this script to reset default counts)
  const stmt = db.prepare('INSERT OR REPLACE INTO rooms (id, name, price, total_quantity) VALUES (?, ?, ?, ?)');
  
  // Example setup: 2 Sunrise Lofts, 1 Sigiriya View Chalet
  stmt.run('sunrise-loft', 'The Sunrise Loft', 180, 2);
  stmt.run('sigiriya-view', 'The Sigiriya View Chalet', 220, 1);
  stmt.finalize();

  console.log('Database initialized successfully with default rooms.');
});

db.close();
