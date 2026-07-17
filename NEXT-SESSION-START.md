# ▶️ Paste this to start the next session

Copy the block below into a new chat (with the `Virtual-Classroom` folder connected).

---

Build the **per-test open/closed switch + login gate retrofit** for my Virtual Classroom website.

First, read `PROJECT-DOCS.md` in this repo — especially the **📌 Standing Rule**, the
**▶️ Take-off Point**, and the **🔐 LMS Login System** section — so you know the current state.
The login system (Sheet + Apps Script + `edlo-lms` Worker + `/edlo-utils.js` + `/login/` page)
is LIVE and verified as of July 16, 2026. Do NOT rebuild any of it.

Then, **before you build anything, ask me the questions you need** (use multiple-choice
questions where it helps). At minimum, ask me about:

1. **KV structure** — how the existing `EDLO_ANSWER_KEYS` entries are shaped in the
   `edlo-gemini` Worker, and how to add an `"open": true/false` field per testId safely.
2. **Which endpoint answers the open-check** — new route on `edlo-gemini` (it owns the KV)
   or the `edlo-lms` Worker; remember every `edlo-gemini` change hits ALL live tests, so we
   test against ONE testId first.
3. **Gate behavior** — what a student sees when a test is closed (message, styling).
   **DECIDED (July 16, 2026, Edwin):** closed tests MUST also hide questions from view-source —
   student pages load empty and fetch questions from the Worker, which returns them only when
   `open:true`. Scope this implies: extend each of the 16 KV entries with its question payload,
   add ONE new Worker route with the open-check (test against ONE testId first — edlo-gemini
   changes hit ALL live tests), refactor the 16 student pages to fetch-render, re-audit all 16.
   **Figures travel WITH the questions into KV** (they are text — inline SVG markup or base64
   data URIs; ~1 MB per test vs the 25 MB KV limit) so the page shell is truly empty; the
   existing `figHTML()`/`FIGS` rendering is reused on the fetched payload.
   Plan for one plumbing session + one rollout pass.
4. **Retrofit scope** — confirm the 16 Std5 student pages get `vcRequireLogin()` + the
   open-check, and whether the interim "publicly viewable" decision (July 15) is now lifted.
5. **Re-audit** — the 16 pages must be re-audited after retrofit (no dev bars, no answer
   fields, `pdfText()` present).
6. **Student enrollment** — whether to enroll the real class lists in the `VC-LMS` Students
   tab this session (plain passwords → run `hashPlainPasswords`).

When done, update `PROJECT-DOCS.md` and this file (standing rule) and remind me to
`git add -A → commit → push`.

---
