# Abhijith T | portfolio

Static site. Plain HTML, CSS and vanilla JS. No build step, no dependencies.

## Hosting

Hosted on Vercel (project `abheijithonline`), connected to this repo. Every push to `main`
redeploys automatically. Live at https://abheijithonline.vercel.app

Keep the folder structure intact when uploading: `index.html` at the root, case studies
inside `work/`, images inside `assets/`. No build step or framework setting is needed.

## Preview locally (optional)

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:5173

## Structure

```
index.html                 homepage: the silk hero only
about.html                 story, photo, expertise rings, clients, contact
work/legacy-primo.html     case study: The Legacy Primo, Silverglades
work/j-36.html             case study: J 36, J Estates
work/care-hospitals.html   case study: Bloom Maternity, CARE Hospitals
styles.css                 all styling
main.js                    nav, responsive headline, full-bleed liquid silk hero + About photo light effect (WebGL), scroll-lit about text, copy email, quick menu (Ctrl/Cmd K), lightbox, reveals
assets/img/                golden.jpg (colour) with golden-tone.jpg fallback for the About light effect, plus campaign images
assets/logos/              original logos; mono/ holds the single-ink versions used on the site
assets/abhijith-t-cv.pdf   file behind every "Download CV" link
serve.ps1                  local preview server, not needed on GitHub
```

## Editing

- **Colours and fonts** live at the top of `styles.css` under `:root`: espresso (`--bg`), cream (`--text`) and copper (`--copper`, hover and accents only), plus one tint per campaign (`--t-primo`, `--t-j36`, `--t-care`). Type is Manrope (light for display, regular for text), never italic.
- **Contact** is four direct links (email, LinkedIn, WhatsApp, resume). No form, no backend.
- **Quick menu**: Ctrl K / Cmd K on any page, or the key in the nav. Items live in `ITEMS` in main.js.
- **Logo sizes** on the clients wall are set per logo with `--w` in index.html so wide and square marks carry equal weight.
- **Layout** sits in one container width (`.wrap`) with a 12-column grid (label on the left, content on the right), so
  everything lines up to the same edges. Keep new blocks on that grid.
- **Adding a project:** copy a file in `work/`, swap the copy and images, add a matching
  `<a class="wcard">` card in the work section of `index.html`, and update the
  "Next project" links so they chain.
- **To swap the CV**, overwrite `assets/abhijith-t-cv.pdf` with the same filename.
