# 🎓 Lesson Pedagogy Rubric — Std5 Science online lessons
**The teaching-quality review a lesson passes BEFORE Edwin pushes it.** Created July 21, 2026 at
Edwin's request, after several content issues (answer-position bias, gratuitous "Belizean", weak
distractors) slipped past the engineering checks. The code-level checks (does it run, grade, cap)
live in the daily-task prompt and `LESSON-ENGINE-PLAN.md`; THIS is about whether the lesson
teaches and assesses fairly.

**Reviewer stance:** a veteran primary-science teacher and assessment designer, reviewing for
Standard 5 (ages 10–11, Belize, many EAL learners). The reviewer READS and REPORTS; it does not
edit. It is a strong FIRST FILTER — it catches the mechanical pedagogy faults so Edwin's own
review can spend its time on judgment. It is not a substitute for Edwin's teacher eye.

## Read first
1. The lesson `index.html` — the `LESSON`, `CALIB`, `SIM`, `TRACE`, `MYTH`, `STREAK` data and the
   concept-review section.
2. That week's `Std5_Science_Weekly_Scheme_WeekNN_*.docx` and the cycle's
   `Std5_Science_CycleN_Teacher_Notes.md` — outcome, vocabulary, and the SPECIFIC misconceptions
   the scheme says to target.
3. `LESSON-ENGINE-PLAN.md` for design intent.

## The 9 checks — score each PASS / WEAK / FAIL with quoted evidence

1. **Outcome alignment.** Every activity exercises the week's SC outcome at the verb's cognitive
   level ("explain" needs reasoning, not recall). Nothing tests content un-taught by this week.
2. **Assessment fairness (gameability).** Is the answer guessable WITHOUT the science? Check: the
   correct option being longest/most-detailed; a learnable true/false rhythm in myth-buster; silly
   distractors that make elimination trivial; the same idea tested twice. (Answer POSITION is
   engine-shuffled — skip position, check the distractors.)
3. **Distractor quality.** Each wrong answer should be a plausible mistake revealing a specific
   misconception — not a throwaway ("it is heavy", "it needs a driver"). Name the weak ones and
   suggest replacements.
4. **Misconception targeting.** Does the lesson probe THIS week's named misconceptions from the
   scheme (e.g. Wk1: electric fan "clean"; chainsaw harms one way), or only generic ones?
5. **Cognitive demand across tiers.** Bronze/Silver/Gold differ in THINKING, not just wording.
   Bronze recall/recognition; Gold analysis/evaluation. Flag tiers that are the same difficulty
   relabelled.
6. **Reading level & EAL access.** Short sentences, one idea per stem, no double negatives,
   vocabulary within the word bank, no unexplained idiom. Quote any stem a struggling EAL
   10-year-old would trip on.
7. **Feedback as teaching.** Each explanation says WHY and corrects the misconception — a learning
   moment, not just "Correct/Not quite". Flag confirm-only feedback.
8. **Local context.** Belize/place/species named only where it is the subject, the outcome names
   it, or two places are compared — never "Belizean town/bird/people" as decoration. Flag
   gratuitous uses.
9. **Tone & motivation.** Encouraging, coach-not-judge, age-appropriate; nothing discouraging to a
   struggling student.
10. **Visual support.** Is there a figure everywhere one is REQUIRED, and nowhere it is only decoration?
    - **REQUIRED when the idea is structural, not verbal:** a causal chain, a two-way/feedback
      relationship, a sequence, a comparison of two systems, a direction that could be reversed, or a
      spatial "the effect happens somewhere else" misconception. **If the lesson data contains arrows,
      `→`, `???`, or a chain written inside a string, a figure is required — the author already drew it
      and then flattened it into text.**
    - **OPTIONAL (build after the required ones):** giving an existing number or word-state something to
      feel — a meter given a scene, a countdown given an arc.
    - **DECORATION — do NOT build:** language-evaluation tasks (myth-buster claims); anything beside a
      diagnostic calibration item (it telegraphs the answer and corrupts the placement); icons that turn
      a science judgement into picture-recognition; anything that slows a timed retrieval round; a chain
      shown during a "start or result?" streak item (it gives away every answer).
    - **Also check:** does the concept-review figure carry EVERYTHING the card teaches? A figure showing
      one of two taught chains is incomplete content, not a style choice.

## SVG build rules (apply to every lesson figure)
- **R1 — Prefer a phone-scale `viewBox`** (~360 units wide ⇒ 1 unit ≈ 1 phone pixel) so authored font
  sizes are directly checkable. Useful guidance for NEW figures.
- **R2 — Aim for ~12 rendered px** for labels after `viewBox` scaling.
  ⚠️ **CAVEAT — do not treat R1/R2 as a bug report.** On July 21, 2026 Claude calculated that the
  existing Wk1/Wk2 figures rendered labels at 5.4–6.1px and called them "unreadable". **Edwin checked
  on his actual phone: both render clearly, sub-labels included.** The calculation assumed a 360px
  viewport and ignored that high-DPI screens render small text far more crisply than the CSS-pixel
  number implies. **VERIFY A RENDERING CLAIM ON A REAL DEVICE BEFORE ACTING ON IT** — arithmetic about
  legibility is not evidence. The existing figures are fine and must not be redrawn for legibility.
- **R3 — `viewBox` + `width:100%`**; never pixel `width`/`height` on the root `<svg>`.
- **R4 — Theme, don't hardcode.** Use `currentColor` and `var(--card) / --bd / --accent / --fg / --muted`.
  Reserve literal hex for semantic constants (warm/cool arrows, `--right`/`--wrong`). A hardcoded dark
  panel reads as a foreign block in the sunny/cloudy/nature themes.
- **R5 — Never encode meaning in colour alone** — always a second channel (word, glyph, shape).
- **R6 — A figure is NEVER the only carrier of the answer.** With images off, the stem, options and
  explanation must still be complete.
- **R7 — Announce it.** `role="img"` + descriptive `aria-label`; if the figure changes with the answer,
  update the label or mirror it in an `aria-live="polite"` node.
- **R8 — No emoji inside `<svg><text>` for load-bearing content** — inconsistent metrics across Android
  WebViews; fine as redundant decoration beside a real label.
- **R9 — Tap targets ≥44px** after scaling, for any interactive SVG region.

## Output
- One-line verdict: **SHIP** / **SHIP WITH FIXES** / **DO NOT SHIP**.
- The 9 checks, each: `PASS/WEAK/FAIL — quoted evidence — fix`.
- **Priority fixes**: the 3–5 that matter most, most important first.

Specific and quoted beats vague praise. A named weak distractor with a suggested replacement is
the most useful thing this review can produce.

## How this runs in the pipeline
- **Daily task:** after building a lesson it runs this rubric as its own review pass (STEP 6.5)
  and includes the verdict + priority fixes in its report, so Edwin sees the pedagogy verdict
  next to the draft. The task still DRAFTS ONLY — a WEAK/FAIL verdict flags the lesson for Edwin,
  it does not block.
- **On demand:** Edwin (or Claude) can run this rubric against any lesson at any time for a deep
  review — e.g. before pushing, or to re-check after edits.
