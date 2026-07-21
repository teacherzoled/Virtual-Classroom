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

**Collapsible cards (auto-collapse) — Edwin's decision, July 20, 2026.** Every `section.sec` gets
a ▾/▸ toggle built automatically at boot by `makeCollapsible()` — no per-week markup needed.
- The **concept review folds itself** when the student clicks "start practising", and each
  **finished activity folds 2.6 s after its result appears** (long enough to read the score).
- **Tapping the heading or the ▸ arrow reopens any card**, so the diagram and notes stay one tap
  away all lesson. Nothing is ever deleted — only hidden.
- A mid-lesson **tier switch re-expands** the rebuilt activities and cancels any pending fold.
- Purpose: the page stays short as the student progresses, instead of forcing them to scroll
  past a long review section to reach the questions.

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
- **Enforcement must be BACKEND, not client-only** — the Sheet logs every bean row, so Apps
  Script refuses beans past 30 per student per lesson. Client-only caps can be dodged by
  clearing the browser. (Implementation detail for the build session.)
- Year math (sanity check): 30 lessons × 30 = 900 🌱 from Science alone. Sticker (100) ≈ 3–4
  lessons; homework pass (750) ≈ two-thirds of a year single-subject. ⚠️ When a SECOND subject's
  lessons launch, retune store prices AND the class goal (IDEAS #5 covers the goal side).

---

## 5. Mechanics bank (variation system)

**Rule 1 — the concept picks the mechanic.** Each mechanic exercises a different kind of
thinking; match it to the week's outcome. The activity must make the student DO the outcome.
**Rule 2 — recent weeks veto repeats.** No mechanic combination repeats two weeks running.
**Rule 3 — the bank grows.** Add mechanics mid-year; never let the rotation go stale.

| # | Mechanic | Exercises | Example fit |
|---|---|---|---|
| 1 | **Consequence simulator** — run a town/system with a budget; meters respond to choices; replay for a better ending | Apply, analyze | Wk1: mayor chooses diesel vs solar; emissions meter |
| 2 | **Trace-it-back chain** — click backwards from an innocent-looking thing to its hidden source | Analyze (hidden causes) | Wk1: electric fan → wire → power plant → what burns? (encodes the fan trap from the scheme) |
| 3 | **Detective scene** — one illustrated Belizean scene; find the N hidden examples in it | Analyze dressed as a hunt | Wk1: six emission sources in a street scene |
| 4 | **Myth-buster arena** — claims pop up; bust or confirm; reason revealed after each | Evaluate | Wk1: "All technology harms the climate" |
| 5 | **Chain builder** — drag cause-effect tiles into a valid chain; beans for finding a second valid chain | Apply, structure | Any causal-loop week |
| 6 | **Beat-your-streak recall** — 60-second quick-fire round; best streak saved locally; bean multiplier | Recall/retrieval | Vocabulary-heavy weeks; cheap to build weekly |
| 7 | **Field mission** — off-screen task: find real examples in your street/home; report back | Transfer to community | Wk1: feeds the Session 3 T-chart, doesn't duplicate it |

**Week 1 (SC 1.09) proposed set:** Simulator + Trace-it-back + Myth-buster + Streak
— hits apply, analyze, evaluate, recall. ⏳ Awaiting Edwin's confirmation.

**For the scheduled Weeks 4–30 generator (IDEAS #11):** the task prompt instructs — "pick 3–4
mechanics from the bank in LESSON-ENGINE-PLAN.md §5 to fit this week's scheme outcome; do not
reuse the previous week's set." Variety becomes an instruction, not a hope.
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
2. Bean-cap backend enforcement design (Apps Script + Worker touch — plan in build session).
3. Whether the calibration score feeds anything beyond the tier offer (e.g., logged to Sheet
   for Edwin's gradebook awareness — decide at build).
