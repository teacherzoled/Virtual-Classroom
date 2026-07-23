# 🎨 Lesson Icon Library — Plan & Decisions

**Mr. EdLo's Virtual Classroom · Standard 5 Science (then all subjects)**
Agreed between Edwin and Claude, July 22, 2026. Status: **DECISIONS LOCKED — build parked for a dedicated session.**
Companion to `LESSON-ENGINE-PLAN.md` and `MECHANICS-BANK.md`.

---

## Why this exists

The lessons currently carry **emoji** (🌴 🌧️ 🚌) inside the mechanic data and figures. Edwin wants
drawn, classroom-quality icons instead, matching the homepage's polish. Rather than draw ad-hoc per
week, we build **one shared library planned from the whole year's schemes** and have the daily
lesson-build tool pull from it by key. Most icons recur across weeks, so this is draw-once-reuse-often.

---

## Decisions (locked July 22, 2026)

1. **Style — richer semi-realistic, colourful.** Not photorealistic (SVG can't and shouldn't), and not
   flat monochrome line-art. Aim: colourful vector illustration with gradients/shading and a little
   character, one consistent style spec (palette, viewBox, stroke, corner radius, lighting direction).
   Must read clearly at tile size (~26–40 px) AND as a larger figure element.
2. **Storage — individual SVG files in an assets folder.** One file per icon, e.g.
   `/assets/lesson-icons/<key>.svg`. Each is a real, cacheable, individually-editable artifact.
   A `manifest.json` maps `key → { file, topic, tags[], reusable, animated }`.
3. **Rollout — plan all, build cycle-by-cycle.** Enumerate every icon the whole 30-week year needs
   first (from the schemes), but BUILD Cycle 1's set first and roll forward, so lesson builds are never
   blocked waiting on the full year.
4. **Animation — sparing, only where it helps.** Static by default. Animate a few where it adds meaning
   or delight (sun rays, falling rain, spinning turbine) and ONLY in the concept figure / decorative
   spots. Keep icons **static inside timed or assessment activities** (detective tiles, streak) — motion
   competes with thinking there (pedagogy rubric).
5. **Contrast across themes — design it in.** A file-loaded colour SVG keeps its own colours (a palm is
   green in every theme — desired) and does NOT theme-tint. So every icon must read on all four theme
   card backgrounds (night/sunny/cloudy/nature): give each a built-in soft tile/halo or a light neutral
   ground so a dark outline never vanishes on the night background.
6. **Accessibility — every icon carries `role="img"` + a title/aria-label**, and is never the sole
   carrier of an answer (rubric R6/R7): the stem, options and explanation must be complete with images off.
7. **The line-icon kit stays as a fallback.** The 32 monochrome content glyphs added to `vc-icons.js`
   on July 22 remain for tiny inline/UI use and as a graceful fallback if a colour asset fails to load.
   The colourful files are the primary classroom visual.

---

## Proposed structure (to confirm at build time)

```
/assets/lesson-icons/
    manifest.json          # key -> { file, topic, tags[], reusable, animated }
    weather-sun.svg
    weather-rain.svg
    climate-tropical-palm.svg
    animal-jaguar.svg
    ...
```

- **Keys are stable and topic-prefixed** so the manifest is browsable and the daily tool can match a
  scheme's vocabulary to an icon.
- **The daily build references icons by key** from the manifest. If a week needs a key that is not in the
  manifest, the build **flags the gap** (it never falls back to an emoji, and it does not invent a new
  style ad-hoc mid-lesson) — the missing icon is added in the icon session, not the lesson run.

---

## The dedicated session (parked — NOT started)

Workflow when we run it:
1. **Read all 30 weekly schemes + the 4 cycle Teacher Notes + the ATP** and enumerate every concrete
   object/phenomenon the lessons will depict across the year. Group by cycle and topic.
2. **Produce the catalog** (`manifest.json` shape) — every key, its topic, tags, and whether it is
   reusable across weeks. Flag the high-reuse icons (weather, common animals/plants, forces, matter).
3. **Write the style spec** (palette, viewBox, stroke weights, shading rules, contrast tile) and draw a
   **Cycle 1 pilot set** for Edwin to approve the look before mass production.
4. **Build cycle by cycle**, updating the manifest as each icon lands.
5. **Then** update the mechanics bank + daily-build prompt to render icons from the manifest by key, and
   retrofit already-built weeks.

## What stands from July 22 (not parked)

- Week 3 (SC1.11) lesson draft — rebuilt onto the mechanics bank, still using emoji until the icon
  library is ready. Reviewed and awaiting Edwin's push.
- `vc-icons.js` — 32 monochrome content glyphs added (additive, homepage unaffected); now the fallback tier.
- Daily-build scheduled prompt — updated with the two-week split-outcome rule (Rule 1b).
- `outputs/lesson-reskin-PROOF.html` — a throwaway proof of the homepage-shell + line-icon direction.
  Superseded in style by decision 1 above; keep only as a shell-layout reference.
