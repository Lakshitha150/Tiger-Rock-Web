document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. SCROLL HEADER EFFECT
     ========================================== */
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* ==========================================
     2. MOBILE MENU OVERLAY
     ========================================== */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-overlay a');

  const toggleMenu = () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    // Simple bar animation toggling
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
      spans[0].style.transform = 'translateY(8px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  };

  hamburger.addEventListener('click', toggleMenu);
  mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

  /* ==========================================
     3. SERVICE ACCORDIONS
     ========================================== */
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    item.addEventListener('click', () => {
      // Close other active items
      accordionItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      // Toggle current
      item.classList.toggle('active');
    });
  });

  /* ==========================================
     4. TESTIMONIALS SLIDER
     ========================================== */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  let currentSlide = 0;
  let autoplayTimer;

  const showSlide = (index) => {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  };

  const nextSlide = () => {
    showSlide(currentSlide + 1);
  };

  // Click handler for dots
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      resetAutoplay();
    });
  });

  const startAutoplay = () => {
    autoplayTimer = setInterval(nextSlide, 6000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  if (slides.length > 0) {
    showSlide(0);
    startAutoplay();
  }

  /* ==========================================
     5. DYNAMIC BOOKING FLOW ENGINE
     ========================================== */
  
  // Data Store for the active booking session
  const bookingData = {
    checkIn: '',
    checkOut: '',
    guests: '2',
    nights: 1,
    selectedRoom: {
      id: '',
      name: '',
      price: 0
    },
    guestDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    couponCode: '',
    discount: 0,
    totalCost: 0
  };

  // Room Inventory details matching index card representations
  const roomInventory = {
    'sunrise-loft': { name: 'The Sunrise Loft', price: 180 },
    'sigiriya-view': { name: 'The Sigiriya View Chalet', price: 220 }
  };

  const bookingModal = document.querySelector('.booking-modal-overlay');
  const openModalBtns = document.querySelectorAll('.open-booking');
  const closeModalBtn = document.querySelector('.close-modal');
  const wizardSteps = document.querySelectorAll('.wizard-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  
  let currentStep = 1;

  // Open & Close handlers
  const openBookingModal = (preCheck = false) => {
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    if (preCheck) {
      // Sync date fields from Home Page booking bar if they are filled
      const homeCheckIn = document.getElementById('home-checkin').value;
      const homeCheckOut = document.getElementById('home-checkout').value;
      const homeGuests = document.getElementById('home-guests').value;
      
      if (homeCheckIn) document.getElementById('modal-checkin').value = homeCheckIn;
      if (homeCheckOut) document.getElementById('modal-checkout').value = homeCheckOut;
      if (homeGuests) document.getElementById('modal-guests').value = homeGuests;
    }
    
    goToStep(1);
  };

  const closeBookingModal = () => {
    bookingModal.classList.remove('open');
    document.body.style.overflow = 'auto';
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Check if clicked from the home page check availability bar
      const isHomeBar = btn.id === 'home-check-availability';
      openBookingModal(isHomeBar);
    });
  });

  closeModalBtn.addEventListener('click', closeBookingModal);

  // Close when clicking outside container
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      closeBookingModal();
    }
  });

  // Steps Navigation
  const goToStep = (stepNum) => {
    currentStep = stepNum;
    
    // Toggle active step panel display
    wizardSteps.forEach(step => {
      step.classList.remove('active');
      if (parseInt(step.dataset.step) === stepNum) {
        step.classList.add('active');
      }
    });

    // Update Progress header status
    progressSteps.forEach((step, idx) => {
      const stepIdx = idx + 1;
      step.classList.remove('active', 'completed');
      if (stepIdx === stepNum) {
        step.classList.add('active');
      } else if (stepIdx < stepNum) {
        step.classList.add('completed');
      }
    });

    // Toggle Modal Footer navigation button visibilities
    if (stepNum === 1) {
      btnPrev.style.display = 'none';
      btnNext.style.display = 'block';
      btnNext.textContent = 'Choose Room →';
    } else if (stepNum === 2) {
      btnPrev.style.display = 'block';
      btnPrev.textContent = '← Dates';
      btnNext.style.display = 'block';
      btnNext.textContent = 'Guest Info →';
    } else if (stepNum === 3) {
      btnPrev.style.display = 'block';
      btnPrev.textContent = '← Rooms';
      btnNext.style.display = 'block';
      btnNext.textContent = 'Pay Now →';
      updateSummarySidebar();
    } else if (stepNum === 4) {
      btnPrev.style.display = 'block';
      btnPrev.textContent = '← Guest Info';
      btnNext.style.display = 'block';
      btnNext.textContent = 'Confirm Reservation ✔';
      updateSummarySidebar();
    } else if (stepNum === 5) {
      // Success screen hides the bottom navigation footer
      document.querySelector('.modal-footer').style.display = 'none';
    }
  };

  // Validation & Calculation Engine
  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      const checkInVal = document.getElementById('modal-checkin').value;
      const checkOutVal = document.getElementById('modal-checkout').value;
      
      if (!checkInVal || !checkOutVal) {
        alert('Please select both arrival and departure dates.');
        return false;
      }
      
      const checkInDate = new Date(checkInVal);
      const checkOutDate = new Date(checkOutVal);
      
      if (checkOutDate <= checkInDate) {
        alert('Departure date must be after the arrival date.');
        return false;
      }
      
      // Calculate nights
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      bookingData.checkIn = checkInVal;
      bookingData.checkOut = checkOutVal;
      bookingData.guests = document.getElementById('modal-guests').value;
      bookingData.nights = diffDays;
      return true;
    }
    
    if (stepNum === 2) {
      if (!bookingData.selectedRoom.id) {
        alert('Please choose a cabana to book.');
        return false;
      }
      return true;
    }
    
    if (stepNum === 3) {
      const fName = document.getElementById('cust-fname').value.trim();
      const lName = document.getElementById('cust-lname').value.trim();
      const email = document.getElementById('cust-email').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      
      if (!fName || !lName || !email || !phone) {
        alert('Please fill out all required guest fields (*).');
        return false;
      }
      
      bookingData.guestDetails = { firstName: fName, lastName: lName, email, phone };
      return true;
    }
    
    if (stepNum === 4) {
      const cardHolder = document.getElementById('pay-name').value.trim();
      const cardNumber = document.getElementById('pay-card').value.trim();
      const cardExpiry = document.getElementById('pay-expiry').value.trim();
      const cardCVC = document.getElementById('pay-cvc').value.trim();
      
      if (!cardHolder || !cardNumber || !cardExpiry || !cardCVC) {
        alert('Please input credit card details to complete payment.');
        return false;
      }
      return true;
    }
    return true;
  };

  // Rooms Grid Select Trigger
  const modalRoomCards = document.querySelectorAll('.modal-room-card');
  modalRoomCards.forEach(card => {
    card.addEventListener('click', () => {
      modalRoomCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const roomId = card.dataset.roomId;
      const roomInfo = roomInventory[roomId];
      bookingData.selectedRoom = {
        id: roomId,
        name: roomInfo.name,
        price: roomInfo.price
      };
    });
  });

  // Calculate totals and populate sidebar values
  const updateSummarySidebar = () => {
    const rate = bookingData.selectedRoom.price;
    const baseTotal = rate * bookingData.nights;
    const finalTotal = baseTotal - bookingData.discount;
    bookingData.totalCost = finalTotal;

    // Format Dates nicely
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const dateArr = new Date(bookingData.checkIn).toLocaleDateString('en-US', options);
    const dateDep = new Date(bookingData.checkOut).toLocaleDateString('en-US', options);

    // Update Step 3 & 4 summaries
    const summaries = document.querySelectorAll('.summary-sidebar');
    summaries.forEach(sidebar => {
      const roomEl = sidebar.querySelector('.sum-room');
      if (roomEl) roomEl.textContent = bookingData.selectedRoom.name;

      const arriveEl = sidebar.querySelector('.sum-arrive');
      if (arriveEl) arriveEl.textContent = dateArr;

      const departEl = sidebar.querySelector('.sum-depart');
      if (departEl) departEl.textContent = dateDep;

      const nightsEl = sidebar.querySelector('.sum-nights');
      if (nightsEl) nightsEl.textContent = `${bookingData.nights} Nights`;

      const guestsEl = sidebar.querySelector('.sum-guests');
      if (guestsEl) guestsEl.textContent = `${bookingData.guests} Guests`;

      const rateEl = sidebar.querySelector('.sum-rate');
      if (rateEl) rateEl.textContent = `$${rate} / night`;

      const subtotalEl = sidebar.querySelector('.sum-subtotal');
      if (subtotalEl) subtotalEl.textContent = `$${baseTotal.toFixed(2)}`;
      
      const discountRowEl = sidebar.querySelector('.sum-discount-row');
      const discountEl = sidebar.querySelector('.sum-discount');
      if (discountRowEl && discountEl) {
        if (bookingData.discount > 0) {
          discountRowEl.style.display = 'flex';
          discountEl.textContent = `-$${bookingData.discount.toFixed(2)}`;
        } else {
          discountRowEl.style.display = 'none';
        }
      }
      
      const totalValEl = sidebar.querySelector('.sum-total-val');
      if (totalValEl) totalValEl.textContent = `$${finalTotal.toFixed(2)}`;
    });
  };

  // Promo Coupon Code Application
  const applyCouponBtns = document.querySelectorAll('.btn-apply-coupon');
  applyCouponBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = btn.closest('.coupon-group');
      const input = parent.querySelector('input');
      const code = input.value.trim().toUpperCase();

      if (code === 'TIGER360' || code === 'WELCOME25') {
        bookingData.discount = (bookingData.selectedRoom.price * bookingData.nights) * 0.15; // 15% discount
        alert('Success! 15% promotional discount applied.');
        updateSummarySidebar();
      } else if (code) {
        alert('Invalid coupon code.');
      }
    });
  });

  // Express GPay Checkout click handler
  const gpayBtn = document.querySelector('.gpay-btn');
  if (gpayBtn) {
    gpayBtn.addEventListener('click', () => {
      // Simulate quick fill & confirm
      document.getElementById('pay-name').value = 'Google Pay User';
      document.getElementById('pay-card').value = '4111 2222 3333 4444';
      document.getElementById('pay-expiry').value = '12/28';
      document.getElementById('pay-cvc').value = '360';
      btnNext.click();
    });
  }

  // Setup Invoices values on success screen
  const generateSuccessReceipt = () => {
    const bookingId = 'TR-' + Math.floor(10000 + Math.random() * 90000);
    document.getElementById('rec-id').textContent = bookingId;
    document.getElementById('rec-name').textContent = `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`;
    document.getElementById('rec-room').textContent = bookingData.selectedRoom.name;
    document.getElementById('rec-checkin').textContent = bookingData.checkIn;
    document.getElementById('rec-checkout').textContent = bookingData.checkOut;
    document.getElementById('rec-nights').textContent = `${bookingData.nights} Nights`;
    document.getElementById('rec-total').textContent = `$${bookingData.totalCost.toFixed(2)}`;
  };

  // Next & Back Buttons bindings
  btnNext.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        goToStep(currentStep + 1);
      } else if (currentStep === 4) {
        // Complete Booking
        generateSuccessReceipt();
        goToStep(5);
      }
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  });

  // Success closing buttons
  const btnCloseSuccess = document.getElementById('btn-close-success');
  if (btnCloseSuccess) {
    btnCloseSuccess.addEventListener('click', () => {
      closeBookingModal();
      // Clean inputs
      document.getElementById('cust-fname').value = '';
      document.getElementById('cust-lname').value = '';
      document.getElementById('cust-email').value = '';
      document.getElementById('cust-phone').value = '';
      document.getElementById('pay-name').value = '';
      document.getElementById('pay-card').value = '';
      document.getElementById('pay-expiry').value = '';
      document.getElementById('pay-cvc').value = '';
      bookingData.selectedRoom = { id: '', name: '', price: 0 };
      bookingData.discount = 0;
      modalRoomCards.forEach(c => c.classList.remove('selected'));
    });
  }

  /* ==========================================
     9. PHOTO GALLERY LIGHTBOX
     ========================================== */
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const galleryItems = document.querySelectorAll('.instagram-item img');

  if (lightboxModal && lightboxImg) {
    galleryItems.forEach(img => {
      img.parentElement.addEventListener('click', () => {
        lightboxModal.classList.add('show');
        lightboxImg.src = img.src;
      });
    });

    // Close when clicking X
    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('show');
      });
    }

    // Close when clicking outside image
    lightboxModal.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        lightboxModal.classList.remove('show');
      }
    });
  }
});
