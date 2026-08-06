(function (global) {
  const DEFAULT_ROOMS_DATA = [
    {
      id: 'a-frame-cabana',
      name: 'A-Frame Cabana',
      price: 35,
      total_quantity: 2,
      room_type: 'Cabana',
      condition: 'Excellent',
      description: 'Premium boho styling, double-decker mezzanine layout, low platform bed, desk work zone, and jungle views. Includes full access to viewpoint.',
      image_url: 'assets/images/cabana-architecture/dambulla-tiger-rock-cabana-interior-13.jpeg',
      type: 'cabana',
      price_unit: 'per night',
      is_offer: 1,
      offer_text: 'Book from official website for $35',
      amenities: [
        { id: 1, name: '🛏️ Low Platform Double Bed' },
        { id: 2, name: '🪟 Floor-to-Ceiling Glass Windows' },
        { id: 3, name: '🌿 Private Jungle Views' },
        { id: 4, name: '💡 Warm Ambient Lighting' },
        { id: 5, name: '🪑 Desk Work Zone' },
        { id: 6, name: '🏔️ Mezzanine Loft Level' },
        { id: 7, name: '🚿 Attached Bathroom' },
        { id: 8, name: '🎒 Towels & Linen Provided' }
      ],
      facilities: [
        { id: 1, name: '🅿️ Free Parking' },
        { id: 2, name: '📶 Free Wi-Fi' },
        { id: 3, name: '🔒 24/7 Security' },
        { id: 4, name: '🍳 Breakfast Available' },
        { id: 5, name: '🏔️ Viewpoint Access Included' },
        { id: 6, name: '🧹 Daily Housekeeping' }
      ],
      enhancements: [
        { id: 1, name: '🍳 Breakfast Package (per person)', price: 5 },
        { id: 2, name: '🥘 Dinner Package (per person)', price: 8 },
        { id: 3, name: '🔥 BBQ Night Setup', price: 25 },
        { id: 4, name: '🕐 Late Checkout (until 2 PM)', price: 10 },
        { id: 5, name: '🚐 Airport Transfer (one way)', price: 45 },
        { id: 6, name: '🎂 Birthday / Anniversary Decoration', price: 20 },
        { id: 7, name: '🏍️ Quad Bike Add-On (per person)', price: 15 },
        { id: 8, name: 'Custom Trip Arrangement', price: 0 },
        { id: 9, name: 'Pidurangala Rock Sunrise Trip', price: 0 },
        { id: 10, name: 'Sigiriya Rock Fortress Trip', price: 6 },
        { id: 11, name: 'Wildlife Safari Trip', price: 0 }
      ]
    },
    {
      id: 'rock-trail',
      name: '360° Rock Trail & Viewpoint Pass',
      price: 6,
      total_quantity: 20,
      room_type: 'Activity',
      condition: 'Excellent',
      description: 'Hike through massive granite boulders to reach the 360° summit viewing nets, tea deck, and panoramic rock viewpoints during sunrise or sunset.',
      image_url: 'assets/images/viewpoint-scenery/dambulla-tiger-rock-viewpoint-1.jpeg',
      type: 'experience',
      price_unit: 'per person',
      is_offer: 1,
      offer_text: 'Free for foreigners',
      amenities: [
        { id: 9, name: '🌄 Panoramic 360° Summit Views' },
        { id: 10, name: '🌅 Sunrise & Sunset Sessions' },
        { id: 11, name: '📸 Photo-Friendly Spots' },
        { id: 12, name: '🧗 Guided Rock Climb' },
        { id: 13, name: '☕ Sunrise Tea Deck' }
      ],
      facilities: [
        { id: 7, name: '🥾 Trail & Summit Access' },
        { id: 8, name: '🎫 Entry Ticket Included' },
        { id: 9, name: '🧭 Guide Available' },
        { id: 10, name: '💧 Water Provided' }
      ],
      enhancements: [
        { id: 12, name: '📸 Photography Guide', price: 10 },
        { id: 13, name: '☕ Sunrise Tea & Snacks', price: 3 },
        { id: 14, name: '🔦 Sunset Session Add-On', price: 5 }
      ]
    },
    {
      id: 'quad-bike',
      name: 'Quad Bike Ride',
      price: 0,
      total_quantity: 5,
      room_type: 'Activity',
      condition: 'Excellent',
      description: 'Explore the rugged off-road pathways and nature trails around the property on our premium ATVs.',
      image_url: 'assets/images/pathways-nature/dambulla-tiger-rock-atv-adventure-1.jpeg',
      type: 'experience',
      price_unit: 'per person',
      is_offer: 0,
      offer_text: '',
      amenities: [
        { id: 14, name: '🏍️ Premium ATV Vehicles' },
        { id: 15, name: '🗺️ Guided Trail Route' },
        { id: 16, name: '🪖 Safety Helmet Provided' },
        { id: 17, name: '📸 Photo Stops Along Trail' }
      ],
      facilities: [
        { id: 11, name: '🥾 Off-Road Trail Access' },
        { id: 12, name: '🛡️ Safety Gear Included' },
        { id: 13, name: '🧑‍🏫 Instructor Supervision' },
        { id: 14, name: '🅿️ Free Parking' }
      ],
      enhancements: [
        { id: 15, name: '⏱️ Extended Ride (extra 30 min)', price: 10 },
        { id: 16, name: '👫 Dual Rider (2 persons, 1 ATV)', price: 8 },
        { id: 17, name: '📸 GoPro Recording', price: 5 }
      ]
    }
  ];

  function getStoredRooms() {
    try {
      const stored = localStorage.getItem('tiger_rock_rooms_db');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
    return DEFAULT_ROOMS_DATA;
  }

  function saveStoredRooms(rooms) {
    try {
      localStorage.setItem('tiger_rock_rooms_db', JSON.stringify(rooms));
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }

  async function fetchRoomsSmart() {
    try {
      const res = await fetch('/api/rooms');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveStoredRooms(data);
          return data;
        }
      }
    } catch (err) {
      console.log('API offline or static site host detected. Using local storage dataset.');
    }
    return getStoredRooms();
  }

  global.TigerRockDB = {
    DEFAULT_ROOMS_DATA,
    getStoredRooms,
    saveStoredRooms,
    fetchRoomsSmart
  };
})(typeof window !== 'undefined' ? window : this);
