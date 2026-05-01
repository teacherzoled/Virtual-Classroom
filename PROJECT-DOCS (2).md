# Mr. EdLo's Virtual Classroom — Project Documentation
**Teacher:** Edwin (Mr. EdLo)  
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
| Student Portfolios | https://teacherzoled.github.io/portfolios/ |

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

Each subject is its own folder:
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
├── math/
├── scriptures/
├── computersc/
├── pe/
└── portfolios/
```

---

## 🔑 Passkey System

### How it works
- Students enter a class code once on their first AI feedback request
- Code is saved to `localStorage` key: `vc-passkey` — persists across ALL lessons and ALL subjects on `teacherzoled.github.io`
- The passkey is validated server-side inside the Cloudflare Worker — never exposed in browser code
- Wrong code → Worker returns 403, key is cleared, modal reappears
- Code rotates automatically every month — no manual Worker update needed
- Purpose: prevents codes from leaking outside the classroom — even if shared, they expire at month end

### Code type: Monthly revolving (auto-rotating)
The Worker uses a pre-set schedule inside `getCurrentValidKey()`. On the 1st of each month the code changes automatically. Announce the new code to students at the start of each month. Students with last month's saved code will be rejected and the modal will reappear asking for the new one.

### Monthly Code Schedule 2026
| Month | Code |
|---|---|
| April 2026 | `EDLO-STD6` (fallback — active until May 1) |
| May 2026 | `JAGUAR-77` |
| June 2026 | `REEF-STAR4` |
| July 2026 | `TAPIR-X9` |
| August 2026 | `COPAL-33` |
| September 2026 | `HOWLER-51` |
| October 2026 | `CEIBA-28` |
| November 2026 | `TOUCAN-6K` |
| December 2026 | `XMAS-EDLO` |

### localStorage & validation details
| Item | Value |
|---|---|
| localStorage key | `vc-passkey` |
| Validation location | Cloudflare Worker (server-side, secure) |
| Scope | Site-wide — works across all subjects automatically |

### Updating codes for a new school year
1. Go to `dash.cloudflare.com` → Workers → `edlo-gemini`
2. Click **Edit Code**
3. Find the `schedule` object inside `getCurrentValidKey()` (around line 16)
4. Add new year entries e.g. `"2027-01": "NEWCODE-1"`
5. Click **Deploy** — updates everywhere instantly

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
- Wrapper: `max-width: 1400px`, padding `max(1rem, 4vw)` on left and right
- Cards: `flex: 0 1 260px`, centered with flexbox
- Each subject has its own accent color

### 📱 Mobile Responsiveness Rules

These rules are REQUIRED on every new page. Learned from debugging sessions.

#### Padding
- NEVER use `1in` for horizontal padding — on a 320px phone it leaves only 128px of content
- Always use `max(1rem, 4vw)` in both `.wrapper` and `.site-footer`

#### Overflow
- Always add `html { overflow-x: hidden }` — `body` alone is NOT enough on mobile Chrome
- Overflow on `body` only propagates to `html` and the browser still allows horizontal scrolling
- Any horizontal overflow will misalign the header and footer even if those elements are coded correctly

#### White-space and nowrap — DANGER RULE
- NEVER use `white-space: nowrap` on labels, badges, or dividers that contain long text
- Long nowrap text (e.g. cycle divider labels) renders at full pixel width and blows out the entire page layout on mobile, misaligning everything below it
- If `nowrap` is needed on desktop, always add a `≤640px` media query override:
```css
  @media (max-width: 640px) {
    .your-label {
      white-space: normal;
      flex-shrink: 1;
    }
  }
```

#### Media query breakpoints
- All hub pages use `max-width: 640px` for mobile overrides — keep this consistent
- Do NOT use `700px` — it fires on screens that are not mobile and causes the header to stack unnecessarily

#### Touch targets
- Minimum tap target size: `44px × 44px` (back-to-top button and any icon buttons)
- `42px` is too small — always use at least `44px`

#### Flex layouts on mobile
- `.site-header`: add `flex-wrap: wrap` so it reflows cleanly at all zoom levels
- `.site-footer`: always `display: flex; flex-direction: column; align-items: center`
- Cards: always `flex-wrap: wrap; justify-content: center` so incomplete rows center automatically

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

---

## 🗺️ Future Plans (in order of priority)

1. **More Spanish lessons** — build out remaining lessons using the established template
2. **Other subject pages** — Science, Math, Scriptures, CS, PE lesson content
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
| Science | Label the image, step sequencing, true/false, read and answer |
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

- Every section has a 🔊 button that reads Spanish content aloud
- Uses browser's built-in Web Speech API — zero cost, no files needed
- Language set to `es-MX` (Latin American Spanish) at rate 0.88
- Alternates female/male voices across sections for variety
- Button pulses green while speaking
- **Future plan:** Replace TTS with teacher's recorded MP3 voice files
  - Record on phone → save as `seccion1.mp3` etc.
  - Upload to `audio/` folder inside each lesson
  - Each button swaps from `speak()` to `new Audio('audio/seccionN.mp3').play()`

---

*Documentation maintained by Mr. EdLo — update this file whenever a new lesson goes live or a new system is added.*


---

## 🌐 Live URLs

| Page | URL |
|---|---|
| Main Classroom Hub | https://teacherzoled.github.io/Virtual-Classroom/ |
| Spanish Subject | https://teacherzoled.github.io/spanish/ |
| Mis Aspiraciones Lesson | https://teacherzoled.github.io/spanish/mis-aspiraciones-intro/ |
| Student Portfolios | https://teacherzoled.github.io/portfolios/ |

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

Each subject is its own folder:
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
├── math/
├── scriptures/
├── computersc/
├── pe/
└── portfolios/
```

---

## 🤖 AI Feedback System

### How it works
Students write Spanish sentences → click ✓ Revisar → browser sends answer to Cloudflare Worker → Worker forwards to OpenAI → OpenAI returns feedback in Spanish → feedback appears on screen.

### Cloudflare Worker
| Item | Value |
|---|---|
| Worker Name | edlo-gemini |
| Worker URL | https://edlo-gemini.smartstandardsix.workers.dev/ |
| Cloudflare Account | Smartstandardsix@gmail.com |
| Dashboard | dash.cloudflare.com |

### AI Provider
| Item | Value |
|---|---|
| Provider | OpenAI |
| Model used | gpt-4o-mini |
| API Key location | Inside Cloudflare Worker code (line 15) |
| OpenAI Dashboard | platform.openai.com |
| Current balance | ~$4.50 |
| Estimated cost | ~$23/month for 40 students across all lessons |

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
- Wrapper: `max-width: 1400px`, padding `max(1rem, 4vw)` on left and right
- Cards: `flex: 0 1 260px`, centered with flexbox
- Each subject has its own accent color

### 📱 Mobile Responsiveness Rules

These rules are REQUIRED on every new page. Learned from debugging sessions.

#### Padding
- NEVER use `1in` for horizontal padding — on a 320px phone it leaves only 128px of content
- Always use `max(1rem, 4vw)` in both `.wrapper` and `.site-footer`

#### Overflow
- Always add `html { overflow-x: hidden }` — `body` alone is NOT enough on mobile Chrome
- Overflow on `body` only propagates to `html` and the browser still allows horizontal scrolling
- Any horizontal overflow will misalign the header and footer even if those elements are coded correctly

#### White-space and nowrap — DANGER RULE
- NEVER use `white-space: nowrap` on labels, badges, or dividers that contain long text
- Long nowrap text (e.g. cycle divider labels) renders at full pixel width and blows out the entire page layout on mobile, misaligning everything below it
- If `nowrap` is needed on desktop, always add a `≤640px` media query override:
```css
  @media (max-width: 640px) {
    .your-label {
      white-space: normal;
      flex-shrink: 1;
    }
  }
```

#### Media query breakpoints
- All hub pages use `max-width: 640px` for mobile overrides — keep this consistent
- Do NOT use `700px` — it fires on screens that are not mobile and causes the header to stack unnecessarily

#### Touch targets
- Minimum tap target size: `44px × 44px` (back-to-top button and any icon buttons)
- `42px` is too small — always use at least `44px`

#### Flex layouts on mobile
- `.site-header`: add `flex-wrap: wrap` so it reflows cleanly at all zoom levels
- `.site-footer`: always `display: flex; flex-direction: column; align-items: center`
- Cards: always `flex-wrap: wrap; justify-content: center` so incomplete rows center automatically

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
cd "C:\Users\zoloe\OneDrive\Shared with me\Code Projects\Python Projects\spanish"
```
Replace `spanish` with the repo name you need.

### Find and replace across all files
`Ctrl + Shift + H` — use to update things like the copyright year across all files at once

---

## 📚 Lessons Built

### Spanish
| Lesson | Folder | Status | AI Feedback |
|---|---|---|---|
| Mis Aspiraciones: Voy a + infinitivo | mis-aspiraciones-intro | ✅ Live | ✅ Active (OpenAI) |

---

## 🗺️ Future Plans (in order of priority)

1. **More Spanish lessons** — build out remaining lessons using the established template
2. **Other subject pages** — Science, Math, Scriptures, CS, PE lesson content
3. **AI-powered chatbot** — lesson-aware assistant students can ask questions
4. **Student progress tracking** — Google Sheets integration for scores (Level 2)
5. **Full dashboard** — student login + progress dashboard (Level 3, long term)

---

## 📐 Lesson Template Structure

Every lesson follows this 10-section structure:

| Section | Content | Feedback Type |
|---|---|---|
| 1 — Hook | Thinking questions | None |
| 2 — Estructura | Key grammar + conjugation | Rule-based (future) |
| 3 — Antes del video | Pre-listening guide | None |
| 4 — Video | Embedded YouTube | None |
| 5 — Después del video | Post-viewing sentences | Rule-based (future) |
| 6 — Checkpoint | ALTO — all conjugations | Rule-based (future) |
| 7 — Conecta | Aspiration + plan | None |
| 8 — Práctica guiada | Guided fill-ins | Rule-based (future) |
| 9 — Reto final | Final paragraph | ✅ AI feedback |
| 10 — Reflexión | Self-check questions | None |

**AI feedback strategy:** Reserve AI only for Section 9 (final production). Use rule-based logic for all other interactive sections. This keeps API costs minimal (~1 call per student per lesson).

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

## 📄 Section 9 — Final Production System

### Iteration Rules
- Maximum **2 attempts** per student per lesson
- Attempt 1 → AI gives feedback → student can revise
- Attempt 2 → AI gives final feedback → textarea locks permanently
- After attempt 2 → Download PDF button appears
- After attempt 2 → Upload to Google Classroom button appears

### PDF Download (browser-generated, no server needed)
PDF includes:
- Lesson title
- Student name field (student fills in before downloading)
- Student's final paragraph
- AI feedback received (both attempts if applicable)
- Date

### Google Classroom Upload
- Button appears only after both attempts are used
- Links to the Google Classroom assignment URL
- Student downloads PDF first then uploads manually
- Teacher assigns via Google Classroom as normal

### Why 2 iterations
- 1 attempt = too rigid, no chance to improve
- 2 attempts = forces deliberate revision after reading feedback
- 3+ attempts = encourages guessing, reduces thinking

---

*Documentation maintained by Mr. EdLo — update this file whenever a new lesson goes live or a new system is added.*
