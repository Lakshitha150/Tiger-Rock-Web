document.addEventListener('DOMContentLoaded', async () => {
  const bookingsList = document.getElementById('bookings-list');
  const roomSelect = document.getElementById('admin-room');
  const adminForm = document.getElementById('admin-form');

  // Load Rooms for Select
  try {
    const res = await fetch('http://localhost:3000/api/rooms');
    const rooms = await res.json();
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = room.name;
      roomSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load rooms');
  }

  // Load Bookings
  const loadBookings = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/bookings');
      const bookings = await res.json();
      
      bookingsList.innerHTML = '';
      if (bookings.length === 0) {
        bookingsList.innerHTML = '<tr><td colspan="6">No bookings found.</td></tr>';
        return;
      }

      bookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>TR-${b.id}</td>
          <td>${b.guest_name}</td>
          <td>${b.room_name}</td>
          <td>${b.checkIn} to ${b.checkOut}</td>
          <td>$${b.total_cost || 0}</td>
          <td><button class="btn-delete" data-id="${b.id}">Delete</button></td>
        `;
        bookingsList.appendChild(tr);
      });

      // Bind delete buttons
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if(confirm('Are you sure you want to delete this booking?')) {
            const id = e.target.getAttribute('data-id');
            await fetch(`http://localhost:3000/api/bookings/${id}`, { method: 'DELETE' });
            loadBookings();
          }
        });
      });
    } catch (err) {
      bookingsList.innerHTML = '<tr><td colspan="6">Error loading bookings. Is server running?</td></tr>';
    }
  };

  loadBookings();

  // Submit Manual Booking
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const guestName = document.getElementById('admin-name').value;
    const room_id = document.getElementById('admin-room').value;
    const checkIn = document.getElementById('admin-checkin').value;
    const checkOut = document.getElementById('admin-checkout').value;

    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id, checkIn, checkOut, guestName, 
          guestEmail: 'manual@tigerrock.com', guestPhone: 'N/A', guests: 1, totalCost: 0, source: 'manual'
        })
      });
      const data = await res.json();
      if(data.success) {
        adminForm.reset();
        loadBookings();
      } else {
        alert('Failed to add: ' + data.error);
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  });
});
