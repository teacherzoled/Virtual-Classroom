# Constellation Redesign — Plan & Status

_Mr. EdLo's Virtual Classroom · started July 22, 2026_

The site was reading as "generic." This redesign gives it a single, ownable
visual identity built around the existing starry-night theme: custom
**constellation icons** (line-art joined by glowing star nodes in a themed
"space orb"), a jaguar mascot, and glowing status pills — all theme-aware
across Night / Sunny / Cloudy / Nature.

## Shared assets (new files — link these, don't duplicate)

- **`vc-icons.js`** — constellation icon kit. Renders `data-vc-icon="…"` spans
  into themed orbs, `data-vc-toggle="…"` theme-bar glyphs, and
  `data-vc-glyph="…"` small UI glyphs (key, dashboard, paw, lock).
  Exposes `VCIcons.render(name)` and `VCIcons.glyph(name)` for JS-built markup.
  Icon accents come from the page's `--a-*` theme variables, so icons recolor
  per theme automatically.
- **`vc-constellation.css`** — styles for the kit: orb backgrounds per theme,
  glowing "Now Open" pills (`.pill-open`), orbit rings (`.orbit-wrap`),
  toggle/glyph sizing. Link BEFORE the page's own `<style>`.
- **`vc-mascot.js`** — "Balam" the jaguar. Shares the header badge with the
  logo; every ~12s he springs out, waves, blinks, and greets students
  (English → Spanish → Kriol). Finds `.site-header-logo img` automatically.
  Disable per-page with `<body data-mascot-off>`.

To add the kit to any page, in `<head>` after the Google Fonts link:
```html
<link rel="stylesheet" href="/vc-constellation.css">
```
and before `</body>` (after `/edlo-utils.js` if present):
```html
<script src="/vc-icons.js"></script>
<script src="/vc-mascot.js"></script>
```

## Done ✅

- **Hub pages** (`index.html`, `standard5/index.html`, `standard6/index.html`)
  - 6 subject icons + feature/portfolio icons swapped from emoji to constellation
  - Homepage hero = open-book-with-rising-stars illustration
  - Class numbers (5 / 6) sit in orbiting star rings; "Now Open" = glowing pill
  - Theme-bar emoji → SVG toggle glyphs
  - Login button 🔑 → key glyph; logged-in chip 👋/📊 → paw + dashboard glyphs;
    grade-lock 🔒 → lock glyph (student name kept as a TEXT NODE — XSS rule intact)
  - Welcome-banner 👋 removed (Balam greets from the header instead)
- Balam mascot live on all three hub pages
- Icon direction decided: **bespoke constellation icons beat Tabler/Phosphor**
  for the site's identity (see `outputs/icon-comparison.html` for the comparison)

## Next — decided direction

**Topic icons split (agreed July 22, 2026):**

1. **Existing topic cards → orb-wrap the emoji** (cheap, consistent).
   Pages: `standard5/science/index.html`, `standard6/science/index.html`,
   `standard6/spanish/index.html` — grids of topic cards (fossil fuels,
   hurricanes, la familia, ciberseguridad, …), ~60+ distinct emoji total.
   Plan: add a small helper so `.card-icon` emoji render inside the same
   themed space-orb the subject icons use — one CSS/JS change, no per-topic
   mapping, keeps every emoji but makes the grid look designed and part of the
   system. Also link the constellation kit + Balam on these three hubs.
   _Do NOT hand-draw 60+ icons — disproportionate._

2. **Future content → bespoke constellation icons.**
   Any NEW subject/topic/page built from here on gets a proper hand-drawn
   constellation icon added to `vc-icons.js` (same quality as the 6 subjects).

3. **Assessment pages (~37: 19 tests, 4 quizzes, 14 lessons) → optional.**
   No subject-icon grids, already share `vc-theme.css`. Only optional gain is
   Balam in the header — a one-line find-and-replace to add `vc-mascot.js`
   (+ `vc-constellation.css` if the glyphs are ever used there). Lowest priority.

## Notes

- Absolute paths (`/vc-icons.js` etc.) are correct for the deployed GitHub
  Pages site; they only fail on local `file://` double-click. For local preview
  use the relative-path copies in `outputs/site-preview/`, or run
  `python -m http.server` from the repo root.
- Commits/pushes are handled in VS Code with the Claude Code plugin.
