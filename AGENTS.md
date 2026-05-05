# Phantom Post — Agent Guide

## Project Overview

Phantom Post is a **single-page static marketing website** for an executive ghostwriting and reputation-infrastructure studio. It is a pure HTML/CSS/JS project with **no build step, no framework, and no package manager**. The site is designed laptop-first (1440 × 900) and targets founders, operators, and capital allocators.

- **Language**: English (US)
- **Repository name**: `new-site`
- **Live URL**: None configured in repo

## Technology Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (single file) |
| Styling | CSS3 (custom properties, Grid, Flexbox) |
| Scripting | Vanilla ES5/ES6 (IIFE modules) |
| Fonts | Clash Display, Satoshi (Fontshare); JetBrains Mono, Instrument Serif (Google Fonts) |
| Assets | Static raster images (`assets/logo.png`, `assets/testimonial.png`) |
| Build tools | **None** |
| Package manager | **None** |
| Test framework | **None** |

## File Structure

```
new-site/
├── index.html          # All markup (~977 lines)
├── styles.css          # All styles (~1627 lines)
├── script.js           # All interactivity (~703 lines)
├── assets/
│   ├── logo.png        # Brand mark (11 KB)
│   └── testimonial.png # Testimonial headshot (1.4 MB)
├── README.md           # Minimal — only "# phantom"
├── .gitignore          # Ignores styles.css.bak
├── index.html.bak      # Backup
└── styles.css.bak      # Backup
```

There are **no configuration files** such as `package.json`, `vite.config.js`, `tailwind.config.js`, etc.

## Code Organization

### HTML (`index.html`)
- One single-page file with semantic `<section>` elements.
- Sections in DOM order:
  1. Loader overlay
  2. Fixed nav header
  3. Hero (with canvas particle background)
  4. Marquee tag strip
  5. Premise / problem statement
  6. Horizon Effect (scroll-driven sticky canvas visualization)
  7. Manifesto
  8. Process (4-phase pipeline with SVG illustrations)
  9. Services (Bento grid)
  10. Proof (stats, chart, testimonials, logo strip)
  11. Contact (form + Calendly CTA)
  12. Footer
- All SVG illustrations are **inline** for animation control.
- External links: Calendly booking URL (`https://calendly.com`).

### CSS (`styles.css`)
- Uses CSS custom properties extensively in `:root` for colors, fonts, easing, and layout constants.
- Key custom properties:
  - `--orange: #FF5E00`, `--blue: #1A6AFF`
  - `--bg: #050810`, `--text: #F4F4F8`
  - `--display`, `--body`, `--serif`, `--mono`
  - `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- Layout baseline: `--container: 1680px`, `--gutter: 48px`, `--nav-h: 72px`
- Responsive breakpoints:
  - `≤ 900px` — tablet/mobile collapse
  - `≤ 600px` — phone refinements
  - `≥ 1800px` — large monitor scaling
  - `≥ 2400px` — ultrawide scaling
- Respects `prefers-reduced-motion: reduce` (disables all animations).

### JavaScript (`script.js`)
Organized as independent IIFE feature modules:

| Module | Lines | Purpose |
|--------|-------|---------|
| Loader | 8–23 | Fake progress bar on load |
| Nav scroll | 39–46 | Adds `.is-scrolled` class past 30 px |
| Reveal on scroll | 48–64 | `IntersectionObserver` for `.reveal` elements |
| Manifesto view | 66–74 | Triggers strike-through animation |
| Counters | 76–108 | Animated number counting (`data-count`) |
| Process rail | 110–129 | Scroll-driven vertical progress bar |
| Bento glow | 131–140 | Cursor-following radial glow on cards |
| Magnetic buttons | 142–162 | Buttons slightly follow cursor |
| Scramble text | 164–192 | Character scramble effect on hover |
| Proof chart reveal | 194–208 | SVG line-draw animation trigger |
| Phase IV reveal | 210–224 | Compounding graph animation trigger |
| Contact form | 226–237 | Client-side submit handler (no backend) |
| Flow-field hero | 244–383 | Canvas 2D particle system with noise field |
| Horizon effect | 385–662 | Canvas 2D scroll-driven convergence visualization |
| Recording tool | 669–702 | Press **S** to start/stop smooth auto-scroll |

## Build & Development

Because this is a static site with no build tooling:

- **To preview**: Open `index.html` directly in a browser, or serve with any static server:
  ```bash
  python -m http.server 8000
  # or
  npx serve .
  ```
- **No build command exists**.
- **No dependency installation needed**.

## Code Style Guidelines

- **Indent**: 2 spaces (observed in HTML, CSS, and JS).
- **Quotes**: Double quotes in HTML; single quotes in JS string literals.
- **CSS class naming**: kebab-case, BEM-ish but pragmatic (e.g., `.hero-title`, `.bento-card`, `.ps-art-radar`).
- **Color references**: Always use CSS custom properties (`var(--orange)`), not raw hex values, except inside gradients where the raw value is required for `rgba()` or SVG `stop-color`.
- **Comments**: Multi-line `/* ============ SECTION ============ */` banners are used in CSS and JS to separate major blocks.
- **Accessibility**:
  - `aria-hidden="true"` on decorative elements.
  - `aria-label` on nav and footer links.
  - `prefers-reduced-motion` respected globally.

## Testing Instructions

There is **no automated test suite**. Manual QA checklist:

1. Open `index.html` in Chrome, Safari, and Firefox.
2. Verify loader completes and disappears.
3. Scroll through each section; confirm IntersectionObserver reveals fire.
4. Resize to `≤ 900px` and `≤ 600px`; confirm layout collapses gracefully.
5. Enable OS “Reduce motion” setting; confirm animations are suppressed.
6. Hover over `.scramble` text and magnetic buttons; confirm effects work.
7. Submit contact form; confirm success message appears and form resets.
8. Press **S** key (outside inputs); confirm cinematic auto-scroll starts/stops.

## Deployment

Deploy by uploading the following files to any static host (GitHub Pages, Netlify, Vercel, S3, etc.):

```
index.html
styles.css
script.js
assets/logo.png
assets/testimonial.png
```

There is no CI/CD configuration in the repository.

## Security Considerations

- **No backend or API** is included. The contact form (`#contactForm`) submits to nothing; it only toggles a client-side success message. If adding a backend:
  - Add CSRF protection.
  - Validate and sanitize all fields server-side.
  - Do not expose API keys in frontend code.
- **No cookies or local storage** are used.
- External resources (fonts) are loaded over HTTPS with `preconnect` hints.

## Notable Conventions for Agents

- When editing styles, prefer updating CSS custom properties in `:root` rather than scattering raw values.
- Canvas animations use `requestAnimationFrame` and are paused via `IntersectionObserver` when off-screen to save GPU/CPU.
- Backup files (`.bak`) are generated manually; they are **not** part of the live site and are ignored by `.gitignore` only for `styles.css.bak`.
- The `.ticker` class exists in CSS but the corresponding HTML element does not appear in `index.html`; it may be a leftover from an earlier iteration.
