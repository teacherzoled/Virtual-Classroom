# Power-Up 3A — Image Prompts

**Standard 5 Science & Technology · Cycle 1 · Goes home Monday, discuss Wednesday**
Spec: `../POWERUP-IMAGE-SPEC.md`. Batch file: `PROMPTS-BATCH.txt` (5 blocks, blank-line separated).

---

## Order map

The plugin saves in prompt order, and position is the only link back. **Block N → qN.**

| Block | File it becomes | Question | Answer being tested |
|---|---|---|---|
| 1 | `q1.webp` | What is the difference between weather and climate? (one line) | weather = right now / short term · climate = the usual pattern over many years |
| 2 | `q2.webp` | Name ONE Belizean industry that climate change can damage. | tourism · agriculture/farming · fishing |
| 3 | `q3.webp` | Name the step where water turns from gas back to liquid. | condensation |
| 4 | `q4.webp` | Which method separates sand from water? | filtration / filtering |
| 5 | `q5.webp` | Name ONE tool a scientist uses to measure, and what it measures. | thermometer→temperature, ruler→length, cylinder→volume, scale→mass, rain gauge→rainfall, stopwatch→time |

---

## Plugin settings

Auto ChatGPT v1.3.4 → **Text to Image** → **Upload .txt file** → `PROMPTS-BATCH.txt`

- **Concurrent Prompts: 1** — with more than one running, whichever finishes first saves first and
  the order stops matching. That silently breaks the map above.
- **Outputs per Prompt: 1** — if you raise it to pick between variants, say so before I convert.
- **Save to folder:** `…\standard5\science\power-ups\3a\_source`
- Random Delay 20–30 s is fine. Five images take roughly two to three minutes.

---

## Subject lines (the part after the style block)

**q1 · weather vs climate** — a wide view of a Belizean coastal town street on a changeable
afternoon, bright sunshine and clear blue sky over the near rooftops while a grey curtain of rain
sweeps in over the sea in the far distance, palm trees leaning in the breeze, shallow puddles on the
road catching the light, colourful wooden houses raised on stilts.

> *Deliberately shows only weather.* A picture contrasting "one day" with "many years" would hand
> over the answer, so this scene shows a single changeable afternoon and nothing else.

**q2 · Belizean industry** — a wide working landscape under a hard midday sun, sugar cane and a
citrus grove with dry cracked earth between the rows, a farmer in a straw hat looking out over the
crop, a small fishing boat at a dock on a calm sea beyond.

> Shows the industries visually without naming them — the recall task is still to produce the word.

**q3 · condensation** — a close-up of a very cold bottle of water on a wooden table on a shaded
veranda, the glass beaded with fat droplets running down, a ring of water at its base, humid green
garden blurred behind.

> The everyday version of gas → liquid, rather than a water-cycle diagram. A cycle diagram would
> have to label the step, and 2A already uses the cycle for a different question.

**q4 · filtration** — cloudy sandy water poured from a beaker through a filter-paper-lined funnel,
sand caught on the paper, clear water dripping into a clean jar below.

**q5 · measuring tools** — an overhead arrangement of a thermometer, a measuring cylinder of blue
liquid, a metal ruler, a two-pan balance with weights, a stopwatch and a rain gauge, evenly spaced
on a wooden table.

> Six tools, so no student is stuck for an example, and the second half of the answer (what it
> measures) still has to come from memory.

---

## Notes for the rebuild

- Q1 and Q5 are **two-part answers** (weather AND climate · tool AND what it measures). Following
  2B Q5, those get two input lines and both must pass to earn the bean.
- Q2 accepts tourism, agriculture/farming **and** fishing here — unlike 2A Q1, which asked for one
  of the *two biggest earners* and so excluded fishing. Different question, different accept list.
- Row tints follow the house order: green, blue, purple, orange, teal.
- If a block needs regenerating on its own, the new image arrives out of sequence — tell me which
  one, or I fix it with `--map`.
