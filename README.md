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
index.html                 landing page
work/legacy-primo.html     case study: The Legacy Primo, Silverglades
work/j-36.html             case study: J 36, J Estates
work/care-hospitals.html   case study: Bloom Maternity, CARE Hospitals
styles.css                 all styling
main.js                    reveals, nav, tabs, lightbox, view cursor, clock
assets/img/                portrait and campaign images (shown only on case pages)
assets/logos/              14 client logos + 2 agency logos, whitespace-trimmed
assets/abhijith-t-cv.pdf   file behind every "Download CV" link
serve.ps1                  local preview server, not needed on GitHub
```

## Editing

- **Colours and fonts** live at the top of `styles.css` under `:root`: midnight navy grounds
  (`--bg`, `--bg-2`, `--surface`), ivory type (`--ink`), and champagne gold (`--accent`,
  `--gold-grad`) used sparingly for highlights and the primary button. Logos sit on ivory
  tiles (`--tile`). Type is Bebas Neue for display and Jost for text.
- **The hero headline** is hand-broken into three `.line` spans (no wrapping). If you
  rewrite it, keep each line short or lower the `.hero__h1` font-size clamp.
- **Layout** runs on one 12-column grid (`.grid`) inside one container width, so
  everything lines up to the same edges. Keep new blocks on that grid.
- **Logos** sit in a 7-column grid (2 columns on phones), so 14 marks always make
  complete rows. If you add one, add them in sevens or change the column count in
  `.logos`. A white logo needs `class="logo logo--dark"`; a full-colour square uses
  `logo--fill`.
- **Adding a project:** copy a file in `work/`, swap the copy and images, add a matching
  `<a class="wrow">` row in the work section of `index.html`, and update the
  "Next project" links so they chain.
- **To swap the CV**, overwrite `assets/abhijith-t-cv.pdf` with the same filename.
