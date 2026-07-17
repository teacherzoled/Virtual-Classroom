# ▶️ Paste this to start the next session

Copy the block below into a new chat (with the `Virtual-Classroom` folder connected —
Claude will also ask for the Std5 assessment project folder: **School stuff → School Matters →
2026 - 2027 (std 5) → Curriculum → Science**).

---

Build the **secure test gate** for my Virtual Classroom website: per-test open/closed switch
PLUS moving questions & figures out of the student pages into KV, so a closed test shows
nothing — on screen, in view-source, or in the public repo.

First, read `PROJECT-DOCS.md` in this repo — especially the **📌 Standing Rule** and the
**▶️ Take-off Point** — so you know the current state. As of July 17, 2026: the LMS login
system, three Std5 Science lessons with cacao beans, the student `/dashboard/`, and the
teacher `/teacher/` dashboard are ALL LIVE and verified. Do NOT rebuild any of it.

## Decisions already made (July 16–17, 2026 — do not re-ask)

1. **Closed tests hide questions from view-source.** Student test pages become empty shells
   that fetch questions from the Worker; the Worker returns them only when the test's KV
   entry says `open: true`. Edwin flips the flag in the Cloudflare KV dashboard on test
   morning (server clock decides — device-clock cheating impossible).
2. **Figures travel WITH the questions into KV** (they are text — inline SVG or base64 data
   URIs; ~1 MB per test vs the 25 MB KV limit). The page shell keeps only the engine:
   themes, starfield, passkey modal, submit-lock, `pdfText()`, `figHTML()`/`FIGS` rendering.
3. **Login gate:** the 16 Std5 student test/quiz pages also get `vcRequireLogin()`. Hubs and
   lessons stay public. This lifts the July 15 interim "publicly viewable" decision for
   tests/quizzes only.
4. **Scope:** extend each of the 16 KV entries with its question payload · ONE new Worker
   route/mode with the open-check · refactor the 16 student pages to fetch-render · re-audit
   all 16 (no dev bars, no answer fields, `pdfText()` present). Plan: one plumbing session
   (first test end-to-end) + one rollout pass (scripted extraction for the other 15).

## Cautions

- ⚠️ The open-check touches **`edlo-gemini`** (it owns `EDLO_ANSWER_KEYS`) — every change
  hits ALL live tests. Test against ONE testId first (suggest `sy2627-std5-c1-adaptquiz-science`,
  the smallest). The `edlo-lms` Worker is separate and safe.
- Content is NOT rewritten — questions/figures are lifted from the existing student pages
  into the KV JSON by script. Admin copies and all Word documents stay untouched.
- Ask before building: exact KV payload shape, whether Edwin pastes KV updates manually per
  test or wants a bulk-paste file per entry, and when to enroll the real class lists
  (plain passwords → run `hashPlainPasswords`).

When done, update `PROJECT-DOCS.md` and this file (standing rule) and remind me to
`git add -A → commit → push`.

---
