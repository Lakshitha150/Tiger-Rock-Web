# Dambulla Tiger Rock - Design System Specification

This document details the visual style, colors, typography, components, and animations for Dambulla Tiger Rock.

---

## Color Palette and Themes

The website uses an earthy, organic luxury palette, blending deep forest backdrops with soft ivory text and warm gold highlights.

| Color Name | Hex Code | Role in Interface | Visual Vibe |
| :--- | :--- | :--- | :--- |
| Forest Green | `#2C332C` | Dominant brand backdrop, solid sections, dark container frames | Deep, grounding jungle |
| Moss Green | `#525646` | Secondary panels, borders, labels, and form backgrounds | Natural foliage |
| Pine Green | `#787C68` | Active filters, secondary CTA buttons, cards, hover backgrounds | Earthy, welcoming |
| Ivory | `#EAEBE8` | Primary text color, light-block backgrounds, menu labels | Soft, luxurious white |
| Sunrise Gold | `#F4C430` | Active highlights, primary CTA buttons, booking accents | Warm sunrise glow |

### Color Usage Guide
- Use `#2C332C` for the overall body background and dark-themed sections.
- Use semi-transparent dark panels with thin borders for cards, forms, and overlays.
- Use `#F4C430` for primary CTAs, active states, and highlighted copy.
- Avoid purple-heavy accents or flat white page design. The brand should feel warm, natural, and premium.

---

## Typography

A classic editorial pairing creates the premium feel:

- Headings and quotes use `Playfair Display`, `Georgia`, or similar serif styling.
- Body copy, labels, forms, and interface controls use `Poppins` or `Inter`.
- Large titles can use italic emphasis on a single word or phrase.
- Uppercase labels are reserved for kicker text, section tags, and button microcopy.

---

## Key Interface Elements

### 1. Glassmorphism Booking Bar
A central capsule-shaped booking interface positioned at the bottom of the hero section or fixed as a booking entry point.

- Structure: check-in, check-out, and guest selection zones separated by subtle borders.
- CTA: a rounded `Book Now` or `Check Availability` button in Sunrise Gold.

### 2. Card-Based Content Grids
- Cabana cards use tall imagery, rounded corners, and dark body panels.
- Experience cards use image-first layouts with badges and compact copy blocks.
- Booking summary cards use a sticky right-column layout with a strong visual hierarchy.

### 3. Standalone Booking Page Layout
The `booking.html` page should follow a concierge-style two-column layout:

- Left column: hero copy, package cards, form fields, add-ons, and the send request button.
- Right column: sticky booking summary, selected package image, total calculation, and supporting copy.
- Package cards should feel tactile, with hover lift, image overlays, and gold outline states.
- Add-on checkboxes should use soft bordered cards rather than plain list items.

### 4. Footer and Contact Blocks
- Footer sections should remain dark, structured, and content-rich.
- Contact buttons should use gold-filled or gold-outlined CTA styling.
- Social icons should remain simple and monochrome until hover.

---

## Interactive States and Micro-Animations

- Grid cards should lift slightly on hover and scale subtly.
- Buttons should shift between Pine Green, Forest Green, Ivory, and Sunrise Gold depending on hierarchy.
- The booking summary should feel stable and premium, with minimal motion.
- Package cards on the booking page should visibly indicate the selected state through border color, lift, and stronger shadow.
- Form focus states should use a soft gold glow rather than a bright blue browser default.

---

## Booking Page Styling Notes

The booking page was inspired by the Green Breeze booking structure, but translated into Tiger Rock styling.

- Hero background: dark forest gradient with a scenic image overlay.
- Body panels: near-black green with subtle texture and soft borders.
- Summary panel: sticky, image-led, and easy to scan.
- CTA buttons: gold primary buttons and outlined secondary buttons.
- Tone: concierge-led, calm, premium, and direct.

---

## Responsive Behavior

- Multi-column booking layouts collapse to a single column on tablets and phones.
- Package cards stack vertically before the summary panel.
- CTA buttons expand to full width on small screens.
- Forms keep generous padding and large tap targets.
- All pages should preserve readable spacing and avoid cramped layouts.
