const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  db.serialize(() => {
    db.run("DELETE FROM room_enhancements WHERE room_id IN ('sunrise-loft','sigiriya-view')");
    db.run("DELETE FROM room_amenities WHERE room_id IN ('sunrise-loft','sigiriya-view')");
    db.run("DELETE FROM room_facilities WHERE room_id IN ('sunrise-loft','sigiriya-view')");
    db.run("DELETE FROM rooms WHERE id IN ('sunrise-loft','sigiriya-view')");
    db.run("INSERT OR REPLACE INTO rooms (id, name, price, total_quantity, room_type, condition, description, image_url) VALUES ('viewpoint-access', 'Viewpoint Access Pass', 40, 10, 'Short Access', 'Excellent', 'Short access pass for the viewpoint for 1-2 hours, ideal for a quick visit rather than an overnight stay.', 'assets/images/viewpoint-scenery/dambulla-tiger-rock-viewpoint-1.jpeg')");
    db.run("DELETE FROM room_amenities WHERE room_id='viewpoint-access'");
    db.run("DELETE FROM room_facilities WHERE room_id='viewpoint-access'");
    db.run("DELETE FROM room_enhancements WHERE room_id='viewpoint-access'");
    db.run("INSERT INTO room_amenities (room_id, name) VALUES ('viewpoint-access','Panoramic Views'), ('viewpoint-access','Short Visit Window'), ('viewpoint-access','Photo Friendly')");
    db.run("INSERT INTO room_facilities (room_id, name) VALUES ('viewpoint-access','Trail Access'), ('viewpoint-access','Entry Ticket'), ('viewpoint-access','Guidance Available')");
    db.run("INSERT INTO room_enhancements (room_id, name, price) VALUES ('viewpoint-access','Sunrise Add-On', 15), ('viewpoint-access','Photography Guide', 20)");
    db.all('SELECT id, name FROM rooms ORDER BY name ASC', (err, rows) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(JSON.stringify(rows, null, 2));
      db.close();
    });
  });
});
