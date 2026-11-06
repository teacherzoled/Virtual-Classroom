# Computer Club — one-time setup (Nov 6, 2026)

About 20 minutes. Do the steps in order. **No code, PIN, password or class link from these steps
ever goes into the repo** — it is public.

The pieces:

| Piece | Name | What it does |
|---|---|---|
| Google Sheet | **Computer Club Records** | All club data: Students, Settings, Sessions, Attendance, Mission Results, Typing, Badges, Summary |
| Apps Script | **Computer Club Backend** (attached to the Sheet) | All the logic: PINs, sign-in, attendance, badges, dashboard data. Mirror: `backend/Computer-Club-Backend.gs` |
| Cloudflare Worker | **computer-club-records** | Messenger only: adds the secret key and forwards to the Apps Script. Mirror: `backend/computer-club-worker.js` |
| Pages | `/computer-club/` | Hub, sign-in, typing test, missions, teacher dashboard. Shared JS: `/computer-club/club.js` |

It shares **nothing** with `VC-LMS`, `edlo-lms` or `edlo-gemini`.

---

## Step 1 — Make the Sheet and the Apps Script

1. Go to sheets.google.com → **Blank** spreadsheet. Name it **Computer Club Records**.
2. **Extensions → Apps Script.** Name the project **Computer Club Backend**.
3. Delete everything in `Code.gs`. Paste the whole of `backend/Computer-Club-Backend.gs`. Save.
4. **Project Settings** (⚙️ on the left) → **Script Properties** → **Add script property**, three times:

   | Property | Value |
   |---|---|
   | `API_KEY` | A long random string (e.g. 32 letters and numbers). You will paste the same one into the Worker. |
   | `SESSION_SECRET` | A different long random string. ⚠️ Never change it later: every PIN depends on it. |
   | `TEACHER_CODE` | The code you will type to open the teacher dashboard. |

   Write all three in your private file in `Virtual-Classroom-private\`, not in the repo.
5. Back in the editor, choose **setupSheet** in the function list → **Run**. Approve the permissions
   (Advanced → Go to Computer Club Backend). The Sheet now has 8 tabs.

## Step 2 — Fill in the Settings tab

| key | value |
|---|---|
| `club_code` | Leave `CLUB1` for now. You will change it from the dashboard every week. |
| `week` | `1` |
| `mission` | `Shortcut Ninja` |
| `typingclub_url` | Paste your **TypingClub class sign-up link** (`https://howardsmithnazarene.typingclub.com/signup/…`). Only signed-in club members are given it. |

## Step 3 — Enter the club roster

In the **Students** tab, one row per member, starting at row 2:

| student_id | display_name | full_name | standard | pin | active |
|---|---|---|---|---|---|
| *(leave empty)* | Ana R. | Ana Ramirez | 4 | 1234 | *(leave empty)* |

- **display_name** is what students see on the sign-in page: first name + last initial.
- **standard** is 4, 5 or 6.
- **pin**: 4 digits. Format column E as **Plain text** first (Format → Number → Plain text) so PINs like
  `0042` keep their zeros. (If you forget, the script puts the zeros back.)
- Keep a copy of the PIN list in `Virtual-Classroom-private\` before the next step: once the PINs are
  scrambled, nobody (not even you) can read them from the Sheet.

Then in the Apps Script editor run **prepareRoster**. Every student gets an id (`cc001`, `cc002`…),
every PIN becomes a `sha256:…` hash, and `active` becomes `YES`. Check **Execution log** for any
"Not a 4-digit PIN" rows.

- **Add a student later:** add the row, run `prepareRoster` again (finished rows are skipped).
- **Reset a PIN:** type a new 4-digit PIN over the hash, run `prepareRoster`.
- **Remove a student:** set `active` to `NO`. Never delete the row: the id links his or her results.

## Step 4 — Deploy the Apps Script as a web app

1. **Deploy → New deployment** → ⚙️ **Web app**.
2. Description `Computer Club v1` · Execute as **Me** · Who has access **Anyone**.
3. **Deploy** → copy the **Web app URL** (ends in `/exec`).

> Every later change to the script needs **Deploy → Manage deployments → ✏️ Edit → Version: New version →
> Deploy**, or the live web app keeps running the old code. The URL stays the same.

## Step 5 — Make the Worker

1. dash.cloudflare.com (Smartstandardsix@gmail.com) → **Workers & Pages → Create → Create Worker**.
2. Name it exactly **computer-club-records** → Deploy (with the sample code).
3. **Edit code** → delete everything → paste the whole of `backend/computer-club-worker.js` → **Deploy**.
4. Worker → **Settings → Variables and Secrets → Add**, type **Secret**, twice:

   | Name | Value |
   |---|---|
   | `APPS_SCRIPT_URL` | The web app URL from Step 4 |
   | `APPS_SCRIPT_KEY` | The same value as `API_KEY` in Step 1 |

5. Check it: open `https://computer-club-records.smartstandardsix.workers.dev/ping`
   → `{"ok":true,"message":"Computer Club backend is alive"}`.

> The pages call exactly that address (it is in `/computer-club/club.js`). If Cloudflare gives the Worker a
> different address, tell Claude so the one line in `club.js` can be changed.

## Step 6 — Push the website and test

1. GitHub Desktop → commit → push (see PROJECT-DOCS).
2. On the live site: **edlovirtualclassroom.com → Computer Club → 🧑‍🏫 Teacher dashboard** → type your
   `TEACHER_CODE` → set a club code, Week 1, Shortcut Ninja → **Start this session**.
3. Add yourself as a test member in the Students tab (e.g. `Test S.`, standard 5, PIN `0000`), run
   `prepareRoster`, then sign in with the club code, play one Bronze round and do one Bronze typing test.
4. Check the Sheet: one Attendance row, one Mission Results row, one Typing row. Set the test member to
   `active = NO` when done.

## Every club day

1. Open the teacher dashboard → type a **new club code** (letters/numbers) → week → mission → **Start this session**.
2. **📽️ Show club code on projector.**
3. Students: Computer Club → Sign in → club code → name → PIN. That is their attendance.
4. After club: the dashboard (or the **Summary** tab) shows attendance, typing progress, missions and badges.

## Rules the backend follows

- **Club XP** (live bar + standings) needs no setup: it is worked out from the tabs above. To change the points,
  edit `XP` near the top of the Apps Script, update `backend/Computer-Club-Backend.gs`, and deploy a **new version**.

- Sign-in needs the **current** club code, so nobody can be marked present from home.
- 5 wrong PINs → that student waits 10 minutes. 10 wrong teacher codes → 10-minute wait.
- A sign-in lasts 6 hours (one club session) on that computer. **Sign out** on a shared computer.
- Results that cannot be sent (no internet) stay on that computer and are sent automatically later;
  each result has an attempt id, so it is never recorded twice.
- Badges are given once per student, by the rules in `BADGES` at the top of the Apps Script:
  Shortcut Ninja (Bronze/Silver 2+ stars or Gold 12+), Speedy Fingers 15 WPM, Keyboard Racer 25 WPM,
  Typing Champion 35 WPM. Typing badges and the leaderboard need **90%+ accuracy**.
