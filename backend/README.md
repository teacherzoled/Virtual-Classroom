# backend/ — local master copies of the off-repo code

These files are **not** run by GitHub Pages. They are the source-of-truth mirrors of code that
actually lives in Cloudflare and Google, kept here so future edits start from a complete file
(and you get a full paste-ready version back instead of snippets to hand-insert).

| File | Mirrors | Where it really runs |
|---|---|---|
| `VC-LMS-Backend.gs` | The **VC-LMS Backend** Apps Script | Google Apps Script, attached to the `VC-LMS` Google Sheet (Extensions → Apps Script) |
| `edlo-lms-worker.js` | The **edlo-lms** Cloudflare Worker | dash.cloudflare.com → Workers → edlo-lms |
| `D1-LESSON-PROGRESS-SETUP.md` | — | Steps to create the **`edlo-lms-db`** D1 database (lesson progress, Oct 24, 2026) and bind it to `edlo-lms` |
| `Computer-Club-Backend.gs` | The **Computer Club Backend** Apps Script (Nov 6, 2026) | Google Apps Script, attached to the `Computer Club Records` Google Sheet |
| `computer-club-worker.js` | The **computer-club-records** Cloudflare Worker (Nov 6, 2026) | dash.cloudflare.com → Workers → computer-club-records |
| `COMPUTER-CLUB-SETUP.md` | — | One-time setup steps for the Computer Club Sheet, Apps Script and Worker, plus the club-day routine |
| `edlo-gemini.js` | The **edlo-gemini** Cloudflare Worker (test grading + AI relay) | dash.cloudflare.com → Workers → edlo-gemini |

**Rule:** whenever the live Apps Script or Worker changes, update the matching file here in the same
session, and note the date at the top. When you next need to touch either one, Claude reads the local
file and returns a complete updated version to paste over the live editor.

> ⚠️ **`edlo-gemini` is the SHARED grading Worker** — every test and quiz on the site grades
> through it, so any change hits ALL live assessments at once. Test against a single `testId`
> before deploying. Mirrored here since September 10, 2026.

> 🗄️ **`edlo-lms` also talks to Cloudflare D1 (from Oct 24, 2026).** `/load-state` and `/save-state` are answered by
> the Worker itself (lesson progress, database `edlo-lms-db`, binding `DB`) and never reach Apps Script. They need the
> Worker secret `SESSION_SECRET` = an exact copy of the Apps Script one. Setup: `D1-LESSON-PROGRESS-SETUP.md`.

> 💻 **The Computer Club backend is separate on purpose (Nov 6, 2026).** `computer-club-records` + `Computer Club Backend`
> + `Computer Club Records` share nothing with `edlo-lms`, `VC-LMS` or `edlo-gemini`: a club problem cannot touch class
> logins, grading or lessons. Setup: `COMPUTER-CLUB-SETUP.md`.
