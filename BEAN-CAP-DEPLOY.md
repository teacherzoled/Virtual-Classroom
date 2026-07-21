# 🌱 Server-Side Bean Cap — Deploy Steps for Edwin

**Built July 21, 2026.** Makes the 30-bean per-lesson cap real. Until this is deployed the cap is
client-side only and a student who clears the browser can re-earn beans on the same lesson.

Website code is done and committed. **Three steps below happen outside the repo** — in Google Apps
Script. The Cloudflare Worker needs **no change** (it passes the whole request body through).

---

## What changes

| Piece | Change | Where |
|---|---|---|
| `All Results` tab | New column **L = `lesson_key`** | VC-LMS Google Sheet |
| Apps Script | `handleSaveResult` caps lesson beans; new `sumLessonBeans()` | VC-LMS Backend |
| `edlo-utils.js` | `vcSaveBeans` sends `lesson_key`, trusts the server's `awarded` | ✅ done in repo |
| Week 1 lesson | Sends `lesson_key`, reconciles the bean pill with the server | ✅ done in repo |
| Worker | **nothing** — already passes unknown fields straight through | — |

**Why a new column and not `lo_code`:** one outcome can span two weeks — SC1.11 is Weeks 3 **and**
4, SC2.12 is 11 & 12, SC3.13 is 15 & 16, SC4.16 is 20 & 21. Keying the cap on `lo_code` would give
two different lessons one shared 30-bean budget.

---

## STEP 1 — Paste the new Apps Script

1. Open the **VC-LMS** Google Sheet → **Extensions → Apps Script**
2. Select all of the existing `Code.gs` and delete it
3. Paste the full contents of **`backend/VC-LMS-Backend.gs`** from the repo
4. **Save** (💾)

## STEP 2 — Run the one-off migration

Still in the Apps Script editor:

1. In the function dropdown at the top, choose **`addLessonKeyColumn`**
2. Click **Run**
3. Approve the permission prompt if it appears
4. Check the log — it should say `lesson_key header added to column L.`

Safe to run twice; it checks first and reports `already done`.

**Existing rows keep a blank `lesson_key` on purpose.** They were earned before the cap existed and
must not be retro-counted against a student's budget.

## STEP 3 — Redeploy the Web App

⚠️ **Easy to miss — pasting code alone does NOT update the live endpoint.**

1. **Deploy → Manage deployments**
2. Click the ✏️ pencil on the existing deployment
3. Version → **New version**
4. **Deploy**

The URL stays the same, so no Worker or website change is needed.

---

## Verify it worked (5 minutes)

1. Log in on `/standard5/science/lessons/week01-technology-climate/` as a test student
2. Play through at **Gold** — the bean pill should stop at **30**
3. Open the sheet: the new rows should show `std5-sci-wk01` in column **L**
4. **The real test:** clear the browser (or use a private window), log in as the *same* student,
   and replay the lesson. Beans should now say **+0** and the total in the sheet must stay at 30.
   Before this deploy, that replay would have earned another 30.
5. Open any Std5 test and submit it — the mark must be **unaffected** (tests are never capped).

---

## What the backend now returns

`save-result` replies with:

```json
{ "ok": true, "percent": 100, "awarded": 12, "capped": true,
  "lesson_total": 30, "lesson_cap": 30 }
```

- `awarded` — beans **actually banked** (may be less than requested)
- `capped` — true if the cap trimmed the award
- `lesson_total` — the student's running total for that lesson
- The lesson page reconciles its on-screen bean pill against `awarded`, so the number a student
  sees is always what the sheet holds.

## Verified before shipping

Cap logic was ported to Node and attacked. All checks pass:

- a perfect **Gold** run banks exactly 30; a perfect **Bronze** run banks 28, leaving 2 that can
  only be reached by levelling up — the cap doing its teaching job
- a replay at a higher tier is granted **only the remainder**, then 0
- **10 full replays after clearing the browser earn 0 extra beans** (the attack this fixes)
- each lesson has its own budget; each student has their own
- **tests and quizzes are never capped**, even if one carries a `lesson_key`
- legacy blank-key rows do not eat a student's new budget

## Rollback

Paste the previous `VC-LMS-Backend.gs` from git history and redeploy. Column L can stay — nothing
breaks if it is ignored, and the tab-3/4 formulas read `A:J` only.
