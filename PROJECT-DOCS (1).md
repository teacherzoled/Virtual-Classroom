# Mr. EdLo's Virtual Classroom — Project Documentation
**Teacher:** Edwin Lopez (Mr. EdLo)  
**School:** Howard Smith Nazarene School, Belize  
**Class:** Standard 6  
**Last updated:** April 2026

---

## 🌐 Live URLs

| Page | URL |
|---|---|
| Main Classroom Hub | https://teacherzoled.github.io/Virtual-Classroom/ |
| Spanish Subject | https://teacherzoled.github.io/spanish/ |
| Mis Aspiraciones Lesson | https://teacherzoled.github.io/spanish/mis-aspiraciones-intro/ |
| Science Subject | https://teacherzoled.github.io/science/ |
| Student Portfolios | https://teacherzoled.github.io/portfolios/ |

---

## 📁 GitHub Repositories

**GitHub Username:** `teacherzoled`  
**GitHub Profile:** https://github.com/teacherzoled

| Repo Name | URL | Contents |
|---|---|---|
| Virtual-Classroom | github.com/teacherzoled/Virtual-Classroom | Main hub homepage |
| spanish | github.com/teacherzoled/spanish | Spanish subject page + all Spanish lessons |
| science | github.com/teacherzoled/science | Science subject page + lessons + quizzes |
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

Each subject is its own folder:
```
Python Projects/
├── Virtual-Classroom/
│   └── index.html
├── spanish/
│   ├── index.html                              ← Spanish subject hub page
│   ├── activities/
│   ├── future-plans-with-creer/
│   ├── future-plans-with-esperar/
│   ├── mis-aspiraciones-intro/
│   │   └── index.html                          ← Lesson: Voy a + infinitivo (LIVE)
│   ├── mis-aspiraciones-time-expressions/
│   └── mis-aspiraciones-voy-a-+-ir-infinitivo-s2/
├── science/
│   ├── index.html                              ← Science subject hub page
│   └── plant-adaptations-quiz/
│       └── index.html                          ← Quiz: Plant Adaptations in Belize (LIVE)
├── math/
├── scriptures/
├── computersc/
├── pe/
└── portfolios/
```

---

## 🔑 Passkey System

### How it works
- Students enter the class code once on their first AI feedback request
- The code is saved to `localStorage` key: `vc-passkey` — persists across ALL lessons and ALL subjects on `teacherzoled.github.io`
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
| Max tokens | 700 (quizzes) / 1000 (lessons) |
| API Key location | Inside Cloudflare Worker code (secure) |
| Key name | edlo virtual classroom |
| OpenAI Dashboard | platform.openai.com |
| Current balance | ~$4.52 |
| Estimated cost | ~$23/month for 40 students across all lessons |

### AI Feedback Rules
- Responds in Spanish for Spanish lessons; English for Science quizzes
- Maximum 2–4 sentences — direct and specific
- Tone: praise correct work, clearly name gaps on partial scores, kind on zero scores
- If student scores below full marks → must name the specific missing concept or feature
- Reserved for open-ended questions only — all objective questions use rule-based logic (zero API cost)

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
- Wrapper: `max-width: 1400px`, padding `0 1in` on left and right
- Cards: `flex: 0 1 260px`, centered with flexbox
- Each subject has its own accent color

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
cd "C:\Users\zoloe\OneDrive\Shared with me\Code Projects\Python Projects\science"
```
Replace `science` with the repo name you need.

### Find and replace across all files
`Ctrl + Shift + H` — use to update things like the copyright year or school name across all files at once

---

## 📚 Lessons & Quizzes Built

### Spanish
| Lesson | Folder | Status | Activities | AI Feedback |
|---|---|---|---|---|
| Mis Aspiraciones: Voy a + infinitivo | mis-aspiraciones-intro | ✅ Live | ✅ Full interactive | ✅ Active (OpenAI) |

### Science
| Quiz | Folder | Status | Questions | AI Grading |
|---|---|---|---|---|
| Plant Adaptations in Belize | plant-adaptations-quiz | ✅ Live | 10 questions / 30 marks | ✅ Active (OpenAI, Q8–Q10) |

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
2. **More Science quizzes** — apply the quiz template to other Science topics
3. **Other subject pages** — Math, Scriptures, CS, PE lesson content
4. **Rubric system** — add rubric table to PDF output for official grading
5. **AI-powered chatbot** — lesson-aware assistant students can ask questions
6. **Student progress tracking** — Google Sheets integration for scores (Level 2)
7. **Full dashboard** — student login + progress dashboard (Level 3, long term)
8. **Teacher voice audio** — replace TTS with recorded MP3 clips per section

---

## 📐 Lesson Template Structure (Spanish)

Every Spanish lesson follows this 10-section structure:

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

## 📄 Section 9 — Final Production System (Spanish Lessons)

### Iteration Rules
- Maximum **2 attempts** per student per lesson
- Attempt 1 → AI gives short feedback (2 sentences max) → student can revise
- Attempt 2 → AI gives final feedback → textarea locks permanently
- After attempt 2 → PDF download section appears with student name field
- After attempt 2 → Upload to Google Classroom button appears

### PDF Download (browser print-to-PDF, no server needed)
PDF includes:
- Lesson title and header
- Student name (filled in by student)
- Date (auto-generated)
- School: Howard Smith Nazarene School · Standard 6 · Belize
- Student's final paragraph
- AI feedback for each attempt
- Footer with site URL and copyright

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
| OpenAI (gpt-4o-mini) | ~$23/month | 40 students, all lessons + quizzes active |
| Google Fonts | Free | Fredoka One + Nunito |
| Google Classroom | Free | Assignment submission + grading |

**Total monthly cost when fully built:** ~$23/month

---

## 🎮 Interactive Activities Library (Rule-Based Logic)

All activities below use pure HTML/CSS/JavaScript logic — zero AI, zero API calls, zero cost. AI feedback is reserved for open-ended production tasks only.

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

*Documentation maintained by Mr. EdLo — update this file whenever a new lesson, quiz, or system is added.*
