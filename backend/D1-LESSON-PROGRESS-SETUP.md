# Lesson progress on the student's account — D1 setup (Oct 24, 2026)

**What it fixes:** CS lessons started over when a student logged off Windows (the school computers wipe the
browser) or moved to another computer. Signed-in work is now also kept on the server: `edlo-lms` Worker →
Cloudflare **D1** database. Nothing goes live until steps 1–5 are done; the pages work as before until then.

**Order:** do the Cloudflare steps (1–5) first, test (6), then merge the `cs-progress-d1` branch (7).
Either order is safe: lesson pages that cannot reach the progress routes simply keep the browser copy.

## 1. Check the live Worker still matches the mirror (2 min)
dash.cloudflare.com → **Workers & Pages** → **edlo-lms** → **Edit code**. Its `ROUTES = { … }` block should list
exactly: `/login`, `/save-result`, `/progress`, `/leaderboard`, `/teacher-data`, `/award-bonus`, `/prizes`,
`/redeem-prize`, `/lesson-locks`, `/set-lesson-locks`. If it has anything else, STOP and send Claude the live code
first — pasting the new file would remove it.

## 2. Create the database (2 min)
Cloudflare dashboard → **Storage & databases** → **D1 SQL database** → **Create database**.
Name: **`edlo-lms-db`** (location: automatic) → **Create**.

## 3. Create the table (1 min)
In `edlo-lms-db` → **Console** tab → paste this ONE line → **Execute**:

```sql
CREATE TABLE IF NOT EXISTS lesson_state (username TEXT NOT NULL, lesson_key TEXT NOT NULL, state TEXT NOT NULL, rev INTEGER NOT NULL DEFAULT 1, updated_at INTEGER NOT NULL, PRIMARY KEY (username, lesson_key));
```

## 4. Connect it to the Worker (2 min)
**Workers & Pages** → **edlo-lms** → **Settings** → **Bindings** → **Add binding** → **D1 database**.
Variable name: **`DB`** (capitals, exactly) · Database: **`edlo-lms-db`** → **Add binding** / Deploy.

Then **Settings** → **Variables and Secrets** → **Add** → Type **Secret** · Name **`SESSION_SECRET`** ·
Value: copy it from the Apps Script (VC-LMS Sheet → Extensions → Apps Script → ⚙️ Project Settings →
Script Properties → `SESSION_SECRET`). Copy it exactly — no spaces before or after. → **Deploy**.
(Never write this value in the repo.)

## 5. Paste the new Worker code (2 min)
**edlo-lms** → **Edit code** → select all → paste the whole of `backend/edlo-lms-worker.js` → **Deploy**.
Quick check — the health check still answers:
`https://edlo-lms.smartstandardsix.workers.dev/?action=ping` → `{"ok":true,"message":"LMS backend is alive"}`.
**Undo if anything breaks:** edlo-lms → **Deployments** → the previous version → **Rollback**.

## 6. Test with one account BEFORE publishing (5 min)
Test the branch on your computer, so students never see it untested: VS Code → Source Control → **⋯ → Pull**
(or Fetch) → click the branch name at the bottom-left → choose **`origin/cs-progress-d1`** → right-click
`index.html` → **Open with Live Server** (`http://localhost:5500`, already allowed by the Worker) → go to
`http://localhost:5500/standard5/computer-science/lessons/lesson03-swimming-fish/`.
1. Normal window: sign in as **test.student** (`http://localhost:5500/login/`) → open CS Lesson 3 → finish Part 1 (wait for "Part 2 unlocked").
2. Open an **InPrivate / Incognito** window (empty browser = what a wiped school computer looks like) → sign in as
   test.student → open CS Lesson 3. You should see "⏳ Loading your saved work…" for a moment, then Part 1 done
   and Part 2 open.
3. D1 → `edlo-lms-db` → Console: `SELECT username, lesson_key, rev, updated_at FROM lesson_state;` → one row for
   `test.student`.
4. Optional: the teacher button "clear this student's saved answers…" at the bottom of the lesson now clears the
   account copy too (beans stay banked).

## 7. Publish the pages (only after step 6 passes)
Switch VS Code back to `main` first. Then merge branch **`cs-progress-d1`** into `main` (GitHub → Pull requests → New → base `main` ← `cs-progress-d1` →
Merge; or VS Code: checkout `main`, pull, merge the branch, push). It changes: `edlo-utils.js`, CS Lessons 3–5,
`backend/edlo-lms-worker.js`, `backend/README.md`, this file, `PROJECT-DOCS.md`.

## Limits (free plan) — plenty
D1 free: 100,000 writes and 5 million reads per day, 5 GB. A class of 30 doing a 45-minute lesson writes at most
about 1 row per student per minute (≈1,500 writes) — more like a few hundred, because unchanged saves send nothing.
