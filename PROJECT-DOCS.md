# Mr. EdLo's Virtual Classroom — Project Documentation
**Teacher:** Edwin (Mr. EdLo)  
**School:** Howard Smith Nazarene School, Belize  
**Classes:** Standard 5 & Standard 6  
**Last updated:** July 15, 2026

---

## 📌 STANDING RULE — read first, every session

**Never end, leave, or conclude a working session on this project without first updating this
PROJECT-DOCS.md file** to reflect what changed and where the next session should take off. This is a
permanent rule set by Edwin. Before wrapping up any chat:
1. Update the **Take-off Point** section below (current state + next task).
2. Update the **Last updated** date at the top.
3. Update any affected tables (Live URLs, Pages Built, Repo Structure) so they stay accurate.
4. Remind Edwin to `git add -A → commit → push` so the updated docs reach GitHub.

If the docs are not updated, the task is **not** finished.

---

## ▶️ Take-off Point — Next Session (as of July 15, 2026)

**Where we are:** the two-grade restructure is **LIVE and verified** on edlovirtualclassroom.com.
- Grade picker at `/` (Standard 5 / Standard 6).
- `/standard6/` holds all existing Standard 6 subjects (moved from the site root). Old links
  (`/science/`, `/spanish/`, `/portfolios/`) redirect via stubs; deeper old links redirect via `404.html`.
- `/standard5/` is a **hub shell only** — subject cards exist, but no Standard 5 subject pages are built yet.

**➡️ NEXT TASK: Build the Standard 5 Science hub** at `standard5/science/index.html`.

1. **Model it on the Standard 6 Science hub** (`standard6/science/index.html`): same structure —
   hero banner, lessons grouped by cycle/week, then graded **Activities**, **Quizzes**, **Tests**, and
   **Digital Labs**. Reuse the same theme system (Fredoka One / Nunito, 4 themes, stars, teal `--a-science` accent).
2. **Rebrand for Standard 5:** page title, header badge "Standard 5 · Science & Technology",
   subtitle, and footer `© 2026 Mr. EdLo's Virtual Classroom — Standard 5 · Belize · All rights reserved.`
   Logo + back link point to `/standard5/`.
3. **Content source:** Edwin's existing **Standard 5 Science & Technology assessment project**
   (SY 2026-2027 — `sy2627` testIds, `SC x.y` outcome codes, `Std5_*` files). Pull the cycles, weeks,
   SC codes, learning outcomes, and assessment list from there. Use the `project-planner` skill for the
   planning step and `edlo-content-pipeline` for the build.
4. **After building, wire it up:** in `standard5/index.html`, change the Science card from the current
   non-link `<div class="card soon">` ("Building Now") into `<a class="card" href="/standard5/science/">`
   (drop the `soon` class and `soon-chip`, add the `card-arrow`).

**Conventions (do not break):**
- New Standard 5 pages live under `/standard5/…` and link with `/standard5/…` paths.
- New Standard 6 pages live under `/standard6/…`. Never recreate subject folders at the site root —
  those exist only as redirect stubs.
- LMS files stay at the **root** (`/edlo-utils.js`, `/login/`, `/dashboard/`, `/teacher/`).

**To publish (Edwin's workflow):** open the `Virtual-Classroom` folder in VS Code →
`git add -A` → `git commit` → `git push` (the Claude Code plugin can run this). Git identity is set to
name `teacherzoled`, email `221897977+teacherzoled@users.noreply.github.com` (GitHub blocks pushes that
expose a real email, so the noreply address is required). After pushing, hard-refresh (Ctrl+Shift+R) —
previously-visited URLs may cache for up to ~10 min.

---

## 🌐 Live URLs

> **Structure note (July 2026):** the site now serves **two grades**. The home page is a
> **grade picker**; each grade lives in its own folder. Standard 6 subject pages moved from the
> site root into `/standard6/`. Old root links (e.g. `/science/`) still work — see **Grade Structure & Redirects** below.

| Page | URL |
|---|---|
| Grade Picker (home) | https://edlovirtualclassroom.com |
| Standard 5 Hub | https://edlovirtualclassroom.com/standard5/ |
| Standard 6 Hub | https://edlovirtualclassroom.com/standard6/ |
| Spanish Subject Hub (Std6) | https://edlovirtualclassroom.com/standard6/spanish/ |
| Science Subject Hub (Std6) | https://edlovirtualclassroom.com/standard6/science/ |
| Student Portfolios (Std6) | https://edlovirtualclassroom.com/standard6/portfolios/ |
| Mis Aspiraciones Lesson (Std6) | https://edlovirtualclassroom.com/standard6/spanish/lessons/mis-aspiraciones-intro/ |

---

## 🌍 Custom Domain

| Item | Value |
|---|---|
| Domain | edlovirtualclassroom.com |
| Registrar | Namecheap |
| DNS Records | 4 A Records → GitHub IPs + CNAME www → teacherzoled.github.io. |
| HTTPS | ✅ Enforced via GitHub Pages SSL |
| Registered | May 2026 |

---

## 📁 GitHub Repositories

**GitHub Username:** `teacherzoled`  
**GitHub Profile:** https://github.com/teacherzoled

| Repo Name | URL | Contents |
|---|---|---|
| Virtual-Classroom | github.com/teacherzoled/Virtual-Classroom | **MAIN WEBSITE** — all subject pages live here |
| spanish | github.com/teacherzoled/spanish | Backup only — content moved to Virtual-Classroom |
| science | github.com/teacherzoled/science | Backup only — content moved to Virtual-Classroom |
| math | github.com/teacherzoled/math | Backup only |
| scriptures | github.com/teacherzoled/scriptures | Backup only |
| computersc | github.com/teacherzoled/computersc | Backup only |
| pe | github.com/teacherzoled/pe | Backup only |
| portfolios | github.com/teacherzoled/portfolios | Backup only — content moved to Virtual-Classroom |

> ⚠️ **Important:** All website content must live inside the **Virtual-Classroom** repo for the custom domain to work. The other repos are backups only.

---

## 📂 Repo Structure (Virtual-Classroom)

Everything lives inside one repo. The home page is a **grade picker**; grade content lives in
`standard5/` and `standard6/`. Shared LMS pages (`login/`, `dashboard/`, `teacher/`, `edlo-utils.js`)
stay at the **root** so they serve both grades.

```
Virtual-Classroom/
├── index.html                          ← Grade picker (Standard 5 / Standard 6)
├── 404.html                            ← Catch-all: forwards old root links to /standard6/
├── CNAME                               ← Custom domain file
├── edlo-utils.js                       ← Shared LMS utilities — ROOT (serves both grades)
│
├── standard5/
│   └── index.html                      ← Standard 5 hub (subject cards; Science building now)
│
├── standard6/
│   ├── index.html                      ← Standard 6 hub (subject cards)
│   ├── spanish/
│   │   ├── index.html                  ← Spanish subject hub (LIVE)
│   │   ├── lessons/                     ← includes mis-aspiraciones-intro (LIVE)
│   │   ├── activities/
│   │   └── images/
│   ├── science/
│   │   └── index.html                  ← Science subject hub (LIVE, 30 wks)
│   ├── math/                           ← Hub page not built yet
│   ├── scriptures/                     ← Hub page not built yet
│   ├── computersc/                     ← Hub page not built yet
│   └── portfolios/
│       └── index.html                  ← Student portfolios (LIVE)
│
├── science/index.html                  ← REDIRECT stub → /standard6/science/
├── spanish/index.html                  ← REDIRECT stub → /standard6/spanish/
├── portfolios/index.html               ← REDIRECT stub → /standard6/portfolios/
│
├── login/     (planned)                ← Student login page — ROOT
├── dashboard/ (planned)                ← Student dashboard — ROOT
└── teacher/   (planned)                ← Teacher dashboard — ROOT
```

---

## 🔀 Grade Structure & Redirects (added July 2026)

The site serves two grades from one repo:

| Path | What it is |
|---|---|
| `/` | Grade picker — choose Standard 5 or Standard 6 |
| `/standard5/` | Standard 5 hub (subject cards; content being built, Science first) |
| `/standard6/` | Standard 6 hub — all existing subject pages moved here |
| `/standard6/<subject>/` | Each Standard 6 subject hub (spanish, science, portfolios live) |

**Keeping old links alive.** Standard 6 subjects used to sit at the site root (`/science/`, `/spanish/`,
`/portfolios/`). After the move, old links still work two ways:

1. **Redirect stubs** — a tiny `index.html` at each old path (`/science/`, `/spanish/`, `/portfolios/`)
   forwards to the new `/standard6/<subject>/` location.
2. **`404.html` catch-all** — any *deeper* old link (e.g. `/spanish/lessons/…`) hits the site's 404 page,
   whose script forwards old-subject paths to their `/standard6/` equivalent. Old subject prefixes it
   watches: `science, spanish, scriptures, computersc, math, portfolios, pe`.

**When adding a NEW Standard 6 page:** put it under `/standard6/…` and link to it with a `/standard6/…`
path. When adding a **Standard 5** page, put it under `/standard5/…`. Do **not** recreate subject folders
at the site root — those exist only as redirect stubs.

---

## 📂 Local Folder Structure

All repos are saved locally at:
```
C:\Users\zoloe\OneDrive\Shared with me\Code Projects\Python Projects\
```

---

## 🔑 Passkey System

### How it works
- Students enter a class code once on their first AI feedback request
- Code is saved to `localStorage` key: `vc-passkey` — persists across ALL lessons and ALL subjects on the domain
- The passkey is validated server-side inside the Cloudflare Worker — never exposed in browser code
- Wrong code → Worker returns 403, key is cleared, modal reappears
- New school year → change `VALID_KEY` in the Worker once → applies everywhere instantly

### Current passkey
| Item | Value |
|---|---|
| Current code | `EDLO-STD6` |
| localStorage key | `vc-passkey` |
| Validation location | Cloudflare Worker (server-side, secure) |
| Scope | Site-wide — works across all subjects automatically |

### Teacher reset code
| Item | Value |
|---|---|
| Reset code | `RESET-QUIZ` |
| How to use | On the "Test Already Submitted" lock screen, click **🔑 Reset Quiz for Testing** → enter `RESET-QUIZ` → page reloads fresh |
| Effect | Clears only the current browser/device — does not affect any student's lock |

### Changing the passkey (new school year)
1. Go to `dash.cloudflare.com` → Workers → `edlo-gemini`
2. Find line: `const VALID_KEY = 'EDLO-STD6';`
3. Change to new code e.g. `EDLO-STD7`
4. Click Deploy — updates everywhere instantly

---

## 🤖 AI Feedback System

### How it works
Student writes paragraph → clicks Enviar → browser checks for passkey → if none, modal appears → student enters code → browser sends paragraph + passkey to Cloudflare Worker → Worker validates passkey → forwards to OpenAI → OpenAI returns short feedback in Spanish → feedback appears on screen.

### Cloudflare Worker
| Item | Value |
|---|---|
| Worker Name | edlo-gemini |
| Worker URL | https://edlo-gemini.smartstandardsix.workers.dev/ |
| Cloudflare Account | Smartstandardsix@gmail.com |
| Dashboard | dash.cloudflare.com |

### Worker responsibilities
1. Handle CORS (allows requests from custom domain)
2. Validate passkey — reject with 403 if wrong
3. Remove passkey from body before forwarding to OpenAI
4. Forward request to OpenAI and return response

### AI Provider
| Item | Value |
|---|---|
| Provider | OpenAI |
| Model used | gpt-4o-mini |
| API Key location | Inside Cloudflare Worker code (secure) |
| Key name | edlo virtual classroom |
| OpenAI Dashboard | platform.openai.com |
| Estimated cost | ~$23/month for 40 students across all lessons |

### AI Feedback Rules
- Responds in Spanish ONLY
- Maximum 2 short sentences — direct and to the point
- Tone: praise correct work, firm on errors
- Reserved for Section 9 (final production) only
- All other sections use rule-based logic (zero API cost)

### Gemini API (not in use — blocked in Belize)
| Item | Value |
|---|---|
| Key name | Edlo Api Key |
| Dashboard | aistudio.google.com |
| Status | NOT USED — generativelanguage.googleapis.com is blocked in Belize |

---

## 🎨 Design System

### Fonts
- **Headings:** Fredoka One (Google Fonts)
- **Body:** Nunito (Google Fonts)

### Themes
All pages support 4 themes switchable via the theme bar:
- 🌙 Night (default) — dark blue background
- ☀️ Sunny — warm yellow background
- ☁️ Cloudy — grey-blue background
- 🌿 Nature — green background

Theme preference saves to `localStorage` key: `vc-theme` — persists across all pages.

### Logo
- URL: https://i.postimg.cc/bwyD9j9w/Teacher-ed-Logo.png

### Layout Rules
- Wrapper: `max-width: 1400px`, padding `0 max(1rem, 4vw)` — NEVER use `1in`
- Same `max(1rem, 4vw)` padding applies to `.site-footer`
- Cards: `flex: 0 1 260px`, centered with flexbox, incomplete rows center automatically
- Wide cards (activities/assessments): `flex: 0 1 340px`
- Lab cards: `flex: 0 1 420px`
- Each subject has its own accent color

### Mobile Rules (apply to every subject hub page)
- At `max-width: 640px`: `.wide-card` and `.lab-card` → `flex: 0 1 100%`
- At `max-width: 480px`: `.grid .card` → `flex: 0 1 100%`
- `html`, `body`, and `.wrapper` must all have `overflow-x: hidden`
- h1 font size must use `clamp(1.8rem, 8vw, 3.8rem)` — never a fixed size
- `.welcome-text` must have `min-width: 0` and `word-break: break-word`

### Cycle Divider Mobile Rules
- `.cycle-divider-label`: always `white-space: normal` and `text-align: center`
- At `max-width: 640px`: `.cycle-divider` → `flex-wrap: wrap; justify-content: center`
- At `max-width: 640px`: `.cycle-divider-label` → `width: 100%; text-align: center`
- At `max-width: 640px`: `.cycle-divider-line` → `display: none`

### Copyright Footer
Footer text is grade-specific (since the site now serves two grades):
```
Grade picker (home):  © 2026 Mr. EdLo's Virtual Classroom — Belize · All rights reserved.
Standard 5 pages:      © 2026 Mr. EdLo's Virtual Classroom — Standard 5 · Belize · All rights reserved.
Standard 6 pages:      © 2026 Mr. EdLo's Virtual Classroom — Standard 6 · Belize · All rights reserved.
```

### Subject Accent Colors
| Subject | Color | Hex |
|---|---|---|
| Spanish | Orange | #FF922B |
| Science | Teal | #20C997 |
| Mathematics | Blue | #4DABF7 |
| Scriptures | Yellow | #FFD43B |
| Computer Science | Purple | #9775FA |
| Physical Education | Green | #69DB7C |
| Google Classroom | Red | #FF6B6B |
| Worksheets | Yellow | #FFD43B |
| Portfolios | Pink | #F783AC |

---

## 🖼️ Image Guidelines

- **Max image size:** 500 KB per image
- **Recommended dimensions:** 1600 x 900 px for hero/banner images
- **Compression tools:** squoosh.app or tinypng.com
- **Storage strategy:** Host large images on Postimg.cc and reference by URL — keeps repo size lean
- **GitHub Pages limit:** 1 GB repo storage (free) — no monthly cost

---

## 🔧 VS Code Workflow

### Opening the repo
`File → Open Folder` → select the Virtual-Classroom folder

### Saving files
`Ctrl + S` — always check the dot (●) on the tab disappears before pushing

### Pushing changes to GitHub
```bash
git add .
git commit -m "Your message here"
git push
```

### Switching to Virtual-Classroom in terminal
```bash
cd "C:\Users\zoloe\OneDrive\Shared with me\Code Projects\Python Projects\Virtual-Classroom"
```

### Find and replace across all files
`Ctrl + Shift + H` — use to update things like domain names, copyright year, or school name across all files at once

---

## 📚 Pages Built

| Page | URL | Status |
|---|---|---|
| Grade Picker (home) | edlovirtualclassroom.com | ✅ Live |
| Standard 5 Hub | edlovirtualclassroom.com/standard5/ | ✅ Live (shell — subjects being built) |
| Standard 6 Hub | edlovirtualclassroom.com/standard6/ | ✅ Live |
| Spanish Hub (Std6) | edlovirtualclassroom.com/standard6/spanish/ | ✅ Live |
| Science Hub (Std6) | edlovirtualclassroom.com/standard6/science/ | ✅ Live |
| Portfolios (Std6) | edlovirtualclassroom.com/standard6/portfolios/ | ✅ Live |
| Math Hub (Std6) | edlovirtualclassroom.com/standard6/math/ | ❌ Not built yet |
| Scriptures Hub (Std6) | edlovirtualclassroom.com/standard6/scriptures/ | ❌ Not built yet |
| Computer Science Hub (Std6) | edlovirtualclassroom.com/standard6/computersc/ | ❌ Not built yet |
| PE Hub (Std6) | edlovirtualclassroom.com/standard6/pe/ | ❌ Not built yet |
| Standard 5 subject hubs | edlovirtualclassroom.com/standard5/&lt;subject&gt;/ | ❌ Not built yet (Science first) |
| Login Page | edlovirtualclassroom.com/login/ | ❌ Not built yet (June) |
| Student Dashboard | edlovirtualclassroom.com/dashboard/ | ❌ Not built yet (July) |
| Teacher Dashboard | edlovirtualclassroom.com/teacher/ | ❌ Not built yet (August) |

---

## 📚 Lessons Built

### Spanish
| Lesson | Folder | Status | Activities | AI Feedback |
|---|---|---|---|---|
| Mis Aspiraciones: Voy a + infinitivo | mis-aspiraciones-intro | ✅ Live | ✅ Full interactive | ✅ Active (OpenAI) |

### Science
| Lesson | Folder | Status | Activities | AI Feedback |
|---|---|---|---|---|
| SC 6.19 Plant Adaptations (Test) | science/ | ✅ Live | ✅ Full test | ✅ Active (OpenAI) |
| SC 6.20 Plant Diversity (Test) | science/ | ✅ Live | ✅ Full test | ✅ Active (OpenAI) |

---

## 🗺️ Current Priorities (May 2026 — before summer)

1. **Build remaining subject hubs** — Math, Scriptures, Computer Science, PE
2. **More Spanish lessons** — build out remaining lessons using the established template
3. **Science lessons** — build lesson content under science hub
4. **Rubric system** — add rubric table to PDF output for official grading
5. **AI-powered chatbot** — lesson-aware assistant students can ask questions
6. **Teacher voice audio** — replace TTS with recorded MP3 clips per section

---

## 🏗️ LMS Vision — Summer 2026 Build Plan

A lightweight Learning Management System built entirely on free infrastructure already in place. No new services needed.

### What it adds
- One username/password per student stored in Google Sheets
- Student logs in once — session persists across all pages and subjects
- Every activity (test, quiz, lesson, exit slip) automatically logs a result row to Google Sheets
- Student dashboard showing personal progress per subject and per LO
- Teacher dashboard showing full class performance, weak LOs, and submission tracking

### Architecture Overview
```
Student Browser
     |
     ├── edlo-utils.js  (shared JS linked on every page)
     |        ├── vcLogin()         → Worker /login
     |        ├── vcSaveProgress()  → Worker /save-result
     |        └── vcGetProgress()   → Worker /progress
     |
     └── Cloudflare Worker (edlo-gemini) — 3 new endpoints added
              ├── /ai-feedback    (existing — unchanged)
              ├── /login          (new)
              ├── /save-result    (new)
              └── /progress       (new)
                       |
                       └── Google Sheets (via Service Account)
                                ├── Tab 1: Students
                                ├── Tab 2: All Results
                                ├── Tab 3: Per Student Progress (formula-driven)
                                └── Tab 4: Class Summary (formula-driven)
```

### Google Sheet Structure

**Tab 1 — Students**
| Column | Field | Example |
|---|---|---|
| A | username | `john.smith` |
| B | password | (hashed) |
| C | full_name | `John Smith` |
| D | first_name | `John` |
| E | class_id | `Std6-2026` |
| F | active | `YES` / `NO` |

**Tab 2 — All Results** (one row per submission, auto-appended)
| Column | Field | Example |
|---|---|---|
| A | timestamp | `2026-09-15 08:42` |
| B | username | `john.smith` |
| C | student_name | `John Smith` |
| D | subject | `Science` |
| E | lo_code | `SC6.19` |
| F | activity_type | `test` / `quiz` / `lesson` / `exit-slip` |
| G | activity_name | `Plant Adaptations` |
| H | score | `24` |
| I | max_score | `30` |
| J | percent | `80` |
| K | ai_feedback | (AI feedback text if any) |

**Tabs 3 and 4** — Formula-driven only. No code writes to them. Auto-calculate averages, weak LOs (below 70%), and class summaries from Tab 2.

### Worker — New Endpoints

| Endpoint | What it does |
|---|---|
| `/login` | Validates username + password against Tab 1, checks active=YES, returns session token |
| `/save-result` | Validates session token, appends one row to Tab 2 |
| `/progress` | Validates session token, returns all Tab 2 rows for that student |

### edlo-utils.js — Shared JS File
Hosted at: `edlovirtualclassroom.com/edlo-utils.js`
Linked on every page with: `<script src="/edlo-utils.js"></script>`

Functions:
- `vcLogin(username, password)` — authenticates student
- `vcGetSession()` — returns stored session or null
- `vcRequireLogin()` — redirects to /login/ if no session found
- `vcSaveProgress(payload)` — sends result row to Worker
- `vcGetProgress()` — fetches all results for current student

Adding LMS to any existing page requires only 2 lines:
```html
<script src="/edlo-utils.js"></script>
<script> vcRequireLogin(); </script>
```

Adding result logging to any submit button:
```javascript
vcSaveProgress({
  subject: 'Science',
  lo_code: 'SC6.19',
  activity_type: 'test',
  activity_name: 'Plant Adaptations',
  score: 24,
  max_score: 30,
  ai_feedback: feedbackText
});
```

### New Pages to Build

| Page | Path | Description |
|---|---|---|
| Login | `/login/index.html` | Student login page, styled to match site |
| Student Dashboard | `/dashboard/index.html` | Personal progress — subject cards, LO bars, activity history, badges |
| Teacher Dashboard | `/teacher/index.html` | Password-protected — class overview, LO breakdown, per-student drill-down, submission tracker |

### Student Dashboard Features
- Subject cards showing current average per subject
- Progress bar per LO — green (strong), yellow (needs review)
- Activity history timeline with scores and AI feedback
- Achievement badges — First Test, Perfect Score, 10 Activities, etc.

### Teacher Dashboard Features
- Password-protected (teacher credentials only)
- Full class overview — one row per student, colour-coded by performance
- Per LO breakdown — which LOs the whole class struggled with
- Per student drill-down — click name, see full activity history
- Submission tracker — who submitted today's activity, who has not
- Weekly summary report

### Scalability — Tutor Academy Ready
The system is architected to scale beyond one school class with zero rework:
- `class_id` field in Tab 1 separates school students from tutor students automatically
- Worker URL (`smartstandardsix.workers.dev`) has no school-specific naming
- `edlo-utils.js` has no hardcoded class references — all context comes from session
- Adding a tutor academy = new rows in Tab 1 with a different `class_id` + a new branded landing page
- No existing school pages, tests, or lessons are ever touched

### Summer Build Order

| Month | Stage | What gets built |
|---|---|---|
| June | Foundation | Google Sheet structure + service account + Worker `/login` + `/save-result` + `edlo-utils.js` + login page |
| June | Retrofit | Add `vcSaveProgress()` to existing Science tests (2 lines each) |
| July | Student Dashboard | `/dashboard/index.html` — personal progress view |
| August | Teacher Dashboard | `/teacher/index.html` — full class management view |
| September | Go Live | Enroll all students, brief them on login, every activity feeds dashboards from day one |

### AI Features — Later Phase
- Hint mode — student clicks for a guiding question before submitting
- Re-attempt feedback — AI compares first and second attempt
- Vocabulary check — flags missing required scientific terms
- Lesson activity grading — drag/drop, labelling, sorting activities

### Storage Capacity
Google Sheets limit is 10 million cells. At ~40 students with ~1,400 submissions per year, the site uses roughly 15,400 cells annually — well under any practical limit. Archive previous year's Tab 2 at the start of each school year to keep formulas fast.

---

## 💰 Cost Summary

| Service | Cost | Notes |
|---|---|---|
| GitHub Pages | Free | Hosting for all pages |
| Namecheap Domain | ~$10–15/year | edlovirtualclassroom.com |
| Cloudflare Worker | Free | 100,000 requests/day free tier |
| OpenAI (gpt-4o-mini) | ~$23/month | 40 students, all lessons active |
| Google Fonts | Free | Fredoka One + Nunito |
| Google Classroom | Free | Assignment submission + grading |
| Google Sheets API | Free | LMS backend — service account |

**Total monthly cost when fully built:** ~$23/month + ~$1/month domain

---

## 📐 Lesson Template Structure

Every lesson follows this 10-section structure:

| Section | Content | Activity Type | Feedback |
|---|---|---|---|
| 1 — Hook | Thinking questions | None | None |
| 2 — Estructura | Key grammar + conjugation | Matching activity | Rule-based ✅/❌ |
| 3 — Antes del video | Pre-listening guide | None | None |
| 4 — Video | Embedded YouTube | None | None |
| 5 — Después del video | Post-viewing sentences | Word bank fill-in | Rule-based ✅/❌ |
| 6 — Checkpoint | ALTO — all conjugations | Multiple choice quiz | Rule-based + score |
| 7 — Conecta | Aspiration + plan | Matching pairs | Rule-based ✅/❌ |
| 8 — Práctica guiada | Guided sentences | Drag & drop sentence builder | Rule-based ✅/❌ |
| 9 — Reto final | Final paragraph | Open writing | ✅ AI feedback (2 attempts) |
| 10 — Reflexión | Self-check questions | None | None |

**AI feedback strategy:** Reserve AI only for Section 9 (final production). Use rule-based logic for all other interactive sections. This keeps API costs minimal (~1 call per student per lesson).

---

## 📄 Section 9 — Final Production System

### Iteration Rules
- Maximum **2 attempts** per student per lesson
- Attempt 1 → AI gives short feedback (2 sentences max) → student can revise
- Attempt 2 → AI gives final feedback → textarea locks permanently
- After attempt 2 → PDF download section appears with student name field
- After attempt 2 → Upload to Google Classroom button appears

### PDF Download (browser print-to-PDF, no server needed)
PDF includes:
- Lesson title and rocket emoji header
- Student name (filled in by student)
- Date (auto-generated)
- School: Howard Smith Nazarene School · Standard 6 · Belize
- Student's final paragraph (orange-bordered box)
- AI feedback for each attempt (blue-bordered box per attempt)
- Footer with site URL and copyright

### PDF Notes
- Generated via browser print window — opens automatically
- Student selects "Save as PDF" in print dialog
- Cannot be easily modified (not a text file)
- Future plan: add rubric table for official grading

### Google Classroom Upload
- Button appears only after both attempts are used
- Links to Google Classroom for manual upload
- Student downloads PDF first then uploads to assignment

### Why 2 iterations
- 1 attempt = too rigid, no chance to improve
- 2 attempts = forces deliberate revision after reading feedback
- 3+ attempts = encourages guessing, reduces thinking

---

## 🎮 Interactive Activities Library (Rule-Based Logic)

All activities below use pure HTML/CSS/JavaScript logic — zero AI, zero API calls, zero cost. AI feedback is reserved for Section 9 (final production) only.

### Group 1 — Selection Activities
*Student chooses from given options*

| Activity | How it works | Best for |
|---|---|---|
| Multiple choice | Pick one correct answer from 3-4 options | Grammar rules, vocabulary, comprehension |
| True / False | Binary yes/no decision | Concept checks, rule understanding |
| Yes / No / Maybe | Three-way decision | Opinion + comprehension |
| Multi-select | Choose ALL correct answers | Vocabulary sets, grammar categories |
| Odd one out | Which word doesn't belong | Vocabulary grouping |
| Error detection | Which sentence has a mistake | Grammar awareness |

### Group 2 — Matching Activities
*Student connects two things*

| Activity | How it works | Best for |
|---|---|---|
| Drag to match | Connect left column to right column | Vocab translation, verb conjugation |
| Card flip matching | Flip cards to find pairs | Vocabulary memorization |
| Category sort | Drag items into correct category boxes | Grouping vocabulary, grammar categories |
| Image to word match | Match a picture to its word | Vocabulary, nouns |
| Sentence to meaning | Match Spanish sentence to English meaning | Reading comprehension |
| Column sort | Sort items into 2-3 columns | Verb tenses, gender, categories |

### Group 3 — Fill-in Activities
*Student completes something*

| Activity | How it works | Best for |
|---|---|---|
| Word bank fill-in | Blank sentence + word bank to choose from | Grammar structures, vocabulary |
| Dropdown select | Click blank → choose from dropdown | Conjugation, grammar |
| Cloze passage | Full paragraph with multiple blanks | Reading + grammar together |
| First letter hint | Blank with first letter given | Vocabulary recall |
| Type and check | Student types answer, logic checks exact match or list of valid answers | Spelling, short answers |

### Group 4 — Ordering Activities
*Student arranges things in correct sequence*

| Activity | How it works | Best for |
|---|---|---|
| Sentence builder | Drag scrambled words into correct order | Sentence structure, word order |
| Story sequencing | Put events in correct order | Reading comprehension, narratives |
| Dialogue ordering | Arrange conversation lines correctly | Speaking/dialogue practice |
| Timeline ordering | Place events on a timeline | History, science processes |
| Step sequencing | Order steps of a process | Science, instructions |

### Group 5 — Identification Activities
*Student identifies something in context*

| Activity | How it works | Best for |
|---|---|---|
| Highlight the error | Click on the wrong word in a sentence | Grammar correction |
| Tap the word | Tap/click the correct word as it appears | Vocabulary, listening comprehension |
| Label the image | Drag labels onto parts of an image | Science diagrams, body parts, maps |
| Circle the verb | Click all verbs in a paragraph | Grammar identification |
| Find and classify | Identify and sort items from a passage | Reading + grammar |

### Group 6 — Transformation Activities
*Student changes or converts something*

| Activity | How it works | Best for |
|---|---|---|
| Conjugation converter | Given infinitive → type correct conjugated form | Verb conjugation |
| Tense transformer | Rewrite sentence in different tense | Grammar |
| Affirmative to negative | Convert positive sentence to negative | Grammar structure |
| Singular to plural | Convert words or sentences | Grammar |
| Subject swap | Rewrite sentence with different subject | Conjugation practice |

### Group 7 — Quiz Game Activities
*Gamified feedback with scoring*

| Activity | How it works | Best for |
|---|---|---|
| Timed quiz | Answer questions before timer runs out | Vocabulary, grammar review |
| Points accumulator | Each correct answer adds points | Any content — engagement |
| Lives system | 3 lives, lose one per wrong answer | Review, reinforcement |
| Streak counter | Counts consecutive correct answers | Motivation, fluency |
| Progress bar | Visual bar fills as student completes | Any section — motivation |

### Group 8 — Reading/Listening Comprehension
*Student reads or listens then responds*

| Activity | How it works | Best for |
|---|---|---|
| Read and answer | Short passage + multiple choice questions | Reading comprehension |
| Listen and select | Audio plays + student picks what they heard | Listening (with TTS) |
| Read and classify | Read sentences, sort into categories | Grammar in context |
| Find the answer | Read passage, answer specific questions | Detail comprehension |

### Group 9 — Creative with Constraints
*Open but guided — logic checks structure not content*

| Activity | How it works | Best for |
|---|---|---|
| Sentence starter | Given start, student completes — logic checks minimum length and required words | Guided production |
| Must include | Student writes freely but must include specific words — logic checks for their presence | Controlled writing |
| Word count challenge | Write exactly X words — logic counts | Fluency, conciseness |

### Activity Map by Subject

| Subject | Best activity types |
|---|---|
| Spanish grammar | Conjugation matching, dropdown, sentence builder, error detection |
| Spanish vocabulary | Card flip, image match, category sort, word bank |
| Science | Label the image, step sequencing, true/false, read and answer |
| Math | Multiple choice, type and check, timed quiz |
| Scriptures | Story sequencing, read and answer, matching pairs |
| PE | True/false, category sort, multiple choice |
| Computer Science | Step sequencing, error detection, matching |

### Planned Activity Map — Mis Aspiraciones Lesson

| Section | Activity Type | Feedback |
|---|---|---|
| 2 — Estructura | Matching — subject pronoun → verb form | Rule-based ✅/❌ |
| 5 — Después del video | Word bank fill-in | Rule-based ✅/❌ |
| 6 — Checkpoint | Multiple choice quiz — 5 questions, one per conjugation | Rule-based + score |
| 7 — Conecta | Matching pairs — aspiration → plan | Rule-based ✅/❌ |
| 8 — Práctica guiada | Drag & drop sentence builder | Rule-based ✅/❌ |
| 9 — Reto final | Open paragraph | AI feedback only |

---

*Documentation maintained by Mr. EdLo — update this file whenever a new lesson goes live, a new system is added, or infrastructure changes.*
