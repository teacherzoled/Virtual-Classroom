# ▶️ Paste this to start the next session

Copy the block below into a new chat (with the `Virtual-Classroom` folder connected).

---

Read `PROJECT-DOCS.md` first — the **📌 Standing Rule** and the **▶️ Take-off Point** — for the full
as-built state. The **🏪 Bean Store is SHIPPED and verified live** (July 18, 2026); do NOT rebuild it.

## What's already done (do not redo)

- **🏪 Bean Store — live & tested end-to-end.** `/dashboard/` has a browse-only Store panel with
  spendable balance (earned − spent); `/teacher/` has a Redeem panel (teacher-initiated, hard block
  on cost>balance or stock=0, enforced server-side too). `redeem` rows never touch the team race or
  class goal (Group Totals formula filters lesson+bonus only — verified). `Prizes` tab (9 rows) +
  `prizes`/`redeem-prize` Apps Script actions + `/prizes`/`/redeem-prize` Worker routes all deployed.
- **Local backend mirrors:** `backend/VC-LMS-Backend.gs` and `backend/edlo-lms-worker.js` mirror the
  deployed Apps Script + Worker. **Standing rule:** edit the mirror whenever the live code changes,
  and hand Edwin a COMPLETE paste-over file (not snippets).
- **Secure test gate** (16 Std5 Science tests/quizzes) and **Layer 1 dashboards** — live, per prior
  sessions.

## ➡️ NEXT BUILD (queued): 🔓 Progressive lesson unlock — `IDEAS.md` #8

Students must NOT see the whole year's lesson catalogue at once.
- **Rule:** only the current / first week's lesson is active; all later weeks are **LOCKED** — and
  this holds **even when logged OUT**, so the general public gets a "taste" of Week 1 only, with the
  rest shown locked.
- **Open design decision to make first:** what unlocks each later week?
  ① a teacher toggle (like the Test Control idea #7), ② a date/schedule, or ③ completion of the
  prior week. Decide this before building.
- **Scope:** the Std5 Science lessons hub first (`/standard5/science/` Lessons tab), then any future
  subject. Distinct from the test gate — lessons are public pages, so this is likely a lighter
  per-lesson "unlocked" flag rather than KV/Worker work.
- **How to start:** read `IDEAS.md` #8 and the Std5 Science hub, run the planning skill, present a
  plan, and wait for Edwin's approval before creating or modifying files.

## Other parked items (Edwin decides when)

- More Std5 Science lessons — Week 4+ (clone the Week 1 engine)
- Revise the 3 Wk1–3 sample lessons — content + activities (`IDEAS.md` #9)
- Test Control panel on `/teacher/` — open/close tests without hand-editing KV (`IDEAS.md` #7;
  ⚠️ touches the shared `edlo-gemini` Worker)
- Layer 2 ecosystem journey map + weekly quest (`DASHBOARD-GAMIFICATION-PLAN.md`)

When done, update `PROJECT-DOCS.md` (Standing Rule) and remind Edwin to `git add -A → commit → push`.

---
