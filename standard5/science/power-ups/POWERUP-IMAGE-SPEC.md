# 🎨 Power-Up Illustration Spec & Workflow

**Mr. EdLo's Virtual Classroom · Standard 5 Science & Technology · Power-Up worksheets**
Agreed August 7, 2026. Read this before writing prompts for any new Power-Up set.

---

## Why Power-Ups do NOT use the lesson-icon pipeline

The lesson-icon library (`/assets/lesson-icons/`) takes **square 1024×1024 single objects on plain
white**, strips the white, and base64-embeds the PNG into a `.svg`. That is right for a 26–40 px tile
that must be keyed, reusable and manifest-listed.

Power-Up art is a different animal:

| | Lesson icons | Power-Up illustrations |
|---|---|---|
| Subject | one object | a full scene |
| Shape | square 1:1 | landscape 3:2 |
| Background | plain white, stripped | part of the picture |
| Reuse | keyed in `manifest.json` | one-off, tied to one question |
| Delivery | base64 inside `.svg` | `.webp` via `<img>` |

Five base64-embedded photoreal scenes would push one worksheet past 8 MB. As WebP the same five land
around **270 KB** (measured, August 7, 2026). These pages open on a Chromebook shared by seven
students — that difference is the whole reason for the split.

---

## The agreed cadence — one set at a time, 10 minutes of Edwin's time

Settled August 7, 2026, and it governs everything below. During term Edwin builds **two sets a
week** and has roughly **20 minutes a week** for it. So the loop is:

1. Claude hands over **5 prompts** (`PROMPTS-BATCH.txt`).
2. Edwin runs the batch and says the images are ready. *(his only real time cost)*
3. Claude stages, **verifies the mapping himself**, converts, and builds the page.
4. Edwin tests the finished page.
5. **Done — or at most ONE more iteration.**

**Step 5 is the contract.** 3A took five rounds because the pipeline was new; every one of those
causes is now a written rule. If a build needs more than one correction, the fault is a rule that
was not followed, not an unavoidable cost — go back and find which one.

### Pre-flight — Claude runs ALL of this before handing a page over

Never hand over a page that has not passed every line. This checklist is what protects the
10 minutes.

- [ ] **DOM test**: stub `document.getElementById`, fill the real field ids, drive `readAnswer()` for
      all five questions. Two-part questions must be proven independent of each other.
- [ ] **Accept lists**: simulated student answers, including the traps — `i dont know`, a bare
      restatement, and any key that hides inside another word.
- [ ] **Key stems are plural-tolerant**: `siev` not `sieve`, `filt` not `filter`.
- [ ] **Size budget**: whole page under ~600 KB, photoreal converted at `--quality 76`.
- [ ] **Image ↔ text coupling**: whenever an image changes, the `alt` text AND any hint that
      mentions the picture must change with it. This caught us twice on 3A Q2 alone.
- [ ] **No answer in the picture** — check every image against the context-not-answer rule below.
- [ ] **JS syntax check** and tag-balance check on the built file.
- [ ] **No residue** from the page it was copied from: stale ids, dead CSS, comments naming the
      wrong set.

---

## The workflow

Edwin generates in **batch**, using a ChatGPT plugin that reads a plain text file and produces one
image per block. That shapes everything below — see *Batch format* next, it is not optional detail.

1. **Claude writes two files** for the set:
   - `power-ups/<set>/PROMPTS.md` — human-readable: the order map, the subject line per question,
     and any regeneration notes.
   - `power-ups/<set>/PROMPTS-BATCH.txt` — the paste-ready batch file, five blocks, nothing else.

   Both are **committed**. The prompt that made an image is what lets anyone regenerate it, so it
   belongs in history — the Cycle 2–4 icon images were lost for good precisely because the art
   existed only as files.
2. **Edwin runs the batch** through the plugin and regenerates any block he is not happy with — he
   is the judge of the look.
3. **Edwin drops the downloaded images** in `power-ups/<set>/_source/`, under whatever names the
   plugin gave them. **Do not rename them.** The converter handles it.
4. **Claude stages first — always:**
   ```
   python3 tools/powerup-images.py standard5/science/power-ups/<set> --stage
   ```
   This writes `img/_STAGE-check-order.png`, a contact sheet with every picture labelled with the
   name it is about to receive. Edwin confirms the mapping is right.
5. **Then Claude converts:**
   ```
   python3 tools/powerup-images.py standard5/science/power-ups/<set>
   ```
   Resizes to 1200 px wide, writes `<set>/img/q1.webp` …, prints a size report, warns on anything
   that is not landscape or that pushes the worksheet over 600 KB, and emits paste-ready `<img>`
   tags with `width`/`height` so the page never shifts while loading.

   **Photoreal needs `--quality 76`, not the default 82.** Photographs compress far worse than flat
   art: 3A's five came to 722 KB at q82 and 575 KB at q76, with no visible difference at the 400 px
   the page displays them at. Drop to `--quality 72` (531 KB) if a set is unusually detailed.
6. **Claude wires them into the page**, replacing the placeholder SVG in each `.illus-col`, and
   writes real `alt` text (never leaves the placeholder).
7. **The originals stay in `_source/`** for re-exporting at another size — but `_source/` is **not
   committed** (see below), so they live on your machine and in OneDrive, not in the repo.

---

## Batch format — how the prompt file must be written

**The tool:** ChatGPT Automation — Auto ChatGPT (v1.3.4, kylenguyen.me), in **Text to Image** mode,
fed by **Upload .txt file**. It splits the file into blocks separated by a blank line: one block =
one image, generated in order. Its own help text is the rule — *"Separate each prompt with a blank
line."*

**1. A prompt MAY span multiple lines.** Only a *blank* line ends it. So blocks can be wrapped for
readability — break the style block across several lines if that helps you read it.

**2. Each block must be a COMPLETE, STANDALONE prompt.** There is no "apply the style block to
everything below" — the plugin never sees a heading. So the **STYLE BLOCK is written out in full
inside every single block**, followed by that image's subject line. Blocks are long and repetitive.
That is correct.

**3. No markdown, no numbering, no bullets, no headings, no `---` rules.** Anything on the page
becomes part of the prompt. `PROMPTS-BATCH.txt` is plain text containing nothing but the blocks and
the blank lines between them. All commentary lives in `PROMPTS.md` instead.

**4. Exactly one blank line between blocks, and none inside one.** A stray empty line splits one
prompt into two and shifts every image after it by one position.

```
[full style block] [q1 subject line]
which may wrap onto as many lines as you like
                                        <- exactly one blank line
[full style block] [q2 subject line]

[full style block] [q3 subject line]
```

### Plugin settings for a Power-Up batch

| Setting | Use | Why |
|---|---|---|
| Mode | **Text to Image** | |
| Prompts | **Upload .txt file** → `PROMPTS-BATCH.txt` | `.xlsx / .csv` also works, one prompt per row, if you ever prefer it |
| **Concurrent Prompts** | **1 prompt** | ⚠️ see below — this one matters more than it looks |
| Random Delay | 20–30 s | leave as is; five images take roughly two to three minutes |
| Outputs per Prompt | **1** | raise it only if you want variants to choose from — but then the downloads no longer land one-per-question, so tell Claude before converting |
| **Save to folder** | `…/power-ups/<set>/_source/` | point it straight at the source folder and there is nothing to move by hand |

> **⚠️ Keep Concurrent Prompts at 1.** With 2 or more running at once, whichever finishes first is
> saved first — so the download order stops matching the prompt order. Since position is the only
> link between a prompt and its image, concurrency silently scrambles the mapping. `--stage` would
> catch it, but it is far easier not to create the problem.

### ⚠️ Order is the only link between prompt and image

The plugin downloads sequentially, with nothing in the filename tying an image back to the prompt
that made it. Position is the whole mapping. So:

- `PROMPTS.md` always carries an **order map**: block 1 → q1, block 2 → q2, and so on.
- If Edwin regenerates one block on its own, that image arrives out of sequence — tell Claude which
  one, or the converter's `--map` flag fixes it (`--map q3,q1,q2,q5,q4`).
- **`--stage` is not skippable.** This is the exact failure that scrambled the Cycle 2–4 icons.

### 🔒 Source files are read-only, permanently

`tools/powerup-images.py` opens `_source/` read-only and writes only to `img/`. It never renames,
moves or deletes a source file. This rule exists because a previous batch script renamed in place
with `os.replace()`, which overwrites on collision, and destroyed roughly 44 generated icon images
that OneDrive could not recover. Any future tooling touching these folders inherits the same rule.

---

## Image spec

- **Size:** ask for landscape. ChatGPT returns **1672 × 941 (16:9)** in practice, which suits the
  slot better than 3:2 — accept it. The photo column is capped at 400 px, so a 1200 px conversion is
  comfortably 2×+ for high-DPI screens.
- **Format:** PNG out of ChatGPT. Do not pre-compress — the converter handles it.
- **Naming:** `q1.png`, `q2.png`, `q3.png`, `q4.png`, `q5.png`. Exact, lowercase.
- **One scene per question.** No collages, no multi-panel grids unless the question itself is a
  comparison (e.g. healthy reef vs bleached reef), in which case say so in the prompt.

### ⚠️ Two hard rules

**1. NO TEXT IN THE ART.** No labels, captions, numbers, letters or watermarks. This is partly for
style consistency, but mostly because a label is an answer key: the printed 2B sheet captions the
right-hand reef "Bleached Reef", which is the literal answer to Q1, and captions all four green
technologies, which is the literal answer to Q2. On a bean-paying page that makes the bean free.
If a comparison needs labelling, the page adds it in HTML — where it can be a `?` instead.

**2. SHOW THE CONTEXT OR THE PHENOMENON — NEVER THE ANSWER OBJECT.** This is the rule that matters
most, and photoreal art made it urgent (3A, August 7 2026). Power-Ups are **retrieval practice**: the
whole value is in producing the answer from memory. A picture that contains the answer turns
retrieval into recognition, which is far weaker for long-term memory — the bean is still paid, but
the learning is not.

The 3A images divide cleanly along this line:

| Question | Picture | Verdict |
|---|---|---|
| Q3 gas → liquid | a real cold bottle beaded with droplets | ✅ shows the **phenomenon** they must name |
| Q4 separating sand | apparatus mid-pour | ✅ shows the **process**, the word is still recall |
| Q5 measuring tools | six real instruments | ✅ shows the **referent**, the second half is recall |
| Q1 weather vs climate | one changeable afternoon | ✅ shows **only weather**, the contrast is withheld |
| Q2 name an industry | cane, citrus, a farmer, fishing boats | ❌ shows **three answers at once** |

A drawing could get away with this because it was too crude to read quickly. A photograph cannot. So
when the answer *is* an object, photograph the **cause, the setting, or the consequence** instead —
for Q2, drought-cracked land under a hard sun, with no crop and no boat in frame.

**3. THE PICTURE IS NEVER THE SOLE CARRIER OF AN ANSWER** — house rule R6/R7,
`LESSON-ICON-LIBRARY-PLAN.md`: *the stem, options and explanation must be complete with images off.*
A student on a slow connection, or using a screen reader, must still be able to answer. The image
supports the question; it never IS the question.

---

## STYLE BLOCK — prepend to every Power-Up subject line

> *Rich, warm, semi-realistic children's-educational illustration in a painted storybook style:
> detailed and believable but friendly, with soft natural lighting, gentle depth and atmosphere,
> saturated but harmonious colours, smooth shading and no hard black outlines. A complete little
> scene filling the whole frame, composed with a clear focal subject and an uncluttered background.
> Landscape 3:2 format. Absolutely no text, letters, numbers, labels, captions, watermarks or
> borders anywhere in the image. Accurate to the real thing, and true to Belize where the subject is
> local — Caribbean coast, reef, savanna, rainforest, or a Belizean town street.*

*(This is deliberately different from the lesson-icon STYLE BLOCK, which asks for flat vector sticker
art on white. Do not mix the two — icons and Power-Up scenes are meant to look different.)*

---

## Writing good subject lines

- **Name what is in the scene, not what the answer is.** "A reef with pale, bare white coral and
  almost no fish" — not "a bleached reef showing coral bleaching."
- **Say the viewpoint and framing** — side-on, three-quarter, close-up, wide.
- **Anchor it in Belize — and name the BIOME, not just the weather.** This is the one that actually
  bites. 3A Q2 first asked for "drought-cracked land under a hard sun", which gave a red-sand African
  desert: correct weather, wrong continent. Rewritten as "Belizean pine savanna, humid lowland
  tropics of Central America, Caribbean pines and palmetto, pale grey-brown clay, low green forested
  hills and humid haze — not a desert and not Africa", it landed first time.
  Useful anchors: Caribbean pine savanna · broadleaf rainforest · mangrove lagoon · barrier reef and
  cayes · limestone karst hills · a coastal town of wooden houses on stilts. Sugar cane and citrus
  rather than wheat, a thatch cabana rather than a ski lodge, a colourful repainted school bus rather
  than a coach.
- **Say what must NOT be in frame.** The exclusion list does real work: "no crops, no boats, no
  buildings, no people" is what keeps a context shot from drifting back into showing the answer.
- **Watch the season vocabulary.** Belize has two seasons, dry and wet. "Spring" and "summer" are
  temperate labels and do not belong in Belize-context art direction.
- **Do not describe a sequence** in a question that tests sequence. 2B Q3 asks students to order the
  water cycle, so the three cards are generated separately and shuffled on the page — never as one
  numbered diagram.

---

## Where things live

```
standard5/science/power-ups/
    POWERUP-IMAGE-SPEC.md          ← this file            ✅ committed
    <set>/index.html               ← the worksheet         ✅ committed
    <set>/PROMPTS.md               ← order map + notes     ✅ committed
    <set>/PROMPTS-BATCH.txt        ← paste into the plugin ✅ committed
    <set>/img/q1.webp … q5.webp    ← what the page loads   ✅ committed
    <set>/img/_STAGE-check-order.png ← throwaway review    ❌ NOT committed
    <set>/_source/001_….png        ← plugin downloads      ❌ NOT committed
```

### ⚠️ `_source/` is gitignored — on purpose

`.gitignore` line 6 is `**/_source/`, which matches at **any** depth. It exists so the multi-megabyte
originals never bloat the repo or its history. Two consequences worth knowing:

- **Anything you put in a `_source/` folder will silently not be pushed.** This spec was first written
  into `power-ups/_source/` and would have vanished at the push; that is why it now sits one level up.
  Check with `git check-ignore -v <path>` if you are unsure.
- **The originals live in OneDrive, not GitHub.** That is fine for regeneration on your own machines,
  but it means a fresh clone has only the WebP files. The committed `PROMPTS.md` is the real backup:
  from it, any image can be regenerated.

`.gitattributes` already declares `*.png`, `*.webp` and `*.jpg` as binary, so the committed WebP
files never get line-ending-mangled on the way into the repo.

---

## Sets built so far

| Set | Art | Note |
|---|---|---|
| 1A, 1B | inline SVG | built before this spec existed |
| 2A, 2B | inline SVG | Edwin chose to keep the SVG drawings (Aug 7, 2026) |
| 3A | generated photoreal | first set through this workflow · 575 KB at q76 |
| 3B onward | generated + converted | this workflow |

### Bug caught in 3A — derive field ids, never hardcode them

2B had exactly one two-part question, so its `readAnswer()` read `q5a`/`q5b` **literally**. Copied
into 3A, where Q1 is also two-part, Q1 silently read Q5's empty boxes and answered *"Fill in BOTH
lines first!"* no matter what the student typed. Field ids must be derived: `'q'+id+'a'`.

The wider lesson: testing the accept lists in isolation passes a page whose **plumbing** is broken.
Every worksheet now gets a DOM-level check — stub `document.getElementById`, fill the real field ids
and drive `readAnswer()` for all five questions, including a case proving two two-part questions are
independent of each other.

### Layout note (3A, August 7 2026)

Photographs carry much more visual weight than the flat SVGs did, and at the original sizing the eye
landed on the picture before the question. On a retrieval sheet that is backwards. So on photo
pages: `.qmain` takes the slack (`flex:1 1 460px`), `.illus-col` does not grow (`flex:0 1 400px`),
photos cap at **400 px** with a soft shadow, and the night theme knocks brightness back to `.92` so
a sunlit Belizean sky does not glare out of a dark page.
