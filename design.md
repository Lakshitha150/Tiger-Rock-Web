# Dambulla Tiger Rock - Design System Specification

This document details the visual style, colors, typography, components, and animations compiled from the visual analysis of the luxury resort web design system, adapted for **Dambulla Tiger Rock**.

---

## 🎨 Color Palette & Themes

The website uses an earthy, organic luxury palette, blending deep natural forest backdrops with soft ivory text and warm gold highlights to evoke Sri Lanka's jungle summits.

| Color Name | Hex Code | Role in Interface | Visual Vibe |
| :--- | :--- | :--- | :--- |
| **Forest Green** | `#2C332C` | Dominant brand backdrop, solid sections, dark container frames | Deep, grounding jungle |
| **Moss Green** | `#525646` | Secondary panels, borders, text labels, and form backgrounds | Natural foliage |
| **Pine Green** | `#787C68` | Active filters, secondary CTA buttons, cards, hover backgrounds | Earthy, welcoming |
| **Ivory** | `#EAEBE8` | Primary text color, light-block backgrounds, menu labels | Soft, luxurious white |
| **Sunrise Gold** | `#F4C430` | Active highlights, primary CTA buttons (e.g. *Book Now* / *Check Availability*) | Warm sunrise glow |

### Color Usage Guide
- **Backgrounds:** Use `#2C332C` (Forest Green) for the overall body and dark-themed pages. For modals or input boxes, use a semi-transparent version or `#525646` (Moss Green).
- **Borders:** Thin borders (`1px solid rgba(234, 235, 232, 0.15)`) separate items in grids and outline form boxes.
- **Glassmorphism:** Navigation bar and booking bar overlays use a high-blur transparent background:
  ```css
  background: rgba(44, 51, 44, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(234, 235, 232, 0.1);
  ```

---

## font-family: Typography

A classic editorial pairing that contrasts sophisticated serif headings with highly legible, clean sans-serif interfaces.

- **Headings & Key Quotations:**
  - **Primary Font:** `Garamond`, `Georgia`, or `Playfair Display` (Serif).
  - **Style:** Light or Regular weight, italicized in select headers (e.g., *Experience Nature in Luxury*).
  - **Text-transform:** Uppercase for main titles (e.g., `HOME SCREEN`, `WORK PROCESS`), title case for copy.
- **Body, Inputs & Interface Controls:**
  - **Primary Font:** `Poppins` or `Inter` (Sans-Serif).
  - **Weights:** Light (300), Regular (400), Medium (500), Semi-Bold (600).
  - **Role:** Handles room details, input labels, pricing, check-out forms, and table directories.

---

## 🧱 Key Interface Elements

### 1. The Glassmorphism Booking Bar
A central capsule-shaped booking interface positioned at the bottom of the Hero section or sticky at the page header.
- **Structure:** Divided into three interactive zones separated by vertical line borders:
  1. **Check In:** Displays arrival date selector.
  2. **Check Out:** Displays departure date selector.
  3. **Guest:** Pax dropdown (e.g., "2 Guests").
- **CTA:** A rounded rectangular button in Sunrise Gold (`#F4C430`) or Sage Green (`#787C68`) reading "Check Availability".

### 2. Category & Grid Cards
- **Accommodation Grid:** 3-column grid showing `Rooms`, `Suites`, and `Villas`. Features cards with a slightly tall aspect ratio, rounded corners (`border-radius: 16px`), image backgrounds, and central title overlays with arrow indicators.
- **Room Listing Card:** Top-rounded images, card body with dark green background, thin white borders, wish-list heart icon in the corner, and a clear `Book Now` CTA button.

---

## ⚙️ Interactive States & Micro-Animations

- **Hover States:**
  - **Grid Cards:** Shift upward slightly (`transform: translateY(-5px)`) and scale (`transform: scale(1.02)`) with a smooth transition.
  - **Buttons:** Background color morphs from Pine Green (`#787C68`) or Forest Green (`#2C332C`) to Sunrise Gold (`#F4C430`), with text color flipping to dark.
  - **Service Accordion:** Expanding service list items (Accommodations, Dining, Wellness) shift the arrow icon `↗` horizontally.
- **Transitions:**
  - Standard transition speed is `300ms` using `ease-in-out` timing:
    ```css
    transition: all 0.3s ease-in-out;
    ```
- **Modal Blurs:** When the Booking Flow overlay launches, the background blur transitions from `blur(0px)` to `blur(10px)` with a semi-transparent dark overlay fade-in.
