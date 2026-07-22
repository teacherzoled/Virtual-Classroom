# 🎛️ Mechanics Bank — the 7 lesson activity types

**Mr. EdLo's Virtual Classroom · Standard 5 Science (then all subjects)**
Built July 21, 2026 (IDEAS #14). Companion to `LESSON-ENGINE-PLAN.md` — that document
decides *how a lesson behaves*; this one lists *what a lesson can be made of*.

---

## Where the code actually lives

**`/standard5/science/lessons/_mechanics-lab/index.html` is the bank.**
It is a real, runnable lesson carrying all seven mechanics at once. It is the copy-paste
source *and* the test bed, deliberately the same file — two copies of the same engine
would drift apart within a month, and the copy nobody runs is the one that rots.

- **Not linked from any hub.** Students never reach it. `noindex` as a second belt.
- **Beans are stubbed** (the `LAB HARNESS` block) so testing never writes a row to the
  Sheet or burns a student's one-award-per-device lock. Everything else runs for real,
  including the 30-🌱 cap and the `granted` reconciliation.
- **A dev toolbar** lets you jump to any mechanic at any tier without playing the
  calibration first. Delete that block when copying.

This file (`MECHANICS-BANK.md`) is the index: what each mechanic exercises, what its DATA
looks like, and when to pick it.

---

## Building a week's lesson from the bank

1. **Pick 3–4 mechanics** (never all 7 — that is a lab, not a lesson). Rule 1: the concept
   picks the mechanic. Rule 2: do not repeat last week's combination.
2. **Copy from the lab**, per mechanic: its `<section>`, its CSS block, its DATA object,
   and its build/render/pick/end functions. All four are marked with the mechanic's name.
3. **Write the DATA** for this week's outcome, at three tiers.
4. **Set one line** — `LESSON.mechanics`:

```js
window.LESSON = {
  week:'Wk7', lo:'SC2.03', name:'…', idBase:'std5-sci-wk07',
  mechanics:['detective','myth','data']      // ← the whole choice, in order
};
```

Everything downstream is derived from that array: the step chain, the Next-button labels,
the progress-bar total, the tier rebuild, the replay reset, and the activity numbering.
**There is no chain wiring to edit by hand.** Before this, swapping a mechanic meant
editing `nextButton('#secA','#secB',…)` calls in three places, and forgetting one stranded
the student on a dead card. That failure mode is gone.

Two safety behaviours worth knowing:

- **A mechanic section left in the HTML but not named in `LESSON.mechanics` deletes itself
  at boot.** Pasting too much is harmless.
- **A mechanic named but not pasted is skipped**, not fatal — the lesson degrades to a
  shorter chain rather than breaking.

---

## The seven

| # | Key | Mechanic | Exercises | Reach for it when… |
|---|---|---|---|---|
| 1 | `sim` | 🏙️ Consequence simulator | Apply, predict | choices have trade-offs and a running total (budgets, emissions, resources) |
| 2 | `trace` | 🔍 Trace-it-back | Analyse hidden causes | the everyday object hides its real source (the fan, the plug, the till receipt) |
| 3 | `detective` | 🕶️ Detective scene | Analyse, classify under pressure | the outcome is "identify examples of X" and the misconceptions are *specific things* |
| 4 | `myth` | 🕵️ Myth-buster | Evaluate claims | the week has widely believed wrong statements to knock down |
| 5 | `chain` | 🔗 Chain builder | Sequence, structure | the concept IS a causal chain, especially one with several endings |
| 6 | `streak` | ⚡ Beat-your-streak | Recall, fluency | vocabulary-heavy weeks; cheap to author, good for revision weeks |
| 7 | `data` | 📊 Data reader | Interpret evidence | the outcome asks students to read a graph, compare figures, or spot a trend |

> **Field mission is NOT in the bank.** It was designed (off-screen "find a real example on
> your street") and **withdrawn by Edwin on July 21, 2026** before it was built: a free-text
> answer cannot be auto-graded, so every bean rule for it was either unearnable or
> ungameable-in-name-only. **Data reader replaced it** — it fills a real gap (no other
> mechanic touches chart reading, which the science outcomes keep asking for) and it grades
> itself honestly. If a transfer-to-community task is ever wanted, it belongs on paper or in
> the classroom session, not in the bean economy.

---

## DATA schemas

Every mechanic keys its data by tier: `{ bronze:…, silver:…, gold:… }`.
Beans are always **score × tier rate** (Bronze 1×, Silver 2×, Gold 3×), trimmed to the
30-🌱 lesson cap client-side and again on the server.

**Two engine rules apply to every mechanic, including any new one:**

- **Answer positions are shuffled at render.** Options, tile order, claim order, scene
  layout. A lesson can never be beaten by tapping the same position each time. A new
  mechanic must call `shuffleItemOnce()` / `shuffleInPlace()` in its render, or determine
  correctness position-free (as the simulator does via `co2 < 0`).
- **Feedback is self-paced.** Explanation appears, then a `continueBtn()` the student taps.
  **No `setTimeout` for navigation, ever.** The whole file should contain exactly two
  timers: the toast, and the streak's own 60-second clock.

### 1 · `sim` — Consequence simulator

```js
var SIM = { bronze:[ { q:'The town needs power. What do you build?',
                       o:[ { t:'Diesel generator', co2:+3, money:-20, fb:'…' },
                           { t:'Solar array',      co2:-2, money:-45, fb:'…' } ] } ], … };
```
`co2 < 0` is the climate-friendly choice — correctness is read from the *effect*, not the
slot, so this one is shuffle-proof by construction. `money` moves the second meter.

### 2 · `trace` — Trace-it-back

```js
var TRACE = { bronze:[ { start:'🌀 An electric fan',
                         chain:['It plugs into the wall','The wall wire runs to the grid','The grid is fed by a power station'],
                         q:'What is burning to keep this fan spinning?',
                         o:['Nothing','Fuel at the power station','The wire'], a:1,
                         final:'…' } ], … };
```
The student reveals `chain` link by link, then answers. Good for any "it looks clean but…"
misconception.

### 3 · `detective` — Detective scene

```js
var DETECT = { bronze:{ prompt:'Tap the <b>5 things that put carbon dioxide into the air</b>.',
                        items:[ { e:'🚌', label:'Bus engine', hit:true,  why:'…' },
                                { e:'🚲', label:'Bicycle',    hit:false, why:'…' } ] }, … };
```
- Targets are **counted from the data** — never hard-code how many.
- **🔍 charges = ceil(targets / 2).** A wrong tap costs one. This is the load-bearing part:
  without it a student taps every tile and scores full marks, and the activity measures
  patience instead of judgement. Keep **at least as many decoys as charges**.
- `why` is required on decoys too — a decoy someone tapped is a misconception caught in the
  act, and that is the most teachable moment the mechanic produces.
- **Gold may flip the rule** (find what *slows* warming). Re-reading the prompt is a fair
  difficulty step and it stops Gold being merely "the same hunt with harder words."
- Ending without finding everything names what was missed. A hunt that just stops teaches
  nothing.

### 4 · `myth` — Myth-buster arena

```js
var MYTH = { bronze:[ { claim:'All technology harms the climate.', bust:true, why:'…' } ], … };
```
Claim **order** is shuffled as well as options — before that, the true/false rhythm was
learnable. Keep each tier's bust/true split uneven but mixed, so "always press one button"
is not a strategy. Two-choice activities have an inherent ~50% guess floor; this mechanic
should never be the only thing carrying a lesson's marks.

### 5 · `chain` — Chain builder

```js
var CHAIN = { silver:[ { prompt:'Warmer seas reach the whole town. Build ONE chain — then look for a second.',
                         tiles:['🌊 The sea gets warmer','🪸 Coral bleaches','🐟 Fewer fish live on the reef',
                                '🎣 Fishers earn less','🤿 Fewer snorkellers book a trip','🏨 The hotel earns less',
                                '📻 The radio played music'],
                         valid:[ ['🌊 The sea gets warmer','🪸 Coral bleaches','🐟 Fewer fish live on the reef','🎣 Fishers earn less'],
                                 ['🌊 The sea gets warmer','🪸 Coral bleaches','🤿 Fewer snorkellers book a trip','🏨 The hotel earns less'] ],
                         why:'…' } ], … };
```
- **`valid` may hold several chains.** First valid chain scores 1; a *second, different* one
  scores a bonus 1. That is the point of the mechanic — it teaches that one cause has several
  consequences, and it is what stops this being a memory test with one right answer.
- Every chain in a round must be the **same length** (length is taken from `valid[0]`).
- Link strings must match the pool **exactly** — they are compared as text.
- Always include at least one **decoy tile**, and make it obviously irrelevant rather than
  subtly wrong (a decoy that is arguably part of the chain makes the round unfair, since only
  the listed orders score).

### 6 · `streak` — Beat-your-streak

```js
var STREAK = { bronze:[ { q:'Renewable or not: solar?', o:['Renewable','Not renewable'], a:0 } ], … };
```
60 seconds, deck loops until time runs out. Best streak saved in `localStorage`, per lesson.
Beans are **capped at one full deck** so a fast student cannot farm the loop.
The only mechanic with a clock — and the clock starts on the student's **tap**, never on
reveal, and it never governs navigation.

### 7 · `data` — Data reader

```js
var DATAR = { bronze:[ { title:'Average temperature, Belize City', unit:'°C', type:'line',
                         labels:['1990','2000','2010','2020'], values:[26.1,26.5,27.0,27.6],
                         q:'Which year on this graph was the warmest?',
                         o:['1990','2000','2010','2020'], a:3,
                         why:'…' } ], … };
```
- **The chart is drawn from the numbers** by `chartSVG()` — never an image file. A week
  supplies `labels` + `values` and gets a themed, responsive chart. Charts cannot go stale,
  cannot arrive unreadable, and recolour with `body.theme-*`.
- `type:'bar'` compares separate things; `type:'line'` shows change over time. Line charts
  get automatic headroom so a nearly-flat series still shows its shape.
- viewBox is **320 × 210** and in-chart text is **11 units**, so it renders around 11px on a
  360px phone — legible without zooming.
- **Four charts per tier is the floor.** A chart takes longer to read than a myth claim, but
  not four times longer — two charts is an activity a student finishes in under a minute while
  it carries a quarter of the lesson's marks.
- Difficulty ladder that works: **read one value** → **compare two / subtract** → **judge a
  claim about the data**. Gold is where "weather is not climate" reasoning belongs — a short,
  local, jumpy series is exactly the graph that invites a wrong conclusion.
- The distractors that earn their place are **arithmetic slips, not nonsense**: for a
  difference question, offer the two values on their own and their *sum* — adding when the
  question asks for a difference is the mistake a Standard 5 student actually makes.

> ⚠️ **The sample data in the bank is a TEMPLATE, not filler.** Week 2 was generated with two
> charts because the bank shipped with two — the build copied the shape, not the instruction.
> Item counts, difficulty spread and distractor quality in the lab all propagate to every week
> built from it. Author the sample as if it were a real lesson, because in effect it is thirty.

---

## Adding an 8th mechanic later

Rule 3 of the plan says the bank grows. The cost is now small:

1. A `<section class="sec step-hidden" id="secX">` in the lab.
2. Its CSS block.
3. `buildX()` / `renderX()` / `xPick()` / `xEnd()`, ending with
   `award(...)` → `markDone(...)` → `progressTick()` → `advance('x')`.
4. **One line in the `MECHANICS` registry.**

Nothing else in the engine changes. Then add it to the table above and to
`LESSON-ENGINE-PLAN.md` §5.

**Other subjects will need their own mechanics.** These seven were chosen against Science
outcomes. Spanish needs production and listening formats; Mathematics needs working-shown
formats; Scripture needs passage-and-application formats. The *engine* carries over intact;
the mechanics do not.

---

## Verification checklist (run before a mechanic is trusted in a real week)

- `node --check` on the extracted script blocks.
- Play each tier to a perfect score — does it reach the authored maximum?
- Play each tier badly — does it end cleanly, explain, and never award more than earned?
- Confirm the lesson total still stops at **30 🌱**.
- Confirm exactly **two** timers in the file (toast, streak clock).
- Confirm the **`PROGRESSIVE LESSON UNLOCK`** guard is still at the end of the file
  (IDEAS #8) — a DATA swap must never delete an engine block.
- **Open it on a phone.** The July 21 lesson: a rendering defect calculated from an assumed
  viewport was wrong, and the figures were fine on the real device. Verify on the device
  before believing a measurement.
