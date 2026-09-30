# ▶️ Paste this to start the next session

Copy the block below into a new chat (with the `Virtual-Classroom` folder connected).

---

Read `PROJECT-DOCS.md` first — the **📌 Standing Rule** and the **▶️ Take-off Point (as of September 24,
2026)** — for the full as-built state. Then ask me which item or instrument is next. Do not pick one
yourself, and do not create or modify files until I approve a plan.

## Where things stand (Sept 24, 2026)

- **Standard 5 is live and in daily use** (school week 4 = week of Sept 21). `main` matches GitHub.
- **Built since August:** lesson icon library; Power-Ups 2A/2B/3A; the online Beginning-of-Year
  Check-up with autosave + retry; the Std 5 **Maths hub** with Classwork Checks 1–2.
- **Class passkeys** live in the `edlo-gemini` Worker secret `CLASS_KEYS`, not in code.

## Rules that bite if forgotten

1. **The repo is PUBLIC.** Passwords, logins, class codes and answer keys never go in a committed path.
   They go in `..\Virtual-Classroom-private\` (beside the repo) or a gitignored `_source/` folder.
2. **Assessment resilience:** whenever a test/quiz page is touched, add autosave + retry + "record
   nothing if grading is unreachable" in the same update. The 16 Std5 Science tests/quizzes don't
   have it yet.
3. **`edlo-gemini` is the shared grading Worker.** Every assessment grades through it. Test one
   `testId` before deploying. Its mirror in `backend/` is currently BEHIND live (see open item 1).
4. **Plan first, one subject at a time.** Decisions made for one subject don't carry over to another
   until I say so.
5. **Git from the connected-folder shell:** use `GIT_OPTIONAL_LOCKS=0` for read-only commands. That
   shell can't delete `.git/index.lock`, and a stale lock blocks GitHub Desktop.

## Open items (from PROJECT-DOCS Take-off Point)

1. Copy the live `edlo-gemini` code into `backend/edlo-gemini.js` (the mirror still has the old
   hardcoded codes).
2. Resilience fix on the 16 Std5 Science tests/quizzes as each is next updated.
3. Settle the design-rule conflict: link `/vc-theme.css` on new pages, or keep pages self-contained?
4. Lessons: only Weeks 1–3 exist; the July daily lesson-build task no longer exists.
5. Fix the claude.ai Project instructions (they still say Standard 6 and `padding: 0 1in`).

When done: update `PROJECT-DOCS.md` (Standing Rule) and remind me to commit → push in GitHub Desktop.
