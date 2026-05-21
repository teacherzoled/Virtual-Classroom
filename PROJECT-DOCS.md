# Mr. EdLo's Virtual Classroom — Project Documentation
**Teacher:** Edwin (Mr. EdLo)  
**School:** Howard Smith Nazarene School, Belize  
**Class:** Standard 6  
**Last updated:** May 2026

---

## 🌐 Live URLs

| Page | URL |
|---|---|
| Main Classroom Hub | https://edlovirtualclassroom.com/Virtual-Classroom/ |
| Spanish Subject | https://edlovirtualclassroom.com/spanish/ |
| Science Subject | https://edlovirtualclassroom.com/science/ |
| Mis Aspiraciones Lesson | https://edlovirtualclassroom.com/spanish/mis-aspiraciones-intro/ |
| Student Portfolios | https://edlovirtualclassroom.com/portfolios/ |

---

## 📁 GitHub Repositories

**GitHub Username:** `teacherzoled`  
**GitHub Profile:** https://github.com/teacherzoled

| Repo Name | URL | Contents |
|---|---|---|
| Virtual-Classroom | github.com/teacherzoled/Virtual-Classroom | Main hub homepage |
| spanish | github.com/teacherzoled/spanish | Spanish subject page + all Spanish lessons |
| science | github.com/teacherzoled/science | Science subject page + lessons |
| math | github.com/teacherzoled/math | Mathematics subject page + lessons |
| scriptures | github.com/teacherzoled/scriptures | Scriptures subject page + lessons |
| computersc | github.com/teacherzoled/computersc | Computer Science subject page + lessons |
| pe | github.com/teacherzoled/pe | Physical Education subject page + lessons |
| portfolios | github.com/teacherzoled/portfolios | Student portfolio gallery |

---

## 📂 Local Folder Structure

All repos are saved locally at:
```
C:\Users\zoloe\OneDrive\Shared with me\Code Projects\Python Projects\
```

Each subject is its own folder and its own Git repo:
```
Python Projects/
├── Virtual-Classroom/
│   └── index.html
├── spanish/
│   ├── index.html                          ← Spanish subject hub page
│   ├── activities/
│   ├── future-plans-with-creer/
│   ├── future-plans-with-esperar/
│   ├── mis-aspiraciones-intro/
│   │   └── index.html                      ← Lesson: Voy a + infinitivo (LIVE)
│   ├── mis-aspiraciones-time-expressions/
│   └── mis-aspiraciones-voy-a-+-ir-infinitivo-s2/
├── science/
│   └── index.html                          ← Science subject hub (LIVE)
├── math/
├── scriptures/
├── computersc/
├── pe/
└── portfolios/
```

> ⚠️ **Git rule:** Every subject is its own separate Git repo. Always `cd` into the specific subject folder before running any git command. The parent `Python Projects` folder is NOT a repo.

---

## 🔑 Passkey System

### How it works
- Students enter a class code once on their first AI feedback request
- Code is saved to `localStorage` key: `vc-passkey` — persists across ALL lessons and ALL subjects on `edlovirtualclassroom.com`
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
A hidden reset code allows the teacher to clear a quiz lock for testing purposes.

| Item | Value |
|---|---|
| Reset code | `RESET-QUIZ` |
| How to use | On the "Test Already Submitted" lock screen, click **🔑 Reset Quiz for Testing** → enter `RESET-QUIZ` in the passkey modal → page reloads fresh |
| Effect | Clears only the current browser/device — does not affect any student's lock |

### Changing the passkey (new school year)
1. Go to `dash.cloudflare.com` → Workers → `edlo-gemini`
2. Find line: `const VALID_KEY = 'EDLO-STD6';`
3. Change to new code e.g. `EDLO-STD7`
4. Click Deploy — updates everywhere instantly

---

## 🤖 AI Feedback System

### How it works
Student submits work → browser checks for passkey (`vc-passkey` in localStorage) → if none, modal appears → student enters code → browser sends answers + passkey to Cloudflare Worker → Worker validates passkey → forwards to OpenAI → OpenAI returns feedback → feedback appears on screen.

### Cloudflare Worker
| Item | Value |
|---|---|
| Worker Name | edlo-gemini |
| Worker URL | https://edlo-gemini.smartstandardsix.workers.dev/ |
| Cloudflare Account | Smartstandardsix@gmail.com |
| Dashboard | dash.cloudflare.com |

### Worker responsibilities
1. Handle CORS (allows requests from GitHub Pages)
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
| Current balance | ~$4.52 |
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
- Wrapper: `max-width: 1400px`, padding `0 max(1rem, 4vw)` — never use `1in`
- Same `max(1rem, 4vw)` in `.site-footer` padding
- Cards: `flex: 0 1 260px`, centered with flexbox, incomplete rows center automatically
- Wide cards (activities/assessments): `flex: 0 1 340px`
- Lab cards: `flex: 0 1 420px`
- Footer year: always `© 2026`

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
Every page footer must read exactly:
```
© 2026 Mr. EdLo's Virtual Classroom — Standard 6 · Belize · All rights reserved.
```
> ⚠️ Year is **2026**, not 2025.

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

### Science Page — Specific Colors per Cycle
Within the Science page, tests and quizzes are color-coded by cycle:
- Cycle 1: Teal (#20C997) tests / Light green (#69DB7C) quizzes
- Cycle 2: Blue (#4DABF7) tests / Light blue (#74C0FC) quizzes
- Cycle 3: Orange (#FF922B) tests / Light orange (#FFA94D) quizzes
- Cycle 4: Pink (#F783AC) tests / Light pink (#F0ABFC) quizzes

### Science Page — Background Animation
The Science page uses a floating molecule animation — small dots connected by thin lines drifting slowly across the screen on a canvas element. The molecule color adapts to the active theme via the `--mol-color` CSS variable.

---

## 📱 Mobile Responsiveness Rules

> These rules are **REQUIRED** on every new page. Learned from live debugging sessions. Following them prevents hours of debugging later.

### Padding — NEVER use `1in`
- Always use `max(1rem, 4vw)` for horizontal padding on `.wrapper` and `.site-footer`
- `1in` = 96px fixed. On a 320px phone that consumes 192px in padding alone, leaving only 128px of content width
- `max(1rem, 4vw)` gives ~16px on small phones and generous spacing on desktop

### Overflow — Always target `html`, not just `body`
- Always add `html { overflow-x: hidden }` to every page
- **`body { overflow-x: hidden }` alone is NOT enough on mobile Chrome**
- On mobile Chrome, overflow propagates to `html` and the browser still allows horizontal scrolling even with the body rule
- Any horizontal overflow — even from a single element deep in the page — will cause the header and footer to appear misaligned even though their own CSS is correct

### white-space: nowrap — DANGER RULE
- **NEVER use `white-space: nowrap` on labels, badges, or dividers that contain long text** without a mobile override
- Long nowrap text (e.g. cycle divider labels like "🌱 Cycle 3 · Energy Extraction / Communication / Plant Diversity · Weeks 15–21") renders at ~600px wide on mobile, blows straight through the wrapper, and pushes the entire page layout off-screen
- This is the root cause of the science page horizontal overflow bug — the cycle divider labels had `white-space: nowrap` + `flex-shrink: 0` and silently broke the full page layout on phones
- If `nowrap` is needed on desktop, always add this inside the `≤640px` media query:
```css
@media (max-width: 640px) {
  .your-label {
    white-space: normal;
    flex-shrink: 1;
  }
  .your-decorative-line {
    display: none; /* hide decorative rules that would appear orphaned below the wrapped label */
  }
}
```

### Media Query Breakpoints — stay consistent
- All hub pages use `max-width: 640px` for mobile overrides
- **Do NOT use `700px`** — it fires on screens that are not truly mobile and causes the `.site-header` to stack into column layout on mid-size screens unnecessarily
- The 60px difference between 640px and 700px caused the science page header to break on tablets

### Touch Targets
- Minimum tap target: `44px × 44px` for all buttons
- Back-to-top button and zoom button must be at least `44px × 44px`
- `42px` is below the guideline — always use `44px`

### Flex layout requirements
- `.site-header`: must have `flex-wrap: wrap` so it reflows at all zoom levels
- `.site-footer`: always `display: flex; flex-direction: column; align-items: center; text-align: center`
- Card grids: always `display: flex; flex-wrap: wrap; justify-content: center`

### Self-contained pages
- **Every page is fully self-contained** — all CSS lives inside a `<style>` block in the same HTML file
- **Never create an external `style.css`** or link to `../../../style.css`
- If a page references an external stylesheet, the fix is to remove the `<link>` tag and embed the styles directly in a `<style>` block

---

## ♿ Accessibility — Text Size / Zoom Feature

All subject hub pages include a magnifying glass zoom button fixed at the **bottom-left corner** of every page.

### How it works
- Button cycles through 4 levels on each click
- 4th click resets to Normal
- Level is saved to `localStorage` key: `vc-zoom` — persists across all pages

| Level | Label | Font Scale | Dot Indicator |
|---|---|---|---|
| 0 — Normal | A | 100% (default) | ○ ○ ○ |
| 1 — Large | A+ | 115% | ● ○ ○ |
| 2 — Larger | A++ | 130% | ● ● ○ |
| 3 — Biggest | A+++ | 150% | ● ● ● |

### What scales
Since all sizing uses `rem` units, everything scales proportionally: headings, card text, descriptions, badges, tab buttons. Cards reflow into fewer columns at higher zoom levels automatically.

### Implementation
```css
html.zoom-1 { font-size: 115%; }
html.zoom-2 { font-size: 130%; }
html.zoom-3 { font-size: 150%; }
```
JavaScript applies the class to `document.documentElement` and saves to `localStorage`.

---

## 🔧 VS Code Workflow

### Opening a repo
`File → Open Folder` → select the subject folder

### Saving files
`Ctrl + S` — always check the dot (●) on the tab disappears before pushing

### Pushing changes to GitHub
```bash
git add .
git commit -m "Your message here"
git push
```

### Switching between repos in terminal
```bash
cd "C:\Users\zoloe\OneDrive\Shared with me\Code Projects\Python Projects\spanish"
```
Replace `spanish` with the repo name you need.

### Find and replace across all files
`Ctrl + Shift + H` — use to update things like the copyright year or school name across all files at once

---

## 📚 Lessons Built

### Spanish
| Lesson | Folder | Status | Activities | AI Feedback |
|---|---|---|---|---|
| Mis Aspiraciones: Voy a + infinitivo | mis-aspiraciones-intro | ✅ Live | ✅ Full interactive | ✅ Active (OpenAI) |

### Science
| Lesson | Folder | Status | AI Feedback |
|---|---|---|---|
| Science Hub | science/index.html | ✅ Live | — |

---

## 🧪 Science Quiz System — Plant Adaptations in Belize

### Overview
A fully interactive, auto-grading quiz covering plant adaptations using Belize-specific examples (cohune palm, mahogany, bay cedar, red mangrove, Belize savanna). Students take it once, download a PDF report, and submit to Google Classroom.

### Quiz Structure
| Section | Questions | Points | Grading |
|---|---|---|---|
| A — Multiple Choice | Q1, Q2, Q3 | 9 | Auto |
| B — Application MCQ | Q4, Q5, Q6 | 9 | Auto |
| C — Matching | Q7 | 3 | Auto |
| D — Short Response | Q8, Q9, Q10 | 9 | AI (OpenAI) |
| **Total** | **10 questions** | **30 marks** | |

### Question Content (Belize context)
| Q | Topic | Belize Example Used |
|---|---|---|
| Q1 | Definition of adaptation | — |
| Q2 | Types of adaptation (multi-select) | — |
| Q3 | Structural adaptation | Cohune palm — large leaves for sunlight capture |
| Q4 | Why plants need adaptations | — |
| Q5 | Dry season adaptation | Belize savanna dry season |
| Q6 | Buttress/wide roots | Mahogany tree in rainforest |
| Q7 | Matching 3 adaptations to types | Cohune palm (structural) / Bay cedar dropping leaves (behavioural) / Mangrove salt proteins (physiological) |
| Q8 | Sentence completion | Rainforest plant in Belize |
| Q9 | Plant comparison + explanation | Belize savanna dry season survival |
| Q10 | Habitat + adaptation + explanation | Red mangrove along Belize coast and cayes |

### Scoring Logic
- **Sections A–C (21 marks):** Pure JavaScript rule-based grading — instant, zero API cost
- **Section D (9 marks):** Sent to OpenAI via Cloudflare Worker — returns score + feedback per question
- **Total = auto score + AI score**
- Performance labels: 80%+ Excellent · 70–79% Good · 50–69% Satisfactory · Below 50% Needs Improvement
- Performance label uses the student's **first name** (pulled from the name field)

### One-Time Lock System
- After submitting, the quiz result is saved to `localStorage` key: `vc-quiz-plant-adaptations`
- If a student reopens the page on the same device/browser, they see a **"Test Already Submitted"** screen with their saved scores
- The lock screen has a **Download PDF** button so they can still retrieve their report
- Teacher reset: click **🔑 Reset Quiz for Testing** on the lock screen → enter `RESET-QUIZ` → page reloads fresh
- Each student's lock is independent — resetting yours does not affect any student

### PDF Report
Generated client-side using **jsPDF CDN** (no server needed). Includes:
- School: Howard Smith Nazarene School · Standard 6 · Belize
- Student name and date
- Teacher: Mr. Edwin Lopez
- Score summary table (Sections A–C / Section D / Total / Percentage)
- Performance level
- All 10 student answers
- Section D AI feedback (score + comment per question)
- Green footer bar with site URL and page numbers

### Anti-Cheat Features
| Feature | How it works |
|---|---|
| **Submit lock** | Submit button disabled until all 10 questions are answered |
| **One-time lock** | Quiz can only be taken once per device/browser |
| **Idle screen blur** | After 10 seconds of no interaction, test blurs behind a "🙈 Screen Hidden" overlay — click anywhere to resume |
| **Tab-switch warning** | Switching tabs or windows triggers a red ⚠️ warning overlay — logged as "Warning 1 of 3" etc. |
| **Answered question fade** | Each question fades to near-invisible (18% opacity, 2.5px blur) 800ms after it is answered — hover to reveal; prevents neighbour glancing |

### Question Progress Bar
- Sticky bar at the top of the page counting "X / 10 questions answered"
- Fills and turns green when all 10 are answered
- Submit button activates only when bar reaches 10/10
- Bar and hint text hide automatically after submission

### localStorage Keys Used by the Quiz
| Key | Purpose |
|---|---|
| `vc-theme` | Theme preference (shared across all pages) |
| `vc-passkey` | Saved class code (shared across all pages) |
| `vc-quiz-plant-adaptations` | Quiz completion lock + saved scores/answers for this quiz |

---

## 🗺️ Future Plans (in order of priority)

1. **More Spanish lessons** — build out remaining lessons using the established template
2. **Other subject pages** — Math, Scriptures, CS, PE lesson content
3. **Rubric system** — add rubric table to PDF output for official grading
4. **AI-powered chatbot** — lesson-aware assistant students can ask questions
5. **Student progress tracking** — Google Sheets integration for scores (Level 2)
6. **Full dashboard** — student login + progress dashboard (Level 3, long term)
7. **Teacher voice audio** — replace TTS with recorded MP3 clips per section

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

## 💰 Cost Summary

| Service | Cost | Notes |
|---|---|---|
| GitHub Pages | Free | Hosting for all pages |
| Cloudflare Worker | Free | 100,000 requests/day free tier |
| OpenAI (gpt-4o-mini) | ~$23/month | 40 students, all lessons active |
| Google Fonts | Free | Fredoka One + Nunito |
| Google Classroom | Free | Assignment submission + grading |

**Total monthly cost when fully built:** ~$23/month

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
| Science | Label the image, step sequencing, true/false, read and answer, quiz |
| Math | Multiple choice, type and check, timed quiz |
| Scriptures | Story sequencing, read and answer, matching pairs |
| PE | True/false, category sort, multiple choice |
| Computer Science | Step sequencing, error detection, matching |

### Implemented Activity Map — Mis Aspiraciones Lesson

| Section | Activity Type | Feedback |
|---|---|---|
| 2 — Estructura | Matching — subject pronoun → verb form | Rule-based ✅/❌ |
| 5 — Después del video | Word bank fill-in | Rule-based ✅/❌ |
| 6 — Checkpoint | Multiple choice quiz — 5 questions, one per conjugation | Rule-based + score |
| 7 — Conecta | Matching pairs — aspiration → plan | Rule-based ✅/❌ |
| 8 — Práctica guiada | Drag & drop sentence builder | Rule-based ✅/❌ |
| 9 — Reto final | Open paragraph | AI feedback only |

---

## 🔊 Text-to-Speech (TTS) Audio System

- Every lesson section has a 🔊 button that reads Spanish content aloud
- Uses browser's built-in Web Speech API — zero cost, no files needed
- Language set to `es-MX` (Latin American Spanish) at rate 0.88
- Alternates female/male voices across sections for variety
- Button pulses green while speaking
- **Future plan:** Replace TTS with teacher's recorded MP3 voice files
  - Record on phone → save as `seccion1.mp3` etc.
  - Upload to `audio/` folder inside each lesson
  - Each button swaps from `speak()` to `new Audio('audio/seccionN.mp3').play()`

---

*Documentation maintained by Mr. EdLo — update this file whenever a new lesson goes live, a new system is added, or a new bug fix is learned.*
