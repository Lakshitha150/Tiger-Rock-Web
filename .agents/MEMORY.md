# Dambulla Tiger Rock - System Memory & Evolution Log

## Current Active Project States
- **Branding & Logo:** Stacked modern serif brand logo vector assets (`logo-light.svg`, `logo-dark.svg`) completed.
- **Google Maps / SEO:** Identity strategy finalized with the primary name target: `Tiger Rock Dambulla 360 Sunrise`.
- **Website:** Phase 1 complete. Core Landing page (`index.html`), cabana and experiences pages, the new standalone `booking.html`, vanilla CSS design system (`style.css`), and shared interaction logic (`main.js`) are in place. Real bouldering/renovation cabin photos integrated.
- **POS / Booking Engine:** Front-end interactive state engine ready for connection to future database endpoints/POS webhooks. `booking.html` now uses a concierge-style request form with package cards, add-ons, summary totals, and WhatsApp handoff.
- **Deployment:** Planning Porkbun custom domain connection and hosting integration.

## Current Site Snapshot
- **Live pages:** `index.html`, `cabanas.html`, `experiences.html`, `booking.html`, `admin.html`
- **Shared scripts:** `assets/js/main.js` powers header scroll, mobile nav, gallery helpers, and booking request behavior.
- **Shared styles:** `assets/css/style.css` provides the brand palette, cards, footer, and booking modal styles.
- **Booking page direction:** Inspired by the Green Breeze booking layout, but rebuilt with Tiger Rock colors and property-specific content.
- **Primary booking contact:** WhatsApp and phone number `+94 74 343 5434`, email `dambullatigerrock@gmail.com`.

## Critical Decisions & Lessons Learned

### 2026-07-03 (Project Genesis & Memory Structure)
- **Action:** Split original project concept document into a two-tier AI memory system (`AGENTS.md` and `MEMORY.md`).
- **Decision:** Locked in the Google Maps naming strategy to prioritize "Tiger Rock Dambulla 360 Sunrise" to capture maximum tourist search intent while avoiding messy keyword stuffing.
- **Guideline Set:** Established that the word "View Point" should be excluded from official names to preserve the premium, boutique retreat feel of the brand.
- **Bug Fixed:** Handled dynamic checkout sidebar rendering crash by checking element existence to support dual-sidebar layouts cleanly.

### 2026-08-04 (Booking Page Expansion)
- **Action:** Added a standalone `booking.html` page modeled on the structure of the Green Breeze booking page.
- **Decision:** Kept the Tiger Rock palette and visual language: deep forest backgrounds, ivory text, sunrise gold highlights, and rounded glass-style panels.
- **Implementation Detail:** Booking page includes package selection cards, arrival/departure inputs, guest details, add-on checkboxes, special requests, a summary panel, and a WhatsApp request action.
- **Safety Fix:** Hardened `assets/js/main.js` with null checks so pages without the booking modal can still load the shared JS bundle safely.

---
## Evolution Log
- **v0.1.0 (2026-07-03):** Initialized global project memory, brand positioning guidelines, and directory ecosystem framework.
- **v0.1.1 (2026-07-03):** Completed deep visual and structural analysis of the luxury booking design reference. Documented the color system, typography, interactive states, page hierarchies, and responsive mobile behaviors.
- **v0.2.0 (2026-07-03):** Implemented Phase 1 landing page, style guidelines, and booking modal check-out flow with custom local assets. Ran full browser tests and walkthrough visual capture.
