# 🎮 Online Lesson Engine — Design Plan
**Mr. EdLo's Virtual Classroom · Standard 5 Science (then all subjects)**
Agreed between Edwin and Claude, July 20, 2026. Status: **DESIGN SETTLED — nothing built yet.**
This document is the source of truth for every online lesson built from Week 1 onward,
including the scheduled daily builds of Weeks 4–30 (IDEAS #11).

---

## 1. Philosophy (Edwin's brief, July 20, 2026)

- The online lesson **enhances and supports** what was taught in class. It is **NOT a repetition
  of the classroom sessions** and does not duplicate the weekly scheme's activities.
- Its job is **practice — plenty of it, varied** — so students cement the week's concept.
- Keep the **concept review** section, then go straight to interactive activities.

  ⚠️ **"Brief" means CONCISE, not REDUCED. Clarified by Edwin July 20, 2026 after Claude wrongly
  deleted the Week 1 two-way-loop SVG while "keeping the review brief."**
  The concept section must still **teach the concept**, because students take notes from it:
  - **KEEP the diagram/figure.** Any SVG the lesson had is preserved verbatim — a student copies
    it into an exercise book. Never drop a figure to save space.
  - **KEEP the definitions** of the week's key terms.
  - **KEEP the local Belize framing** (why this matters here — coastline, reef, hurricane season,
    Macal River, and so on). This is what makes the topic real rather than abstract.
  - **CUT instead:** long paragraphs, restaged classroom activities, anything the class already
    did in session. Trim wordiness, never substance.
  - **A figure is content, not formatting.** Removing one is a content decision — ask Edwin first.
- The Spanish lessons are a **guide for tone and polish, NOT a template** to clone.
- Everything plugs into the existing bean/points system and Bean Store prizes.

---

## 2. Lesson flow (fixed skeleton, every week)

Shown **one card at a time** — each step appears only when the student taps to advance (see the
reveal-flow note below). This is the fixed order:

1. **Concept review** — teaches the week's idea concisely: definitions → **the diagram/figure** →
   worked local examples → the Belize "why it matters here" note → key-term cards. Note-taking
   material. Concise in wording, complete in substance (see the ⚠️ rule in §1).
2. **Calibration activity** — same for every student, ~5 questions, game-feel not test-feel.
   Doubles as a diagnostic; its score sets the tier offer. Pays up to 5 🌱.
3. **Tier offer** — based on calibration score (thresholds §3), bean rates shown up front
   ("Gold: 3× beans per correct answer").
4. **Tiered activities** — 3–4 mechanics chosen from the bank (§5) for THIS week's concept.
   Difficulty and bean rate set by tier. Step-down/step-up active throughout (§3).
5. **Finish line** — bean summary, best-tier badge for the visit, "come back and beat it."

The skeleton never changes; the mechanics inside it change weekly. Students learn the ladder
once, the game stays fresh.

**ONE CARD AT A TIME — reveal flow (Edwin's decision, July 21, 2026).** Rebuilt after phone
testing: the old model kept every card on the page (locked/greyed) and auto-scrolled + auto-folded
on a timer, which threw the viewport to the bottom of the page on a phone — a student had to scroll
back to find where they were. The new model shows **only the active card**.

- Downstream cards start `display:none` (`.step-hidden`). `revealStep(sel)` un-hides one card and
  does a **single controlled scroll to it after layout settles** (double `requestAnimationFrame`),
  so a scroll never races a reflow — that race was the bug.
- **Every transition is a button the student taps** — `nextButton()` injects a full-width
  **Next →** button into the finished card. Tapping it collapses that card to its header and
  reveals the next. **No navigation timers anywhere.** A slow or EAL reader takes as long as they
  like to read the bean result before moving on.
- **Per-QUESTION feedback is also self-paced (July 21, 2026).** Inside the simulator, trace and
  myth activities, after each answer the explanation appears with a `continueBtn()` — **Next
  choice → / Next case → / Next claim →**, and **See the result →** on the last item. The feedback
  stays until the student taps. This replaced 2.4–2.8 s auto-advance timers: any fixed delay still
  cuts off the slowest readers, and **reading the feedback is a learning moment**, not a flash.
  The only remaining timer in the whole lesson is the toast pop-up and the streak's own clock.
  ⚠️ The continue button is injected INTO the shown feedback box, so it can never appear before the
  explanation it follows.
- Finished cards **collapse to a tappable header** (via `makeCollapsible()`), so the review
  diagram and earlier activities stay one tap away. Nothing is deleted, only folded.
- **The streak is the one timed activity** — but the timer runs only the 60-second round, never
  the navigation. The student taps **Start** to begin it (clock starts on their tap, not on
  reveal) and taps **See my results →** to leave. Entry and exit are button-gated like every other
  card; the clock creates urgency inside the activity, never in the flow between cards.
- **90%+ auto-promotion** no longer auto-starts on a timer — the Gold card is highlighted and the
  student taps it to begin (consistent with "every step is a tap").
- **Replay** (`replayFrom(tier)`) re-hides the downstream cards, strips old Next buttons, and
  `startTier` reveals the simulator again — a clean restart of the reveal chain.
- Step chain: Review → Calibration → Tier offer → Simulator → Trace → Myth → Streak → Finish.

**⚠️ PROGRESSIVE-UNLOCK GUARD is part of the ENGINE (fixed July 21, 2026).** The file ends with a
`PROGRESSIVE LESSON UNLOCK` guard `<script>` before `</body>` (IDEAS #8). It derives the week from
`window.LESSON.week` (so `LESSON.week:'Wk2'` → guards Week 2; Week 1 self-disables via
`THIS_WEEK <= 1`) and shows a "this lesson opens later" curtain if the week is not yet released on
the `lesson-locks` endpoint. **It must survive every rebuild — a DATA-swap must never delete an
engine block.** On 21 July a daily-build rebuild of Week 2 silently dropped this guard (Week 1, the
copy source, is always-open so had no visible guard), which would have leaked an unreleased week;
it is now engine-level and derived from `LESSON.week` so a copy carries it automatically. The
daily-task prompt greps for the guard as a required verification.
- Purpose: focus. The student sees one thing, finishes it, taps to continue. Nothing scrolls out
  from under them — the exact failure this replaced.

---

## 3. Tier ladder — Bronze / Silver / Gold (Edwin's decisions)

Maps to the E/M/H differentiation already used in the weekly schemes.

**Placement after calibration:**
| Calibration score | Result |
|---|---|
| **90%+** | 🥇 **Promoted straight to Gold** — celebratory framing ("You've been promoted!"), with a quiet "start at Silver instead" link (protects the anxious-but-capable student; costs nothing) |
| **80–89%** | Free choice of any tier — motivational note that higher tiers earn more beans |
| **50–79%** | Silver offered; Gold **visible but locked**: "one more strong round unlocks this" |
| **below 50%** | Bronze, framed as "warm-up"; full ladder visible from the start — visible Gold is the motivator |

**Coach-style step-down (NOT a demotion):**
- Trigger: ~2 misses in a row at a tier.
- Framing: the game is a coach, not a judge — "Gold is tough! Let's sharpen up in Silver and
  come back." NEVER punitive language, never a visible "downgrade."
- **Beans already earned are NEVER taken back** (site-wide standing rule: totals never go down).
  The cost of struggling at Gold is earning less, not losing.
- **The door back up stays open in the same visit:** a strong Silver round re-unlocks Gold.
  The ladder moves both directions all session.

---

## 4. Bean economy (Edwin's decisions)

- **Per-lesson cap: 30 🌱** (double the old flat 15).
- Calibration: up to 5 🌱. Tier runs pay **per correct answer**: Bronze ≈1, Silver ≈2, Gold ≈3.
- **One strong Gold visit ≈ reaches the cap in a single session.** Bronze/Silver visits CANNOT
  reach 30 in one pass — the remainder is only reachable by replaying at a higher tier.
  **This is deliberate: the student who most needs practice is the one with beans left on the
  table, so the cap itself is the reason to return.** Replay past the cap stays open — it just
  pays nothing.
- ✅ **BACKEND ENFORCEMENT BUILT July 21, 2026.** `handleSaveResult` in `VC-LMS-Backend.gs` sums a
  student's existing beans for that lesson and trims the award to fit the 30 cap. The client cap
  stays for instant feedback, but the server is the real limit — clearing the browser now earns 0.
  **Deploy steps for Edwin: `BEAN-CAP-DEPLOY.md`** (paste script → run `addLessonKeyColumn` →
  redeploy the Web App). Worker needs no change.
  - **Lessons are keyed by a NEW `lesson_key` column (L) in `All Results`** — e.g. `std5-sci-wk01`.
    ⚠️ **Never key the cap on `lo_code`:** one outcome spans two weeks (SC1.11 = Wks 3 & 4,
    SC2.12 = 11 & 12, SC3.13 = 15 & 16, SC4.16 = 20 & 21), which would merge two lessons' budgets.
  - **Every lesson page MUST pass `lesson_key: LESSON.idBase`** in its `vcSaveBeans` meta, and
    display `res.granted` rather than the beans it asked for. Week 1 is the worked example.
  - Only `activity_type === 'lesson'` is capped. Tests and quizzes are graded assessments and are
    never trimmed.
- Year math (sanity check): 30 lessons × 30 = 900 🌱 from Science alone. Sticker (100) ≈ 3–4
  lessons; homework pass (750) ≈ two-thirds of a year single-subject. ⚠️ When a SECOND subject's
  lessons launch, retune store prices AND the class goal (IDEAS #5 covers the goal side).

---

## 5. Mechanics bank (variation system)

**⚠️ TWO CONTENT RULES enforced in the engine / required of every lesson (added July 21, 2026):**

- **Answer positions are SHUFFLED at render.** `shuffleItemOnce()` / `shuffleSimOnce()` randomise
  each question's options so the correct answer is never in a fixed slot. **Myth-buster shuffles
  its CLAIM ORDER too** (`mythDeck` in `buildMyth`, July 21, 2026) — before this the true/false
  sequence was fixed and a student could learn the rhythm (Week 2 alternated in all three tiers).
  A 2-choice activity still has an inherent ~50% guess floor; keep each tier's bust/true split
  uneven-but-mixed so "always click one button" is not a strong strategy. **Do not rely on this to
  excuse lazy authoring, but it means a lesson can never be beaten by clicking one position** —
  even the daily task's clustered answers are neutralised. Any NEW mechanic must call the shuffle
  helper in its render (or determine correctness position-free, as the simulator does via `co2<0`).
  Found July 21: Week 1 & 2 trace/sim had the correct answer in the SAME slot every question.
- **Local context only where it carries meaning** (Edwin's rule, `Std5_Science_CycleN_Teacher_Notes.md`).
  The whole site is in Belize, so **do NOT write "Belizean town / Belizean bird / Belizean people"**
  — name Belize, a district, a species or a place ONLY when it is the actual subject, the outcome's
  wording names it, or two places are being compared (e.g. Belize vs the world, Belize City vs New
  York in Wk3). "A town" not "a Belizean town." A wheelbarrow is still a wheelbarrow.

**Rule 1 — the concept picks the mechanic.** Each mechanic exercises a different kind of
thinking; match it to the week's outcome. The activity must make the student DO the outcome.
**Rule 2 — recent weeks veto repeats.** No mechanic combination repeats two weeks running.
**Rule 3 — the bank grows.** Add mechanics mid-year; never let the rotation go stale.

✅ **ALL 7 MECHANICS IMPLEMENTED — July 21, 2026 (IDEAS #14).** Rule 2 is now satisfiable: seven
mechanics give 35 combinations of four, so no week need repeat the one before it. Detective scene,
chain builder and data reader were built and verified in the same session.

⚠️ **FIELD MISSION WAS WITHDRAWN, NOT BUILT — Edwin's decision, July 21, 2026.** An off-screen
"find a real example on your street" task cannot auto-grade a free-text answer, so every bean rule
available to it was either unearnable or gameable in one keystroke. **Data reader replaced it** as
mechanic 7: it fills a genuine gap — no other mechanic exercises reading a chart, which the science
outcomes repeatedly ask for — and it grades itself honestly. A transfer-to-community task still has
value, but it belongs in the classroom session or on paper, outside the bean economy.

📍 **The code lives in `/standard5/science/lessons/_mechanics-lab/index.html`** — a runnable lesson
carrying all seven at once, unlinked from any hub, with beans stubbed. It is both the test bed and
the copy-paste source, deliberately the same file. **Schemas and build instructions:
`MECHANICS-BANK.md`.**

🔑 **A week now picks its activities in ONE LINE** — `LESSON.mechanics:['detective','myth','data']`.
The step chain, Next-button labels, progress total, tier rebuild, replay reset and activity
numbering are all derived from that array. Hand-edited `nextButton()` wiring is gone, and with it
the failure where swapping a mechanic stranded the student on a dead card. A section left in the
HTML but not named removes itself at boot; a mechanic named but not pasted is skipped rather than
fatal.

| # | Key | Mechanic | Exercises | Example fit |
|---|---|---|---|---|
| 1 | `sim` | **Consequence simulator** — run a town/system with a budget; meters respond to choices; replay for a better ending | Apply, analyze | Wk1: mayor chooses diesel vs solar; emissions meter |
| 2 | `trace` | **Trace-it-back chain** — click backwards from an innocent-looking thing to its hidden source | Analyze (hidden causes) | Wk1: electric fan → wire → power plant → what burns? (encodes the fan trap from the scheme) |
| 3 | `detective` | **Detective scene** — tap every example hidden in one scene; wrong taps cost 🔍 charges | Analyze dressed as a hunt | Wk1: five emission sources among decoys; Gold flips the rule to "what SLOWS warming" |
| 4 | `myth` | **Myth-buster arena** — claims pop up; bust or confirm; reason revealed after each | Evaluate | Wk1: "All technology harms the climate" |
| 5 | `chain` | **Chain builder** — tap cause-effect tiles into a valid chain; bonus bean for a SECOND valid chain | Apply, structure | Any causal-loop week; the two-chain rounds teach that one cause has several endings |
| 6 | `streak` | **Beat-your-streak recall** — 60-second quick-fire round; best streak saved locally; bean multiplier | Recall/retrieval | Vocabulary-heavy weeks; cheap to build weekly |
| 7 | `data` | **Data reader** — a bar/line chart drawn from the week's numbers, then questions about it | Interpret evidence | Any week with figures: temperature by decade, CO₂ by transport, sea level; Gold is where "weather is not climate" reasoning belongs |

**Week 1 (SC 1.09) proposed set:** Simulator + Trace-it-back + Myth-buster + Streak
— hits apply, analyze, evaluate, recall. ⏳ Awaiting Edwin's confirmation.

**For the scheduled Weeks 4–30 generator (IDEAS #11):** the task prompt instructs — "pick 3–4
mechanics from the bank in LESSON-ENGINE-PLAN.md §5 to fit this week's scheme outcome; do not
reuse the previous week's set." Variety becomes an instruction, not a hope.
⏳ **The daily task prompt still needs updating** — it is pinned to the original four mechanics and
copies Week 1. It should now copy the mechanic blocks it picked from `_mechanics-lab/index.html`,
set `LESSON.mechanics`, and read the previous week's `LESSON.mechanics` to enforce Rule 2
mechanically rather than by instruction. Until that edit lands, the daily builds keep producing
four-mechanic lessons even though seven are available.
The prompt must ALSO carry the §1 ⚠️ rule: **never delete a diagram, definition, or the Belize
framing in the name of brevity** — otherwise one wrong reading of "brief" repeats 27 times.

**When Edwin's instruction is ambiguous, ASK — do not pick a reading and proceed** (his standing
request, July 20, 2026). Deleting the Week 1 diagram is the worked example of getting this wrong:
"keep the review brief" was read as permission to cut content, when it meant tighten the wording.

---

## 6. What this replaces / relation to existing docs

- The current Week 1–3 lessons (vocab match, sort, fill-loop, checkpoint quiz, true/false, all
  flat-15-bean) are the **samples this design revises** — IDEAS #9.
- Weekly schemes (Std5_Science_Weekly_Scheme_Week*.docx, 15 built as of July 20) are the
  curriculum source: the online lesson practises the scheme's outcome, it does not restage the
  scheme's classroom activities.
- Tier names map to the schemes' E/M/H differentiation.
- Bean rules obey the site-wide standing rule: earned totals never decrease.

## 7. Open items before the first build

1. Edwin confirms the Week 1 mechanics set (§5).
2. ~~Bean-cap backend enforcement~~ ✅ **BUILT July 21, 2026** — see §4 and `BEAN-CAP-DEPLOY.md`.
   ⏳ Awaiting Edwin's 3 deploy steps in Google Apps Script.
3. Whether the calibration score feeds anything beyond the tier offer (e.g., logged to Sheet
   for Edwin's gradebook awareness — decide at build).
