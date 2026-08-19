# Abhijith T — portfolio

Static site. No build step, no dependencies, no framework. Plain HTML, CSS and vanilla JS.

## Run it locally

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:5173

## Deploy on GitHub Pages

1. Create a repo and push these files to the root (not inside a subfolder).
2. Repo → **Settings** → **Pages** → Source: *Deploy from a branch*, Branch: `main`, Folder: `/ (root)`.
3. The site goes live at `https://<username>.github.io/<repo>/` in about a minute.

Nothing needs configuring, `index.html` is already at the root.

## Structure

```
index.html              landing page
work/
  j-estates.html        case 01
  saan-verdante.html    case 02
  silverglades.html     case 03
  care-hospitals.html   case 04
styles.css              design system + all layout
main.js                 intro, reveals, parallax, counters, tabs, lightbox, cursor
assets/logos/           16 client and agency logos
assets/img/             portrait and case study images
assets/abhijith-t-cv.pdf
serve.ps1               local preview server (not needed for deployment)
```

## Editing

**Colours and type** are tokens at the top of `styles.css` under `:root`. Changing
`--paper` and `--ink` re-themes the entire site, including the two inverted bands.

**Adding a case study:** copy any file in `work/`, change the copy and the image
paths, then add a matching `.wcard` block to the work grid in `index.html`. Update the
"Next case" link at the bottom of the previous case so the chain stays closed.

**The hero headline** is hand-broken into three `.line` spans so the rise-in reveal
works one line at a time. If you rewrite it, keep each line short enough that it does
not re-wrap, or lower the `font-size` clamp on `.hero__h1`.

**Logos** are normalised: every tile is the same box and every mark is `object-fit:
contain` inside it, so rows stay level regardless of the source file's aspect ratio.
Add `class="logo logo--bleed"` for a mark that should fill its tile edge to edge
(Mustapure uses this).

## Still to swap in

- `assets/abhijith-t-cv.pdf` is the older resume. Overwrite it with the current one.
- The Saan Verdante and J Estates images are cropped from screenshots. If the original
  exports turn up they will be noticeably sharper.
- Testimonials are attributed by role (Founder, Mediamix / Operations Manager, Forest
  Creative Communications). Add names if you get sign-off.

## Accessibility and performance

- Respects `prefers-reduced-motion`, which disables every animation and parallax.
- Scroll reveals fall back to visible if `IntersectionObserver` never fires, so the page
  can never end up blank.
- Case study images are lazy loaded. Total page weight is around 3 MB on first load.
