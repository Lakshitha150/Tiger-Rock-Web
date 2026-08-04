# Tiger Rock Site Memory

This file is the quick reference for the current website structure, room data, and the fields the admin panel edits.

## Source Of Truth

- Room data comes from `GET /api/rooms`
- Admin updates go through `admin.html`
- `booking.html` and `cabanas.html` both render from the API
- If `room_type` or `condition` is blank, the UI falls back to safe defaults

## Live Pages

- `index.html` - home page
- `cabanas.html` - room showcase
- `experiences.html` - experiences page
- `booking.html` - booking request page
- `admin.html` - admin panel

## Room Fields

- `id`
- `name`
- `price`
- `total_quantity`
- `room_type`
- `condition`
- `description`
- `image_url`
- `amenities`
- `facilities`

## Current Room Records

### `Cabana-1`

- Name: Deluxe Room with Mountain View
- Room type: blank in the legacy record
- Condition: blank in the legacy record
- Price: `40`
- Quantity: `2`
- Description: Rustic eco-luxury A-frame with mezzanine sleeping deck and jungle views
- Amenities: Two Floors, Mini Fridge, Sofa Bed, Private Bathroom
- Facilities: Hot Water Shower, Air Condition

### `sunrise-loft`

- Name: The Sunrise Loft
- Room type: Signature Loft
- Condition: Excellent
- Price: `180`
- Quantity: `2`
- Description: Signature A-frame loft with mezzanine sleeping deck and forest glass walls

### `sigiriya-view`

- Name: The Sigiriya View Chalet
- Room type: View Chalet
- Condition: Excellent
- Price: `220`
- Quantity: `1`
- Description: Quiet hideaway with elevated views and a secluded feel

## Admin Workflow

- Use `admin.html` to change room name, type, condition, price, quantity, description, and image
- Use the amenities tab to add or delete amenities per room
- Use the facilities tab to add or delete facilities per room
- Delete a room from the Rooms panel if it should no longer appear on the public site

## Preview Notes

- Cabana cards should show room type and condition together with grouped amenities and facilities
- Booking cards should show room type and condition in the package preview
- The floating WhatsApp button stays fixed in the lower-right corner
- The booking bar is removed from the home page hero
