document.addEventListener('DOMContentLoaded', () => {
  const bookingsList = document.getElementById('bookings-list');
  const roomsList = document.getElementById('rooms-list');
  const roomForm = document.getElementById('room-form');
  const roomClearBtn = document.getElementById('room-clear');
  const roomId = document.getElementById('room-id');
  const roomName = document.getElementById('room-name');
  const roomType = document.getElementById('room-type');
  const roomCondition = document.getElementById('room-condition');
  const roomPrice = document.getElementById('room-price');
  const roomPriceUnit = document.getElementById('room-price-unit');
  const roomQty = document.getElementById('room-qty');
  const roomIsOffer = document.getElementById('room-is-offer');
  const roomOfferText = document.getElementById('room-offer-text');
  const roomDescription = document.getElementById('room-description');
  const roomImage = document.getElementById('room-image');
  const roomImagePick = document.getElementById('room-image-pick');
  const roomImagePreview = document.getElementById('room-image-preview');
  const amenityRoom = document.getElementById('amenity-room');
  const facilityRoom = document.getElementById('facility-room');
  const enhancementRoom = document.getElementById('enhancement-room');
  const amenityName = document.getElementById('amenity-name');
  const facilityName = document.getElementById('facility-name');
  const enhancementName = document.getElementById('enhancement-name');
  const enhancementPrice = document.getElementById('enhancement-price');
  const amenityAddBtn = document.getElementById('amenity-add');
  const facilityAddBtn = document.getElementById('facility-add');
  const enhancementAddBtn = document.getElementById('enhancement-add');
  const amenityEditId = document.getElementById('amenity-edit-id');
  const facilityEditId = document.getElementById('facility-edit-id');
  const enhancementEditId = document.getElementById('enhancement-edit-id');
  const amenitiesList = document.getElementById('amenities-list');
  const facilitiesList = document.getElementById('facilities-list');
  const enhancementsList = document.getElementById('enhancements-list');
  const galleryModal = document.getElementById('gallery-modal');
  const galleryModalClose = document.getElementById('gallery-modal-close');
  const galleryPickerGrid = document.getElementById('gallery-picker-grid');
  const galleryFilterButtons = document.querySelectorAll('.gallery-filter-btn');
  const tabButtons = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');

  let roomsCache = [];
  let galleryCache = [];
  let activeGalleryFilter = 'all';
  let editingRoomId = '';
  const adminLoginModal = document.getElementById('admin-login-modal');
  const googleLoginForm = document.getElementById('google-email-login-form');
  const loginGoogleEmail = document.getElementById('login-google-email');
  const loginStatusMsg = document.getElementById('login-status-msg');
  const adminUserProfile = document.getElementById('admin-user-profile');
  const userDisplayEmail = document.getElementById('user-display-email');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

  const clearAuthState = () => {
    localStorage.removeItem('tr_admin_token');
    localStorage.removeItem('tr_admin_email');
    sessionStorage.removeItem('tr_admin_token');
    sessionStorage.removeItem('tr_admin_email');
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('tr_admin_token') || sessionStorage.getItem('tr_admin_token');
    const userEmail = localStorage.getItem('tr_admin_email') || sessionStorage.getItem('tr_admin_email');
    
    if (token && userEmail) {
      if (adminLoginModal) adminLoginModal.style.display = 'none';
      if (adminUserProfile) adminUserProfile.style.display = 'flex';
      if (userDisplayEmail) userDisplayEmail.textContent = 'User: ' + userEmail;
      return true;
    } else {
      if (adminLoginModal) adminLoginModal.style.display = 'flex';
      if (adminUserProfile) adminUserProfile.style.display = 'none';
      return false;
    }
  };

  const performGoogleLogin = async (payload) => {
    try {
      if (loginStatusMsg) {
        loginStatusMsg.style.color = 'var(--color-gold)';
        loginStatusMsg.textContent = 'Verifying Google authorization...';
      }
      const res = await fetch(`${apiBase}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const rawBody = await res.text();
      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json') || rawBody.trim().startsWith('{');
      const data = isJson ? JSON.parse(rawBody) : null;

      if (!res.ok) {
        if (loginStatusMsg) {
          loginStatusMsg.style.color = '#ff6b6b';
          if (!isJson && rawBody.trim().startsWith('<')) {
            loginStatusMsg.textContent = 'The admin API returned HTML instead of JSON. Make sure the Node server is running and open the site through `http://localhost:3000/admin.html`.';
          } else {
            loginStatusMsg.textContent = (data && data.error) || 'Authorization failed';
          }
        }
        return false;
      }

      localStorage.setItem('tr_admin_token', data.token);
      localStorage.setItem('tr_admin_email', data.user.email);

      if (loginStatusMsg) {
        loginStatusMsg.style.color = '#51cf66';
        loginStatusMsg.textContent = 'Access granted! Loading dashboard...';
      }

      setTimeout(() => {
        checkAuthStatus();
        refreshAll();
      }, 400);
      return true;
    } catch (err) {
      if (loginStatusMsg) {
        loginStatusMsg.style.color = '#ff6b6b';
        loginStatusMsg.textContent = 'Login Error: ' + err.message;
      }
      return false;
    }
  };

  window.handleGoogleCredentialResponse = (response) => {
    if (response && response.credential) {
      performGoogleLogin({ credential: response.credential });
    }
  };

  if (googleLoginForm) {
    googleLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginGoogleEmail.value.trim();
      if (email) {
        performGoogleLogin({ email: email });
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      clearAuthState();
      checkAuthStatus();
    });
  }

  // Check auth status immediately on page load
  checkAuthStatus();

  const api = async (path, options = {}) => {
    const token = localStorage.getItem('tr_admin_token') || sessionStorage.getItem('tr_admin_token');
    const headers = {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${apiBase}${path}`, { ...options, headers });
    const rawBody = await res.text();
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json') || rawBody.trim().startsWith('{');
    const data = isJson ? JSON.parse(rawBody) : null;
    if (res.status === 401 || res.status === 403) {
      clearAuthState();
      checkAuthStatus();
      throw new Error((data && data.error) || 'Session expired. Please sign in again.');
    }
    if (!res.ok) {
      if (!isJson && rawBody.trim().startsWith('<')) {
        throw new Error('The admin API returned HTML instead of JSON. Make sure the Node server is running and open the site through `http://localhost:3000/admin.html`.');
      }
      throw new Error((data && data.error) || 'Request failed');
    }
    return data;
  };

  const updateImagePreview = (value) => {
    if (!roomImagePreview) return;
    const src = (value || '').trim();
    if (!src) {
      roomImagePreview.innerHTML = 'No image selected';
      return;
    }
    roomImagePreview.innerHTML = `<img src="${src}" alt="Selected room image preview">`;
  };

  const openGalleryPicker = () => {
    galleryModal.classList.add('show');
    galleryModal.setAttribute('aria-hidden', 'false');
  };

  const closeGalleryPicker = () => {
    galleryModal.classList.remove('show');
    galleryModal.setAttribute('aria-hidden', 'true');
  };

  const renderGalleryPicker = () => {
    const filtered = activeGalleryFilter === 'all'
      ? galleryCache
      : galleryCache.filter((item) => item.category === activeGalleryFilter);

    if (!filtered.length) {
      galleryPickerGrid.innerHTML = '<p class="muted">No images found for this category.</p>';
      return;
    }

    galleryPickerGrid.innerHTML = filtered.map((item) => `
      <button type="button" class="gallery-picker-item" data-path="${item.filepath}" data-caption="${item.caption}">
        <img src="${item.filepath}" alt="${item.caption}">
        <div class="gallery-meta">
          <strong>${item.caption}</strong>
          <span>${item.category}</span>
        </div>
      </button>
    `).join('');

    galleryPickerGrid.querySelectorAll('.gallery-picker-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        roomImage.value = btn.dataset.path;
        updateImagePreview(btn.dataset.path);
        closeGalleryPicker();
      });
    });
  };

  const loadGallery = async () => {
    try {
      galleryCache = await fetch('assets/images/gallery-memory.json').then((res) => res.json());
      renderGalleryPicker();
    } catch (err) {
      galleryPickerGrid.innerHTML = `<p class="muted">Gallery load failed: ${err.message}</p>`;
    }
  };

  const setTab = (tabName) => {
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabName));
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === `panel-${tabName}`);
    });
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });

  const resetRoomForm = () => {
    editingRoomId = null;
    roomForm.reset();
    roomId.disabled = false;
    document.getElementById('room-category').value = 'cabana';
    if (roomPriceUnit) roomPriceUnit.value = 'per night';
    updateImagePreview('');
    const submitBtn = roomForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Save Room';
  };

  const renderRoomSelectors = () => {
    const selectHtml = roomsCache.map((room) => `<option value="${room.id}">${room.name}</option>`).join('');
    amenityRoom.innerHTML = selectHtml || '<option value="">No rooms</option>';
    facilityRoom.innerHTML = selectHtml || '<option value="">No rooms</option>';
    enhancementRoom.innerHTML = selectHtml || '<option value="">No rooms</option>';
  };

  const renderRooms = () => {
    if (!roomsCache.length) {
      roomsList.innerHTML = '<p class="muted">No rooms found.</p>';
      return;
    }

    roomsList.innerHTML = roomsCache.map((room) => {
      const amenities = (room.amenities || []).map((item) => `<span class="chip">${item.name}</span>`).join('') || '<span class="chip">No amenities</span>';
      const facilities = (room.facilities || []).map((item) => `<span class="chip">${item.name}</span>`).join('') || '<span class="chip">No facilities</span>';
      const offerBadge = room.is_offer ? `<span style="background:var(--color-gold);color:#000;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;">🔥 ${room.offer_text || 'OFFER'}</span>` : '';
      return `
        <div class="room-item">
          <div style="flex:1;">
            <h4 style="margin:0 0 6px;">${room.name} <small style="opacity:0.6;font-weight:400;margin-left:8px;">${room.type}</small></h4>
            <p class="muted" style="font-size:13px;margin:0;">$${room.price} ${room.price_unit} &bull; Qty: ${room.total_quantity} &bull; ${room.room_type} &bull; ${room.condition}</p>
            ${offerBadge ? `<div style="margin-top:6px;">${offerBadge}</div>` : ''}
            <p style="margin-top:10px;">${room.description || ''}</p>
            <p class="field-label" style="margin-top:12px;">Amenities</p>
            <div class="chip-list">${amenities}</div>
            <p class="field-label" style="margin-top:12px;">Facilities</p>
            <div class="chip-list">${facilities}</div>
          </div>
          <div class="inline-actions" style="display:flex;gap:10px;">
            <button class="btn-secondary edit-room" data-id="${room.id}">Edit</button>
            <button class="btn-secondary delete-room" data-id="${room.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.edit-room').forEach((btn) => {
      btn.addEventListener('click', () => {
        const room = roomsCache.find((item) => item.id === btn.dataset.id);
        if (!room) return;
        editingRoomId = room.id;
        roomId.value = room.id;
        roomId.disabled = true;
        roomName.value = room.name;
        document.getElementById('room-category').value = room.type || 'cabana';
        roomType.value = room.room_type || '';
        roomCondition.value = room.condition || 'Excellent';
        roomPrice.value = room.price;
        roomPriceUnit.value = room.price_unit || 'per night';
        roomQty.value = room.total_quantity;
        roomIsOffer.checked = !!room.is_offer;
        roomOfferText.value = room.offer_text || '';
        roomDescription.value = room.description || '';
        roomImage.value = room.image_url || '';
        updateImagePreview(roomImage.value);
        
        // Visual feedback & auto-scroll
        const submitBtn = roomForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = `Update "${room.name}"`;
        
        setTab('rooms');
        roomForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    document.querySelectorAll('.delete-room').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this room and its amenities/facilities?')) return;
        try {
          await api(`/api/admin/rooms/${btn.dataset.id}`, { method: 'DELETE' });
          await refreshAll();
        } catch (err) {
          alert('Failed to delete room: ' + err.message);
        }
      });
    });
  };

  const renderChildLists = () => {
    const selectedAmenityRoomId = amenityRoom.value || roomsCache[0]?.id || '';
    const selectedFacilityRoomId = facilityRoom.value || roomsCache[0]?.id || '';
    const selectedEnhancementRoomId = enhancementRoom.value || roomsCache[0]?.id || '';
    const selectedRoomAmenities = roomsCache.find((room) => room.id === selectedAmenityRoomId)?.amenities || [];
    const selectedRoomFacilities = roomsCache.find((room) => room.id === selectedFacilityRoomId)?.facilities || [];
    const selectedRoomEnhancements = roomsCache.find((room) => room.id === selectedEnhancementRoomId)?.enhancements || [];

    amenitiesList.innerHTML = selectedRoomAmenities.length
      ? selectedRoomAmenities.map((item) => `
          <div class="list-item">
            <span>${item.name}</span>
            <div class="inline-actions">
              <button class="btn-secondary edit-amenity" data-id="${item.id}" data-name="${item.name}">Edit</button>
              <button class="btn-delete delete-amenity" data-id="${item.id}">Delete</button>
            </div>
          </div>
        `).join('')
      : '<p class="muted">No amenities yet.</p>';

    facilitiesList.innerHTML = selectedRoomFacilities.length
      ? selectedRoomFacilities.map((item) => `
          <div class="list-item">
            <span>${item.name}</span>
            <div class="inline-actions">
              <button class="btn-secondary edit-facility" data-id="${item.id}" data-name="${item.name}">Edit</button>
              <button class="btn-delete delete-facility" data-id="${item.id}">Delete</button>
            </div>
          </div>
        `).join('')
      : '<p class="muted">No facilities yet.</p>';

    enhancementsList.innerHTML = selectedRoomEnhancements.length
      ? selectedRoomEnhancements.map((item) => `
          <div class="list-item">
            <span>${item.name} • $${Number(item.price || 0).toFixed(2)}</span>
            <div class="inline-actions">
              <button class="btn-secondary edit-enhancement" data-id="${item.id}" data-name="${item.name}" data-price="${item.price || 0}">Edit</button>
              <button class="btn-delete delete-enhancement" data-id="${item.id}">Delete</button>
            </div>
          </div>
        `).join('')
      : '<p class="muted">No enhancements yet.</p>';

    document.querySelectorAll('.edit-amenity').forEach((btn) => {
      btn.addEventListener('click', () => {
        amenityEditId.value = btn.dataset.id;
        amenityName.value = btn.dataset.name;
        amenityName.focus();
      });
    });

    document.querySelectorAll('.edit-facility').forEach((btn) => {
      btn.addEventListener('click', () => {
        facilityEditId.value = btn.dataset.id;
        facilityName.value = btn.dataset.name;
        facilityName.focus();
      });
    });

    document.querySelectorAll('.edit-enhancement').forEach((btn) => {
      btn.addEventListener('click', () => {
        enhancementEditId.value = btn.dataset.id;
        enhancementName.value = btn.dataset.name;
        enhancementPrice.value = btn.dataset.price;
        enhancementName.focus();
      });
    });

    document.querySelectorAll('.delete-amenity').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await api(`/api/admin/amenities/${btn.dataset.id}`, { method: 'DELETE' });
        await refreshAll();
      });
    });

    document.querySelectorAll('.delete-facility').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await api(`/api/admin/facilities/${btn.dataset.id}`, { method: 'DELETE' });
        await refreshAll();
      });
    });

    document.querySelectorAll('.delete-enhancement').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await api(`/api/admin/enhancements/${btn.dataset.id}`, { method: 'DELETE' });
        await refreshAll();
      });
    });
  };

  const loadBookings = async () => {
    const bookings = await api('/api/bookings');
    bookingsList.innerHTML = '';
    if (!bookings.length) {
      bookingsList.innerHTML = '<tr><td colspan="6">No bookings found.</td></tr>';
      return;
    }

    bookings.forEach((b) => {
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

    document.querySelectorAll('#bookings-list .btn-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this booking?')) return;
        await fetch(`/api/bookings/${btn.dataset.id}`, { method: 'DELETE' });
        await loadBookings();
      });
    });
  };

  const loadRooms = async () => {
    roomsCache = await api('/api/rooms');
    renderRoomSelectors();
    renderRooms();
    renderChildLists();
  };

  const refreshAll = async () => {
    await Promise.all([loadBookings(), loadRooms()]);
  };

  roomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetId = (editingRoomId || roomId.value).trim();
    if (!targetId) {
      alert('Room ID is required.');
      return;
    }
    
    try {
      await api('/api/admin/rooms', {
        method: 'POST',
        body: JSON.stringify({
          id: targetId,
          name: roomName.value.trim(),
          price: Number(roomPrice.value),
          price_unit: roomPriceUnit.value,
          total_quantity: Number(roomQty.value),
          room_type: roomType.value.trim(),
          condition: roomCondition.value,
          description: roomDescription.value.trim(),
          image_url: roomImage.value.trim(),
          type: document.getElementById('room-category').value,
          is_offer: roomIsOffer.checked,
          offer_text: roomOfferText.value.trim()
        })
      });
      alert('Room saved successfully!');
      resetRoomForm();
      await refreshAll();
    } catch (err) {
      alert('Failed to save room: ' + err.message);
    }
  });

  roomClearBtn.addEventListener('click', () => {
    resetRoomForm();
  });

  roomImage.addEventListener('input', () => {
    updateImagePreview(roomImage.value);
  });

  roomImagePick.addEventListener('click', async () => {
    if (!galleryCache.length) {
      await loadGallery();
    }
    openGalleryPicker();
  });

  galleryModalClose.addEventListener('click', closeGalleryPicker);
  galleryModal.addEventListener('click', (event) => {
    if (event.target === galleryModal) {
      closeGalleryPicker();
    }
  });

  galleryFilterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      galleryFilterButtons.forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      activeGalleryFilter = btn.dataset.filter;
      renderGalleryPicker();
    });
  });

  amenityRoom.addEventListener('change', renderChildLists);
  facilityRoom.addEventListener('change', renderChildLists);
  enhancementRoom.addEventListener('change', renderChildLists);

  amenityAddBtn.addEventListener('click', async () => {
    const roomIdValue = amenityRoom.value;
    const name = amenityName.value.trim();
    if (!roomIdValue || !name) return alert('Select a room and enter an amenity.');
    if (amenityEditId.value) {
      await api(`/api/admin/amenities/${amenityEditId.value}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
    } else {
      await api(`/api/admin/rooms/${roomIdValue}/amenities`, {
        method: 'POST',
        body: JSON.stringify({ name })
      });
    }
    amenityEditId.value = '';
    amenityName.value = '';
    await refreshAll();
  });

  facilityAddBtn.addEventListener('click', async () => {
    const roomIdValue = facilityRoom.value;
    const name = facilityName.value.trim();
    if (!roomIdValue || !name) return alert('Select a room and enter a facility.');
    if (facilityEditId.value) {
      await api(`/api/admin/facilities/${facilityEditId.value}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
    } else {
      await api(`/api/admin/rooms/${roomIdValue}/facilities`, {
        method: 'POST',
        body: JSON.stringify({ name })
      });
    }
    facilityEditId.value = '';
    facilityName.value = '';
    await refreshAll();
  });

  enhancementAddBtn.addEventListener('click', async () => {
    const roomIdValue = enhancementRoom.value;
    const name = enhancementName.value.trim();
    const price = Number(enhancementPrice.value || 0);
    if (!roomIdValue || !name) return alert('Select a room and enter an enhancement.');
    if (enhancementEditId.value) {
      await api(`/api/admin/enhancements/${enhancementEditId.value}`, {
        method: 'PUT',
        body: JSON.stringify({ name, price })
      });
    } else {
      await api(`/api/admin/rooms/${roomIdValue}/enhancements`, {
        method: 'POST',
        body: JSON.stringify({ name, price })
      });
    }
    enhancementEditId.value = '';
    enhancementName.value = '';
    enhancementPrice.value = '';
    await refreshAll();
  });

  updateImagePreview(roomImage.value);
  loadGallery();
  refreshAll().catch((err) => {
    bookingsList.innerHTML = `<tr><td colspan="6">Error: ${err.message}</td></tr>`;
  });
});


