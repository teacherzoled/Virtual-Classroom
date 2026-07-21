# Mr. EdLo's Virtual Classroom — Project Documentation
**Teacher:** Edwin (Mr. EdLo)  
**School:** Howard Smith Nazarene School, Belize  
**Classes:** Standard 5 & Standard 6  
**Last updated:** July 19, 2026 (🔓 PROGRESSIVE LESSON UNLOCK SHIPPED & verified live — backend actions, hub card locking, lesson-page guard, teacher release panel; next session queued: shared CSS/JS refactor, IDEAS #10)

---

## 📌 STANDING RULE — read first, every session

**Never end, leave, or conclude a working session on this project without first updating this
PROJECT-DOCS.md file** to reflect what changed and where the next session should take off. This is a
permanent rule set by Edwin. Before wrapping up any chat:
1. Update the **Take-off Point** section below (current state + next task).
2. Update the **Last updated** date at the top.
3. Update any affected tables (Live URLs, Pages Built, Repo Structure) so they stay accurate.
4. Remind Edwin to `git add -A → commit → push` so the updated docs reach GitHub.

If the docs are not updated, the task is **not** finished.

---

## ▶️ Take-off Point — Next Session (as of July 21, 2026)

**Newest work (July 21, 2026): 🎮 ONLINE LESSON ENGINE + 🌱 SERVER-SIDE BEAN CAP — both LIVE.**

- **`LESSON-ENGINE-PLAN.md` is the source of truth for every online lesson.** Read it before
  building or changing one. Design agreed with Edwin July 20–21: concept review → 5-question
  calibration → Bronze/Silver/Gold tier ladder → 3–4 mechanics from a bank → finish line.
- **Week 1 (`week01-technology-climate`) is the REFERENCE IMPLEMENTATION.** Its JS is split into a
  DATA block and an ENGINE block — future weeks replace the DATA only. Copy it, never rewrite the
  engine. It carries the sticky progress bar, the 1400px width, viewport-scaled type, the hub theme
  palette, and the **one-card-at-a-time reveal flow** (July 21, 2026 — see `LESSON-ENGINE-PLAN.md`
  §2): only the active card shows, each step is reached by tapping a **Next →** button, finished
  cards fold to a tappable header, and no timers govern navigation. This replaced an earlier
  auto-scroll/auto-fold model that threw the viewport to the bottom of the page on a phone.
- **🌱 SERVER-SIDE BEAN CAP — DEPLOYED July 21, 2026 (Apps Script version 6).** The 30-bean
  per-lesson cap is now enforced in `handleSaveResult`, not just in the browser. Verified live:
  a replay after clearing the browser earns **+0**.
  - New **column L `lesson_key`** in `All Results` (e.g. `std5-sci-wk01`).
    ⚠️ **Never key it on `lo_code`** — one outcome spans two weeks (SC1.11 = Wks 3 & 4, SC2.12 =
    11 & 12, SC3.13 = 15 & 16, SC4.16 = 20 & 21) and the budgets would merge.
  - **A lesson that omits `lesson_key` is SILENTLY UNCAPPED.** Every lesson must pass
    `lesson_key: LESSON.idBase` in its `vcSaveBeans` meta. This was caught in live testing.
  - Only `activity_type === 'lesson'` is capped — tests and quizzes are never trimmed.
  - Steps + rollback: `BEAN-CAP-DEPLOY.md`.
- **⚠️ The live Apps Script had DRIFTED from `backend/VC-LMS-Backend.gs`** — it held a
  `debugSettings()` function that existed only in Google and would have been destroyed by a
  paste-over. Recovered into the mirror July 21. **Before pasting the backend again, always
  compare line counts first.** The mirror is now 739 lines and matches live exactly.
- **🤖 DAILY BUILD SCHEDULED — `std5-science-daily-lesson-build`, 4:00 pm.** Builds ONE lesson per
  run: Week 2, then Week 3 (both still on the OLD design), then Week 4 onward. It self-orients by
  checking for `var TIERS`, **drafts only — never commits or pushes**, and STOPS rather than
  inventing curriculum if a week has no scheme. 21 schemes written (Wks 1–21); Weeks 22–30
  outstanding. 29 lessons at 1/day ≈ mid-August, well inside Edwin's December target.
- **Next session should:** review whatever the daily task has drafted, push what is good, and keep
  writing schemes for Weeks 22–30 so the builds never stall.

---

**Previous work (July 20, 2026): 🎨 `vc-theme.css` CREATED for FUTURE pages only (IDEAS #10 — CLOSED).**
The shared stylesheet now exists and is ready to use. **No existing page was changed.**

- **`js/` folder DELETED** (Edwin's call, July 20). `js/main.js`, `js/subject-page.js` and the ten
  orphaned pages under `js/modules/` were the April 2026 site. Evidence: **no live page linked
  them** — the only references were inside `js/modules/` itself. Git history keeps them forever.
  This settles the open question the IDEAS #10 note opened the session with.
- **`vc-theme.css` (28.2 KB) added at repo root.** It holds the 172 CSS rules that were
  **byte-identical across the 16 Std5 Science assessments** — the 4 theme variable sets, fonts,
  layout, cards, buttons, question/option/results components, modal, footer, animations. It is the
  proven shared core, extracted and verified, waiting for its first page.
- **⚠️ NOTHING LINKS IT YET — that is correct, not unfinished.** The 16 assessments were converted
  during this session, verified, then **REVERTED to their originals at Edwin's decision.** All 16
  are byte-identical to the last commit; confirmed by hash. **Every page on the site is exactly as
  it was.**
- **Why reverted (Edwin, July 20):** those 16 are **live graded assessments** — a student sits each
  one once, under time, with a KV gate and a PDF report. The mechanical checks proved the CSS was
  equivalent (no rule lost, none gained, identical order, JS byte-identical), but no one had yet
  seen a question paper actually render with the gate open. **The risk was small but the downside
  landed on students mid-test**, so the conversion was not worth it for pages that already work.
- **The standing rule that came out of it:** every EXISTING page stays as built; every NEW page
  links `/vc-theme.css`. One rule, no exceptions, nothing to remember per-page. See the Design
  System section for how to use it — including the Science-teal gotcha on non-Science pages.
- **What was measured before reverting** (kept because it justifies using the file going forward):
  the 16 pages carried 1139 KB of inline CSS; shared, that is 711 KB inline + one cached 28 KB
  file — **35% less for a student who opens all 16.** That saving now applies to new pages instead.

**Previous work (July 19, 2026): 🔓 PROGRESSIVE LESSON UNLOCK (IDEAS #8) — SHIPPED & verified live.**
Students no longer see the whole year's lesson catalogue. Only weeks Mr. EdLo has released are
open; later weeks show a 🔒 **Opens Later** card. This holds **when logged OUT**, so the public
gets a "taste" of Week 1 only. Verified live July 19 (all six test steps passed).

- **Design decision (Edwin, July 19):** lessons stay **PUBLIC — no login gate.** The lock is for
  **PACING, not protection.** Reasoning worth keeping: (a) the site is the shop window for the
  future tutoring academy — locked cards advertise the year's scope to visiting parents; (b) a
  login wall on lessons taxes Edwin's own students daily (they switch devices constantly) for a
  threat that does not exist — nobody is stealing Std5 climate lessons; (c) the material that WOULD
  hurt if leaked (test items/answers) is already gated behind KV + Worker. **Login changes what a
  student EARNS, not what he or she SEES.**
- **Practice vs. real mode — already true, nothing built.** `vcSaveBeans` is a silent no-op when
  logged out, so a logged-out student gets the full lesson and instant feedback but banks no beans;
  logging in and redoing it earns them. Safe because beans measure ENGAGEMENT only — mastery comes
  from tests/quizzes/exit slips, so practising twice cannot inflate mastery.
- **Unlock rule chosen:** teacher toggle (not dates, not prior-week completion — the last conflicts
  with the Science "no saved progress" rule and would never open for logged-out visitors).
  Cumulative: once a week opens it stays open. Yearly reset closes everything back to Week 1.
- **Storage — one integer per subject.** New `Settings` tab in `VC-LMS` (`key | value | note`), rows
  named `<subject>-released-week` (e.g. `std5-science-released-week`). A week is open when
  `N >= its week number`, so the state CANNOT go invalid the way 30 separate toggles could.
  All six Std5 subjects seeded at 1 (only Science's hub exists yet; the rest wait for their hubs).
  Seed file: `backend/settings-tab-seed.tsv`. Helper `setupSettingsTab()` builds the tab too.
- **Subject-generic by design:** the Apps Script + Worker were written once for ALL subjects. A new
  subject hub needs a Settings ROW and ~15 lines of page wiring — never a backend change. **A
  subject with NO row = not using locking at all (its lessons stay open)**, so deleting a row opts
  a subject out and a forgotten row can never silently lock a new hub.
- **Backend added (both mirrors updated, per standing rule):**
  `lesson-locks` (PUBLIC read, no auth — hubs call it logged out; also answers a plain GET so the
  browser can cache it) and `set-lesson-locks` (teacher-gated write; accepts `{subject, week}` or
  `{reset_all:true}`). ⚠️ Only keys ending in `-released-week` are exposed by the public read, so
  the Settings tab is safe to use for other private settings later.
- **Front end:** Std5 Science hub ships Weeks 2+ **locked in the HTML** with the destination parked
  in `data-href`; JS restores the link only after the backend confirms. Locking-first means a slow
  or failed fetch never flashes the whole year. **Week 1 is a plain `href`, so it opens even with
  JavaScript off.** New `.card.locked` style (🔒 Opens Later) is deliberately distinct from `.soon`
  (= lesson not written yet). Both unlock blocks are marked **LIFT-OUT BLOCK** for the IDEAS #10
  refactor — change `SUBJECT_KEY` per hub.
- **Direct-URL guard** on the built lesson pages (Wk2, Wk3; Week 1 exempt). ⚠️ **It is a repaint,
  not a gate** — Pages serves the whole file, then the guard overwrites `document.body`. View-source
  or JS-off defeats it. That is acceptable: real enforcement would mean serving lessons through the
  Worker, breaking the self-contained-HTML model for a pacing feature.
- **Deliberate asymmetry:** the hub fails **CLOSED** on a network error (a locked card just means
  one fewer link) but the lesson guard fails **OPEN** (failing closed would shut a student out of a
  lesson he or she IS allowed to read, on classroom wifi that drops).
- **Teacher panel:** `/teacher/` → **🔓 Release Lessons** — every subject with its current week, a
  Release button, and **Reset ALL to Week 1** for a new school year. Lowering a week is allowed on
  the server (the yearly reset needs it) but prompts for confirmation in the UI; "once open, stays
  open" is classroom policy, not a server rule. New subjects appear here automatically.
- **⚠️ Deployment lesson (July 19):** the Pages build sat **Queued**, not failed — GitHub Actions
  was in a **partial outage** (incident opened 23:34 UTC Jul 19). Pages builds run ON Actions, so
  they queue when Actions is degraded, and Pages keeps serving the LAST GOOD BUILD meanwhile.
  **Check githubstatus.com BEFORE cancelling or re-pushing** — a new run just joins the backlog.
  Also: `git push` when local == origin does nothing; use `git commit --allow-empty` to force a build.
- **⚠️ Repo hygiene (found July 19, not yet fixed):** 54 files show as modified with **zero real
  changes** — 29,998 insertions vs 29,998 deletions, and `git diff --ignore-all-space` is empty.
  Pure CRLF/LF churn from OneDrive. There is **no `.gitattributes`**. Risk: a future `git add -A`
  buries a real change under 30k lines of noise. Fix queued with IDEAS #10.
- **⚠️ Apps Script deployments are cluttered** — six exist, two named "Untitled". The Worker's
  `APPS_SCRIPT_URL` must match the ACTIVE deployment ID. Archive the unused ones before they cause
  an hour of confusion.

---

**Previous (July 18, 2026): 🏪 BEAN STORE — SHIPPED & verified live end-to-end.**
Front end AND backend deployed; tested with `test.student` (earned 114 → redeemed Sticker 100 →
balance 14, Sticker stock 120→119, and **Jaguars team total stayed 114** — spending did NOT move the
team race or class goal ✅). Students can cash earned cacao beans 🌱 for real class prizes without
ever affecting the team race or class goal. Design in `BEAN-STORE-PLAN.md`; backend deploy steps in
`BEAN-STORE-DEPLOY.md`.
- **Backend (Edwin, done July 18):** `Prizes` tab added (9 rows) · `prizes` + `redeem-prize` actions
  added to `VC-LMS Backend` Apps Script (new version deployed) · `/prizes` + `/redeem-prize` routes
  added to `edlo-lms` Worker (deployed). `/prizes` console test returned all 9 ✓. Group Totals B2
  formula confirmed to filter lesson+bonus only, so `redeem` rows are ignored — verified live.
- **Local master copies (new `backend/` folder):** `backend/VC-LMS-Backend.gs` and
  `backend/edlo-lms-worker.js` now mirror the deployed code (dated headers). **Standing rule going
  forward:** when the live Apps Script or Worker changes, update its `backend/` mirror the same
  session; next edit starts from the file and returns a complete paste-over version, not snippets.
  (`edlo-gemini` AI-proxy Worker is not mirrored yet.)
- **UI polish this session:** prize card text centered; prize-card grid centered in the panel;
  muted secondary-text colour darkened on the Sunny/Cloudy/Nature themes (dashboard) for readability.
  Locked-prize 50% dimming KEPT deliberately (Edwin's call) — it's an availability cue that brightens
  as a student saves; a card regains full colour the moment it becomes affordable.
- **Recorded design facts:** balance = earned (`lesson`+`bonus`) − spent (`redeem`); `redeem` rows
  carry subject `Bean Store`, score = beans spent; every bean sum in the site + the Group Totals
  formula whitelists lesson/bonus, so spending only lowers the individual's own balance. Redemption
  is teacher-initiated on `/teacher/` (no student checkout); hard block on cost>balance or stock=0,
  enforced in the UI AND server-side in Apps Script.

**➡️ NEXT SESSION (queued): 🧹 Shared CSS/JS refactor — IDEAS #10.**
Measured July 19: **81 HTML files / 3.6 MB, and 31 of them each carry their own copy of the theme
system** (the Std5 Science hub's `<style>` block alone is 473 lines). One theme-colour change = 31
edits — the "Find and replace across all files" section below is the symptom. Gets worse with every
new subject hub and every Week 4–30 lesson. **Real payoff is CACHING, not raw speed** — inline is
actually faster on a FIRST visit (one request, no extra round trip); the win is repeat visits across
many pages, which is exactly this site. ⚠️ **Own dedicated session** — it touches every page on a
LIVE site (LMS, bean store, 16 gated tests, passkey, themes, zoom) and needs a page-by-page
verification pass; do NOT bolt it onto a feature build. **Start by deciding the fate of
`js/main.js` + `js/subject-page.js`** (April 2026, predate the self-contained convention, look
abandoned). Note this REVERSES the documented "all pages fully self-contained" convention, whose
rationale (Edwin can edit any file without deep CSS/JS knowledge) is weaker now that Claude Code
handles bulk edits — update the Design System section when it ships. Fold in the `.gitattributes`
fix for the CRLF churn at the same time.
Other parked items still open: more Std5 Science lessons (Wk 4+), revise Wk1–3 sample lessons
(IDEAS #9 — do this BEFORE cloning the Week 1 engine for Wk4+), Test Control panel (IDEAS #7),
Layer 2 ecosystem map + quest. **Wk2 and Wk3 are currently LOCKED, which makes them a private
workshop — revise them there without students seeing half-changed content.**

---

**Previous (July 18, 2026, earlier): 🏪 BEAN STORE website code first built.**
Students can now cash earned cacao beans 🌱 for real class prizes without ever affecting the team
race or class goal. Design in `BEAN-STORE-PLAN.md`; backend deploy steps in `BEAN-STORE-DEPLOY.md`.
- **Balance model:** spendable balance = earned (`lesson`+`bonus`) − spent (`redeem`). A new
  `redeem` activity_type carries the spend (score = beans spent, subject = `Bean Store`). Every
  bean sum in the site code already whitelists `lesson`/`bonus`, so `redeem` rows are invisible to
  the team race, class goal, and mastery — spending only lowers the individual's own balance.
- **Redemption flow:** teacher-initiated only (no student checkout button). Student asks in class;
  teacher uses the new **Redeem a Prize** panel on `/teacher/` (twin of the bonus awarder). **Hard
  block** (Edwin's call): the Redeem button is disabled — and the Apps Script also rejects — when
  `cost > balance` or `stock ≤ 0`.
- **`/dashboard/`:** new browse-only **🏪 Bean Store** panel — spendable balance (bean chip now reads
  "N beans to spend"), prizes grouped Quick/Medium/Big, each card greyed with "🔒 need N more" or
  "🔒 out of stock" when unavailable. No redeem button for students.
- **`/teacher/`:** new **Redeem a Prize** panel — student picker + prize picker (cost/stock inline),
  live balance line, hard-disabled button with the reason shown; updates local state after each
  redeem so counts stay accurate without reload.
- **`edlo-utils.js`:** added `vcGetPrizes()` (public catalog fetch).
- **Prize catalog (Edwin's final July 17 list + stock July 18):** Sticker/pencil 100🌱 (120) ·
  Choose seat 150🌱 (20) · Pick own group 180🌱 (30) · Sit with friend/week 360🌱 (20) ·
  Snack/juice 540🌱 (30) · Homework pass 750🌱 (12) · Teacher's chair/morning 1200🌱 (3) ·
  Certificate+note home 1500🌱 (999=unlimited) · Hall of Fame 2500🌱 (5).
- **➡️ Edwin's backend steps (`BEAN-STORE-DEPLOY.md`):** ① add `Prizes` tab (9 rows, provided) ·
  ② add `prizes` + `redeem-prize` actions to `VC-LMS Backend` Apps Script (code provided) · ③ add
  `/prizes` + `/redeem-prize` routes to `edlo-lms` Worker · ④ **verify the Group Totals formula
  ignores `redeem` rows** (critical check in the deploy doc) · ⑤ live-test per the checklist · ⑥
  `git add -A → commit → push` the 3 code files. Then Layer 2 map + quest when called for.

**Previous (July 17, 2026, later): 🔒 SECURE TEST GATE built + verified live on the pilot,
then rolled out to all 16 Std5 Science tests/quizzes.** Four security layers now stack on every
test: (1) **login required** (`vcRequireLogin()` on each test/quiz page — hubs/lessons stay
public); (2) **server-side open/closed switch** — questions live in KV, the Worker's new
`mode:'questions'` returns them ONLY when that test's KV entry has `"open": true`; a closed test
shows nothing on screen OR in view-source (Edwin flips the flag in the Cloudflare KV dashboard on
test morning — server clock decides); (3) **device submit-lock** (unchanged `localStorage`); and
(4) **account-based retake lock** — before showing an open test the page asks the LMS if THIS
student already submitted it (matches the unique `ACTIVITY_NAME` in their results) and, if so,
shows an "already completed" screen with their score on ANY device — so a retake is blocked even
if a test is accidentally left open. Every submit now also logs to the VC-LMS Sheet via
`vcSaveProgress()` (subject/LO/type/name/score) — so tests feed the dashboards from day one.
- **Worker:** `edlo-gemini` gained `mode:'questions'` (runs BEFORE the passkey gate; needs no
  passkey and never touches the OpenAI key; open-check only). Grading + AI relay UNCHANGED.
  Deployed copy = `…/Science/Assessment/cycle 1/Final Cycle 1 Test/edlo-gemini_v3_WITH_QUESTIONS_MODE.js`
  (the old `edlo_worker_UPGRADED (2).js` was stale gpt-4o-mini — superseded).
- **Passkey:** KEPT (Edwin's call July 17) — still the cost gate protecting the OpenAI key on
  written-item grading; students still enter the monthly code at submit. Can later be swapped for
  the login token to drop it entirely.
- **KV:** each test entry now carries `"open": false` + a `questions` block (stems/options/figures,
  NO answers — those stay in `items` as before). Figures (SVG/base64) moved OUT of the pages INTO
  KV, so pages shrank from up to 784 KB to ~71 KB. New KV values to paste are in
  `…/Science/Assessment/_SECURE_GATE_KV/` (see its `README_DEPLOY.md`). 14 are ready; **2 need
  Edwin to paste the live value OUT first** (c1-unit2, c1-review — no local answer key on file).
- **Pages:** all 16 refactored to fetch-render shells; re-audited clean (no answer/dev-bar/question
  text in source; `pdfText()` present; both script blocks pass `node --check`; ~360px fit
  preserved). Verified programmatically: gate closed-hides / open-clean, grading Auto-Fill=full &
  Fill-Wrong=0 simulated against the real v3 Worker, render pipeline builds every question.
- **➡️ NEXT:** ① paste the 14 ready KV values into `EDLO_ANSWER_KEYS`; ② paste-out c1-unit2 &
  c1-review live values → Claude merges → paste back; ③ `git add -A → commit → push` the 16 pages;
  ④ spot-check a couple tests live (closed screen → flip open → take → score in Sheet → account
  lock on 2nd device); ⑤ enroll the real class (Students tab → `hashPlainPasswords`). Then the
  **🏪 Bean Store** (queued next, `IDEAS.md` #6).

**Previous — DASHBOARD LAYER 1 BUILT (quest deferred).** Decisions locked this
session: teams 🐆 Jaguars · 🦜 Toucans · 🦙 Tapirs · 🦭 Manatees (Students col G `group_id`,
lowercase) · class goal **6000** 🌱 (Edwin raised from 2000; cell B8 of Group Totals) · teacher auth =
**TEACHER_CODE** Script Property checked server-side in Apps Script · **weekly quest DEFERRED**
(no Tab 6, no multiplier — clean add-on later).
- **Sheet (done by Edwin):** Students col G `group_id` (test.student → jaguars, class_id now
  Std5-2026); new **`Group Totals`** tab — teams A2:A5, SUMPRODUCT bean formulas B2:B5 (verified: 94 🌱
  from lesson testing), class_total B7 `=SUM(B2:B5)`, class_goal B8.
- **Apps Script (deployed as Version 2, July 17):** full-file replacement adding `leaderboard`
  (public; returns groups + class_total + class_goal + `my_group` when a token is sent),
  `teacher-data` + `award-bonus` (gated by `TEACHER_CODE`), `findStudent` now returns `group_id`.
- **Worker `edlo-lms`:** ROUTES map extended with `/leaderboard`, `/teacher-data`, `/award-bonus`
  (one-line change; Edwin deploys in Cloudflare editor). ⚠️ Verify with a live leaderboard fetch.
- **edlo-utils.js:** added `vcGetLeaderboard()` (POSTs `/leaderboard`, includes token when logged in).
- **Race-bar scaling (July 17, Edwin's catch):** first build scaled bars relative to the leading team,
  so first place always showed a FULL bar — misleading against the journey labels. Fixed on BOTH
  dashboards: each team races toward a **journey goal = class_goal ÷ 4** (6000 → 1500 🌱 per team);
  a full bar now genuinely means "reached the Reef". Race subtitle states the per-team goal number.
- **`/dashboard/` (student, vcRequireLogin):** name header, team chip, bean + mastery pills, team race
  bars with ecosystem waypoint labels (Rainforest · Savanna · Mangroves · Reef), class-goal bar,
  subject mastery cards (test/quiz/exit-slip rows ONLY), 4-week streak badges, recent-activity feed.
  Login page now redirects here (TODO flipped in `login/index.html`). The home-page name chip is now
  a LINK to `/dashboard/` ("👋 [name] · 📊 my dashboard"), with "log out" as its own action inside it.
- **`/teacher/` (teacher, passcode gate → sessionStorage `vc-teacher-code`):** Section A MASTERY
  (class table w/ per-student drill-down, LO class-average bars, red under 70%) kept visually separate
  from Section B GAME (team totals, class goal line, bonus-bean awarder: student picker + 1–100 beans +
  reason → `bonus` row in Tab 2). Beans never appear in Section A.
- **➡️ NEXT:** ① Edwin: deploy the Worker ROUTES line if not yet done, then live-test: leaderboard on
  `/dashboard/`, teacher code on `/teacher/`, award a test bonus → watch Group Totals move. ② More
  Std5 Science lessons (Wk 4+, clone Week 1 engine). ③ Login-gate + open/closed retrofit
  (see `NEXT-SESSION-START.md` — view-source decision recorded). ④ **🏪 Bean Store — queued as the
  session AFTER the gate retrofit** (design in `IDEAS.md` #6; Edwin brings the prize list + bean
  costs). ⑤ Layer 2 ecosystem journey map + quest, when Edwin calls for them.

**Previous session (July 16, 2026, evening):**

**Newest work (July 16, 2026 — evening session): FIRST THREE STANDARD 5 SCIENCE LESSONS BUILT, with cacao beans 🌱 wired from day one.**
- **Dashboard build PAUSED (Edwin's call):** the `DASHBOARD-GAMIFICATION-PLAN.md` build was opened, then
  deliberately paused to build lessons first — so the dashboard has real bean data when it ships.
  Standard 6 is on standby; **Standard 5 is Edwin's class for SY 2026–2027 and everything is built for
  Std5 now.** One dashboard-plan piece WAS shipped early: **`vcSaveBeans()` in `/edlo-utils.js`**
  (Layer 1 step 1.3, partial — no quest multiplier, no `/leaderboard` yet).
- **Three interactive lessons live in the repo** under `standard5/science/lessons/` (anchored to the
  enacted ATP weeks; all rule-based, ZERO AI cost; public pages — beans save only when logged in):
  - `week01-technology-climate/` — Wk 1 · SC 1.09 (two-way loop, Belizean technology sort) · max 72 🌱
  - `week02-climate-economy/` — Wk 2 · SC 1.10 (Eta/Iota hook, cause-effect chains, sector sort) · max 70 🌱
  - `week03-weather-vs-climate/` — Wk 3 · SC 1.11 (weather/climate rule, statement sort, tropical Belize) · max 70 🌱
- **Lesson engine (now the Std5 Science lesson template — clone It for Week 4+):** 8 sections
  (Hook reveal → Learn It w/ inline SVG diagram → Vocabulary match → Sort cards → Sentence-starter
  fill-ins → 6-question Checkpoint → Misconception True/False → Reflect &amp; Finish), 4 themes,
  starfield, sticky progress bar, 1180px/17.5px layout, mobile-stack at 600px, 44px touch targets.
  Bean economy locked: activities 5 + 1/correct · checkpoint 10 + 1/correct · completion bonus 15.
  First-completion lock per activity: `localStorage` key **`vc-pts-<activity-id>`**
  (e.g. `vc-pts-std5-sci-wk01-vocab`). Hidden video slot: set `VIDEO_URL` in each lesson file.
- **Restore-on-reload fix (July 16, live-testing find):** first build reset the bean pill and sections
  to zero on every refresh (Sheet rows were never duplicated — display only). Fixed: `vcSaveBeans()`
  now stores the beans earned inside the lock (`{b:beans,t:timestamp}` JSON), and every lesson restores
  completed sections + bean count + completion state on load, with all inputs disabled on restored
  sections. Restore only applies to SAVED beans (logged-in completions) — logged-out play never locks.
  Note: answers themselves are not restored, only completion state and bean totals.
- **Hub wired:** the Week 1–3 cards on `/standard5/science/` are now LIVE links (soon-chips removed).
- **Home-page login button (July 16, Edwin's request):** the grade picker (`/index.html`) now shows a
  teal **🔑 Student Login** button in the site header (next to the Belize badge). When a session exists
  It swaps to a "👋 [first name] · log out" chip (loads `/edlo-utils.js` + a small session check at the
  end of the page).
- **XSS hardening (July 16, flagged in Claude Code review):** everywhere a student's stored name is
  shown on a page (home welcome chip + the three lessons' welcome lines), the text is now built with
  `textContent`/`createTextNode`, never `innerHTML` — a name containing markup can never execute.
  **Standing rule for future pages: any value read from the Students sheet or a session goes into the
  DOM via `textContent`, not `innerHTML`.**
- **Personal hub greeting (July 16, Edwin's request):** the Standard 5 hub AND the home page welcome
  banners now greet a logged-in student by name — "Hello, [first name]!" replaces "Hello, Standard 5!"
  / "Hello, students!" (session checks at the end of `standard5/index.html` and `/index.html`,
  textContent only). Logged-out visitors see the original class greetings. Pattern for future hubs:
  give the banner's `<strong>` an `id="welcomeName"` and reuse the same snippet.
- **Grade soft-lock on the grade picker (July 16, Edwin's idea):** a logged-in student sees the OTHER
  grade's card locked — greyed out, link removed, "🔒 For Standard N students" chip — based on the
  session's `class_id` (`Std5…` → locks Standard 6, `Std6…` → locks Standard 5; unknown → nothing
  locked). UX-only: direct URLs still work while pages stay public; HARD enforcement is parked for the
  login-gate retrofit session. ⚠️ `test.student`'s lock follows whatever `class_id` It has in the
  Students tab.
- **`IDEAS.md` created (July 16):** parking lot at the repo root for Edwin's mid-session ideas —
  write ideas there FIRST so they are never lost; Edwin decides when each gets built.
- **Verified this session:** `node --check` on all scripts ✓ · config integrity + bean math simulated ✓ ·
  season-terms sweep ✓ (temperate names appear only as deliberate wrong options in Wk3 Q4) ·
  no dev/rubric fields ✓ · no Wk1 content leaked into clones ✓. **Edwin still to do: phone test at
  ~360px after push, and a live bean-save test with `test.student`.**

**➡️ NEXT TASKS (updated):**
1. **More Std5 Science lessons** — Week 4 (Reading Belize's Climate Data, SC 1.11) onward, cloning the
   Week 1 engine. Each new lesson = copy `week01-technology-climate/index.html`, swap the header,
   Sections 1/2/8, and the JS config block (LESSON, VOCAB, SORT, FILL, QUIZ, TF, ACTS).
2. **Resume the dashboard build** (`DASHBOARD-GAMIFICATION-PLAN.md`) once a few lessons are live —
   remaining: Sheet tabs (1.1), `/leaderboard` on `edlo-lms` (1.2 — NOT `edlo-gemini`; data lives in the
   VC-LMS Sheet), student `/dashboard/` (1.4), teacher `/teacher/` (1.5). Open checklist answers Edwin
   already gave July 16: beans start from lessons + teacher bonuses; teams/economy per plan.
3. **Per-test open/closed switch + login gate retrofit** (see `NEXT-SESSION-START.md`) — unchanged.

**Previous session (July 16, 2026): the LMS LOGIN SYSTEM IS LIVE and verified end-to-end.**
- Built today: Google Sheet **`VC-LMS`** (4 tabs, auto-built by `setupSheet()`) + Apps Script backend
  **`VC-LMS Backend`** (attached to the Sheet) + dedicated Cloudflare Worker **`edlo-lms`**
  (edlo-lms.smartstandardsix.workers.dev) + `/edlo-utils.js` + `/login/` page.
- **Two design decisions (differ from the July 15 plan):** ① **Apps Script bridge instead of a
  service account** — proven TutorOS pattern, no keys/JWT in the Worker; ② **dedicated `edlo-lms`
  Worker instead of new routes on `edlo-gemini`** — LMS changes can never break the AI proxy or
  the live tests' grading. Token validation lives in Apps Script; the Worker is a thin CORS proxy.
- **Verified July 16:** login ✓ · wrong password rejected ✓ · 30-day session persists across pages
  (`localStorage` key `vc-session`) ✓ · `vcSaveProgress()` wrote an 80% row to All Results ✓ ·
  `vcGetProgress()` returned it ✓ · formula Tabs 3–4 auto-calculate ✓.
- Test account `test.student` / `test123` stays in the Students tab permanently.
- **No page is protected yet** — `vcRequireLogin()` is not on any page (Edwin's interim call stands).
  Login redirects to `/` for now; a TODO marker in `login/index.html` switches it to `/dashboard/` later.
- Full as-built reference: see the **LMS Login System** section below. A step-by-step deploy/enroll/
  reset guide (`LMS-SETUP-GUIDE.md`) was delivered in the July 16 Cowork session — Edwin keeps it
  locally, NOT in this public repo.

**Previous session (July 15, 2026 — evening):** the **Standard 5 Science hub is LIVE and phone-verified** at edlovirtualclassroom.com/standard5/science/ — themes confirmed working after the palette fix below. Only the hero banner is still pending.
- Grade picker at `/` (Standard 5 / Standard 6); `/standard6/` unchanged (stubs + `404.html` redirects still in place).
- `standard5/science/index.html` — full Science hub cloned from the Std6 design (4 themes, stars,
  molecule canvas, zoom button, teal accent). Four tabs:
  - **📖 Lessons** — all 30 ATP weeks as placeholder cards, grouped by cycle
    (🌦️ C1 Patterns in Our World Wks 1–8 · ⚙️ C2 Forces, Circuits & the Cosmos Wks 9–14 ·
    🔭 C3 Light, Sight & the Sky Wks 15–21 · 🧠 C4 How We Sense & Sort Life Wks 22–30), each with Week + SC code.
  - **🎯 Activities** — 20 paper classwork/project items from the Assessment Plan as placeholder cards
    (ATP-authority weeks used where the plan drifts: Emit/Reflect Sort Wk 18, Tools project Wk 17,
    Light-Travels-Straight Wk 19, Migration Log Wk 5 / Ecosystem poster Wk 6).
  - **📝 Assessments** — all 16 built sy2627 online items as **LIVE links**, grouped by cycle:
    per cycle 1 quiz + Unit Test 1 + Unit Test 2 + Review Test, each with SC codes, week, question count, marks.
  - **🔬 Digital Labs** — single "Being Built" placeholder card.
- **16 audited STUDENT test/quiz pages deployed into the repo** (admin copies NOT deployed):
  `standard5/science/tests/{c1-unit1,c1-unit2,c1-review,c2-unit1,c2-unit2,c2-review,c3-unit1,c3-unit2,c3-review,c4-unit1,c4-unit2,c4-review}/index.html`
  and `standard5/science/quizzes/{c1-adaptation,c2-solar-system,c3-reflection-refraction,c4-digital-citizenship}/index.html`.
  All 16 re-audited after copy: no dev bar / DEV maps / answer / rubric fields; `pdfText()` present in each.
- `standard5/index.html` — Science card converted to a live `<a href="/standard5/science/">` link
  (soon-chip removed, arrow added); welcome text updated.

**➡️ NEXT TASKS:**

1. **Login gate — foundation ✅ BUILT July 16, 2026** (Sheet, backend, `edlo-lms` Worker,
   `edlo-utils.js`, `/login/` page — all live and verified). Still remaining from the July 15 decision:
   - **Per-test open/closed switch, enforced Worker-side** — each test's KV entry gets an
     `"open": true/false` field; the page asks the Worker before revealing questions; Edwin flips the
     flag in the Cloudflare KV dashboard on test morning (server clock decides — device-clock
     cheating impossible). ❌ NOT built yet.
   - Retrofit `vcRequireLogin()` + the open-check to the 16 Std5 student pages, then re-audit them.
   - ⚠️ Shared-Worker caution (KV work touches `edlo-gemini`): every change hits ALL live tests —
     test against one testId first. (The new `edlo-lms` Worker is separate and safe to edit.)
   - Enroll real students in the `VC-LMS` Students tab (plain passwords → run `hashPlainPasswords`).
   - Dashboards + `vcSaveProgress()` result logging bolt on later with no rework.
   **Interim decision:** tests/quizzes stay publicly viewable until the gate ships (Edwin's call, July 15) —
   submit-lock + server-side grading still prevent any scoring abuse.
2. **Hero banner:** Edwin generates the Std5 science banner with the AI prompt provided in chat
   (1600×900, compress to ≤500 KB via squoosh.app) and saves it as
   `standard5/science/images/hero/science-banner.png` — the page already points there; until then
   only the alt text shows.
3. **After that:** next Standard 5 subject hub, or Standard 6's remaining hubs (Math, Scriptures, CS, PE).

**Back-link fix + `.nojekyll` (July 16, 2026):** the 16 deployed Std5 test/quiz pages linked
"← Back to Science" to the old `/science/` root path, whose redirect stub sent students to the
**Standard 6** hub. Claude Code fixed all 16 pages to `/standard5/science/` (commit `7e74a25`), but the
GitHub Pages **Jekyll build failed twice** (runs #90–#91) and the site kept serving the old build —
the repo had no `.nojekyll` and had hit heavy build traffic (Pages soft-limits ~10 builds/hour).
**Fix: empty `.nojekyll` file added at the repo root** — the site is pure static HTML, so Pages now
skips Jekyll and deploys directly (run #92 ✅, 32 s). Verified live: all test-page back links land on
the Std5 Science hub. Keep `.nojekyll` forever; never add Jekyll-dependent features.

**Theme fix (July 15, 2026 — after first live test):** the Std6 science page tints ALL three light
themes green (Sunny #f0fdf6 / Cloudy #eaf2ee / Nature #e8f5ec), so on the phone they looked nearly
identical. The Std5 Science hub's Sunny/Cloudy/Nature palettes were repainted to the DISTINCT
hub-style themes (Sunny = warm yellow, Cloudy = blue-grey, Nature = green — matching
`standard5/index.html`), extended with the science page's extra variables (tabs, cycle dividers,
mol-canvas, graded badges, grad-bar). Night unchanged. Also added darker per-theme accents for the
live assessment cards (`.assess-*`) so titles stay readable on light backgrounds.
**Optional later:** retrofit the same distinct palettes to `standard6/science/index.html` if Edwin wants
the two grades to match.

**Digital Labs decision (July 15, 2026):** the Std5 Science hub's Digital Labs tab stays a "Being Built"
placeholder — labs are NOT in the sy2627 Assessment Plan and the gradebook slate is complete without
them, so they are deferred to a future session. If/when built: start with **one ungraded pilot** — an
interactive dichotomous key on Belizean animals (SC 6.13, Wks 27–28) — then decide grading category
(would need Assessment Plan + master doc updates) before any graded lab. Each lab ≈ one build session.

**KV status (corrected July 15, 2026 — Edwin confirmation):** ALL 16 items' KV entries are already
deployed and live-verified in `EDLO_ANSWER_KEYS` — nothing pending. The master doc's four stale
"⬜ not yet deployed" markers (c3-unit1, c3-unit2, c4-science, c4-quiz) were cleared in the newest
master-doc copy (`Assessment/Cycle 4/Quiz/Std5_Assessment_System_MASTER_DOC.md`) this session.

**Completed earlier (superseded):** the old NEXT TASK — building `standard5/science/index.html` on the Std6 model,
rebranding for Standard 5, pulling content from the sy2627 assessment project, and wiring the Science card — is done as described above.

**Conventions (do not break):**
- New Standard 5 pages live under `/standard5/…` and link with `/standard5/…` paths.
- New Standard 6 pages live under `/standard6/…`. Never recreate subject folders at the site root —
  those exist only as redirect stubs.
- LMS files stay at the **root** (`/edlo-utils.js`, `/login/`, `/dashboard/`, `/teacher/`).

**To publish (Edwin's workflow):** open the `Virtual-Classroom` folder in VS Code →
`git add -A` → `git commit` → `git push` (the Claude Code plugin can run this). Git identity is set to
name `edlo`, email `221897977+teacherzoled@users.noreply.github.com` (GitHub blocks pushes that
expose a real email, so the noreply address is required). After pushing, hard-refresh (Ctrl+Shift+R) —
previously-visited URLs may cache for up to ~10 min.

---

## 🌐 Live URLs

> **Structure note (July 2026):** the site now serves **two grades**. The home page is a
> **grade picker**; each grade lives in its own folder. Standard 6 subject pages moved from the
> site root into `/standard6/`. Old root links (e.g. `/science/`) still work — see **Grade Structure & Redirects** below.

| Page | URL |
|---|---|
| Grade Picker (home) | https://edlovirtualclassroom.com |
| Student Login (both grades) | https://edlovirtualclassroom.com/login/ |
| Standard 5 Hub | https://edlovirtualclassroom.com/standard5/ |
| Standard 5 Science Hub | https://edlovirtualclassroom.com/standard5/science/ |
| Standard 6 Hub | https://edlovirtualclassroom.com/standard6/ |
| Spanish Subject Hub (Std6) | https://edlovirtualclassroom.com/standard6/spanish/ |
| Science Subject Hub (Std6) | https://edlovirtualclassroom.com/standard6/science/ |
| Student Portfolios (Std6) | https://edlovirtualclassroom.com/standard6/portfolios/ |
| Mis Aspiraciones Lesson (Std6) | https://edlovirtualclassroom.com/standard6/spanish/lessons/mis-aspiraciones-intro/ |

---

## 🌍 Custom Domain

| Item | Value |
|---|---|
| Domain | edlovirtualclassroom.com |
| Registrar | Namecheap |
| DNS Records | 4 A Records → GitHub IPs + CNAME www → teacherzoled.github.io. |
| HTTPS | ✅ Enforced via GitHub Pages SSL |
| Registered | May 2026 |

---

## 📁 GitHub Repositories

**GitHub Username:** `teacherzoled`  
**GitHub Profile:** https://github.com/teacherzoled

| Repo Name | URL | Contents |
|---|---|---|
| Virtual-Classroom | github.com/teacherzoled/Virtual-Classroom | **MAIN WEBSITE** — all subject pages live here |
| spanish | github.com/teacherzoled/spanish | Backup only — content moved to Virtual-Classroom |
| science | github.com/teacherzoled/science | Backup only — content moved to Virtual-Classroom |
| math | github.com/teacherzoled/math | Backup only |
| scriptures | github.com/teacherzoled/scriptures | Backup only |
| computersc | github.com/teacherzoled/computersc | Backup only |
| pe | github.com/teacherzoled/pe | Backup only |
| portfolios | github.com/teacherzoled/portfolios | Backup only — content moved to Virtual-Classroom |

> ⚠️ **Important:** All website content must live inside the **Virtual-Classroom** repo for the custom domain to work. The other repos are backups only.

---

## 📂 Repo Structure (Virtual-Classroom)

Everything lives inside one repo. The home page is a **grade picker**; grade content lives in
`standard5/` and `standard6/`. Shared LMS pages (`login/`, `dashboard/`, `teacher/`, `edlo-utils.js`)
stay at the **root** so they serve both grades.

```
Virtual-Classroom/
├── index.html                          ← Grade picker (Standard 5 / Standard 6)
├── 404.html                            ← Catch-all: forwards old root links to /standard6/
├── CNAME                               ← Custom domain file
├── edlo-utils.js                       ← Shared LMS utilities — ROOT (✅ LIVE July 16, 2026)
│
├── standard5/
│   ├── index.html                      ← Standard 5 hub (Science card LIVE, others coming soon)
│   └── science/
│       ├── index.html                  ← Std5 Science hub (30 wks, 4 tabs, 16 live assessments,
│       │                                  Wk 1–3 lesson cards LIVE)
│       ├── images/hero/                ← science-banner.png goes here (Edwin to add)
│       ├── lessons/                    ← Interactive lessons (✅ July 16, 2026)
│       │   ├── week01-technology-climate/   ← Wk 1 · SC 1.09 · 🌱 beans wired
│       │   ├── week02-climate-economy/      ← Wk 2 · SC 1.10 · 🌱 beans wired
│       │   └── week03-weather-vs-climate/   ← Wk 3 · SC 1.11 · 🌱 beans wired
│       ├── tests/                      ← 12 STUDENT test pages (c1–c4: unit1, unit2, review)
│       └── quizzes/                    ← 4 STUDENT quiz pages (adaptation, solar-system,
│                                          reflection-refraction, digital-citizenship)
│
├── standard6/
│   ├── index.html                      ← Standard 6 hub (subject cards)
│   ├── spanish/
│   │   ├── index.html                  ← Spanish subject hub (LIVE)
│   │   ├── lessons/                     ← includes mis-aspiraciones-intro (LIVE)
│   │   ├── activities/
│   │   └── images/
│   ├── science/
│   │   └── index.html                  ← Science subject hub (LIVE, 30 wks)
│   ├── math/                           ← Hub page not built yet
│   ├── scriptures/                     ← Hub page not built yet
│   ├── computersc/                     ← Hub page not built yet
│   └── portfolios/
│       └── index.html                  ← Student portfolios (LIVE)
│
├── science/index.html                  ← REDIRECT stub → /standard6/science/
├── spanish/index.html                  ← REDIRECT stub → /standard6/spanish/
├── portfolios/index.html               ← REDIRECT stub → /standard6/portfolios/
│
├── login/
│   └── index.html                      ← Student login page — ROOT (✅ LIVE July 16, 2026)
├── dashboard/ (planned)                ← Student dashboard — ROOT
└── teacher/   (planned)                ← Teacher dashboard — ROOT
```

---

## 🔀 Grade Structure & Redirects (added July 2026)

The site serves two grades from one repo:

| Path | What it is |
|---|---|
| `/` | Grade picker — choose Standard 5 or Standard 6 |
| `/standard5/` | Standard 5 hub (subject cards; content being built, Science first) |
| `/standard6/` | Standard 6 hub — all existing subject pages moved here |
| `/standard6/<subject>/` | Each Standard 6 subject hub (spanish, science, portfolios live) |

**Keeping old links alive.** Standard 6 subjects used to sit at the site root (`/science/`, `/spanish/`,
`/portfolios/`). After the move, old links still work two ways:

1. **Redirect stubs** — a tiny `index.html` at each old path (`/science/`, `/spanish/`, `/portfolios/`)
   forwards to the new `/standard6/<subject>/` location.
2. **`404.html` catch-all** — any *deeper* old link (e.g. `/spanish/lessons/…`) hits the site's 404 page,
   whose script forwards old-subject paths to their `/standard6/` equivalent. Old subject prefixes it
   watches: `science, spanish, scriptures, computersc, math, portfolios, pe`.

**When adding a NEW Standard 6 page:** put it under `/standard6/…` and link to it with a `/standard6/…`
path. When adding a **Standard 5** page, put it under `/standard5/…`. Do **not** recreate subject folders
at the site root — those exist only as redirect stubs.

---

## 📂 Local Folder Structure

All repos are saved locally at:
```
C:\Users\Dell Latitude 3520\OneDrive\Shared with me\Code Projects\Python Projects\
```
> ⚠️ Corrected July 19, 2026 — the old path used the `zoloe` user folder, which does not exist on
> this machine. If a session reports "path not found," check the Windows user folder name first.

---

## 🔐 LMS Login System (✅ LIVE — July 16, 2026)

### Architecture (as built)
```
Student Browser
     |
     ├── edlo-utils.js  (shared JS, repo root — serves both grades)
     |        ├── vcLogin()         → Worker /login
     |        ├── vcSaveProgress()  → Worker /save-result
     |        └── vcGetProgress()   → Worker /progress
     |
     └── Cloudflare Worker: edlo-lms  (DEDICATED — thin CORS proxy)
              |   attaches secret API key, forwards request
              └── Google Apps Script: "VC-LMS Backend"
                       |   all logic: passwords, session tokens, Sheet reads/writes
                       └── Google Sheet: "VC-LMS"
                                ├── Tab 1: Students
                                ├── Tab 2: All Results
                                ├── Tab 3: Per Student Progress (formula-driven)
                                └── Tab 4: Class Summary (formula-driven)
```

> **Design decisions (July 16, 2026) — differ from the original vision below:**
> ① **Apps Script bridge instead of a Google service account** — same proven pattern as TutorOS;
> no JWT code or private keys in the Worker. ② **Dedicated `edlo-lms` Worker instead of new routes
> on `edlo-gemini`** — an LMS bug can never break AI feedback or live test grading. ③ **Session
> tokens are validated in Apps Script, not the Worker** — the Worker is a dumb proxy that almost
> never needs editing.

### Components
| Component | Name / Location |
|---|---|
| Google Sheet | `VC-LMS` (4 tabs, auto-built by `setupSheet()`) |
| Apps Script | `VC-LMS Backend` — attached to the Sheet (Extensions → Apps Script) |
| Cloudflare Worker | `edlo-lms` → https://edlo-lms.smartstandardsix.workers.dev |
| Health check | `…workers.dev/?action=ping` → `{"ok":true,"message":"LMS backend is alive"}` |
| Shared JS | `/edlo-utils.js` (repo root) |
| Login page | `/login/index.html` (root — serves both grades, grade-neutral footer) |

### Secrets (values NEVER written in this file — repo is public!)
| Secret | Where it lives |
|---|---|
| `API_KEY` | Apps Script → Project Settings → Script Properties (same value as Worker's `APPS_SCRIPT_KEY`) |
| `SESSION_SECRET` | Apps Script → Script Properties — ⚠️ NEVER change; password hashes depend on it |
| `APPS_SCRIPT_URL` | Cloudflare Worker `edlo-lms` → Settings → Variables and Secrets |
| `APPS_SCRIPT_KEY` | Cloudflare Worker `edlo-lms` → Settings → Variables and Secrets |

### Sessions
- Login lasts **30 days** per device (`SESSION_DAYS` in the Apps Script)
- Stored in `localStorage` key **`vc-session`** (joins `vc-passkey`, `vc-theme`, `vc-zoom`)
- Revisiting `/login/` while logged in skips the form and redirects
- InPrivate/incognito sessions vanish when the window closes (by design)

### Passwords (teacher workflow)
- Stored **hashed** in the Students tab (`sha256:…`) — never plain text
- Enroll: type the plain password in column B → run **`hashPlainPasswords`** in the Apps Script
  editor → converts to a hash (already-hashed rows are skipped; always safe to re-run)
- Reset: overwrite column B with a new plain password → run `hashPlainPasswords` again
- Disable a student: set `active` to `NO` — blocks saves/progress immediately, even if he or she
  is still logged in on a device
- Test account: `test.student` / `test123` — kept permanently for testing

### Protecting a page (2 lines — currently on NO pages, by interim decision)
```html
<script src="/edlo-utils.js"></script>
<script> vcRequireLogin(); </script>
```
Pages WITHOUT these lines stay public. Policy: home/grade/subject hubs stay public;
tests, quizzes, and dashboards get protected when the gate ships.

### Logging a result from any submit button
```javascript
vcSaveProgress({
  subject: 'Science', lo_code: 'SC6.19',
  activity_type: 'test', activity_name: 'Plant Adaptations',
  score: 24, max_score: 30, ai_feedback: feedbackText
});
```
`vcSaveProgress` never blocks the student — on network failure it logs a console warning
and the activity continues.

### edlo-utils.js functions
`vcLogin(u, p)` · `vcGetSession()` · `vcRequireLogin()` · `vcLogout()` · `vcSaveProgress(payload)` ·
`vcGetProgress()` (returns the student's result rows — the student dashboard's data source) ·
`vcSaveBeans(activityId, beans, maxBeans, meta)` *(added July 16, 2026)* — awards cacao beans 🌱 for a
lesson activity ONCE per device (`localStorage` lock `vc-pts-<activityId>`); writes a Tab 2 row with
`activity_type:'lesson'` (score = beans earned, max_score = beans possible); silent no-op when logged
out (no lock set, so beans can still be earned after a later login). No quest multiplier yet.

### Verified end-to-end (July 16, 2026)
✅ Login → redirect · ✅ Session persists across pages · ✅ /login/ skips form when logged in ·
✅ Wrong password rejected · ✅ Score saved to All Results (80%) · ✅ Progress retrieved ·
✅ Tabs 3 & 4 auto-calculate

---

## 🔑 Passkey System

### How it works
- Students enter a class code once on their first AI feedback request
- Code is saved to `localStorage` key: `vc-passkey` — persists across ALL lessons and ALL subjects on the domain
- The passkey is validated server-side inside the Cloudflare Worker — never exposed in browser code
- Wrong code → Worker returns 403, key is cleared, modal reappears
- New school year → change `VALID_KEY` in the Worker once → applies everywhere instantly

### Current passkey
| Item | Value |
|---|---|
| Current code | `EDLO-STD6` |
| localStorage key | `vc-passkey` |
| Validation location | Cloudflare Worker (server-side, secure) |
| Scope | Site-wide — works across all subjects automatically |

### Teacher reset code
| Item | Value |
|---|---|
| Reset code | `RESET-QUIZ` |
| How to use | On the "Test Already Submitted" lock screen, click **🔑 Reset Quiz for Testing** → enter `RESET-QUIZ` → page reloads fresh |
| Effect | Clears only the current browser/device — does not affect any student's lock |

### Changing the passkey (new school year)
1. Go to `dash.cloudflare.com` → Workers → `edlo-gemini`
2. Find line: `const VALID_KEY = 'EDLO-STD6';`
3. Change to new code e.g. `EDLO-STD7`
4. Click Deploy — updates everywhere instantly

---

## 🤖 AI Feedback System

### How it works
Student writes paragraph → clicks Enviar → browser checks for passkey → if none, modal appears → student enters code → browser sends paragraph + passkey to Cloudflare Worker → Worker validates passkey → forwards to OpenAI → OpenAI returns short feedback in Spanish → feedback appears on screen.

### Cloudflare Workers
| Item | Value |
|---|---|
| AI proxy Worker | `edlo-gemini` → https://edlo-gemini.smartstandardsix.workers.dev/ |
| LMS Worker (added July 16, 2026) | `edlo-lms` → https://edlo-lms.smartstandardsix.workers.dev/ |
| Cloudflare Account | Smartstandardsix@gmail.com |
| Dashboard | dash.cloudflare.com |

### Worker responsibilities
1. Handle CORS (allows requests from custom domain)
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

### Shared stylesheet — `/vc-theme.css` (July 20, 2026)
The "every page is fully self-contained" convention now has **one documented exception: CSS.**

```html
<link rel="stylesheet" href="/vc-theme.css">
<style>
/* ── Page-specific styles (shared core lives in /vc-theme.css) ── */
</style>
```

- The link goes **immediately before** the page's own `<style>` block, so inline rules always win.
- Put a rule in `vc-theme.css` only if it is meant to be identical everywhere. Anything one page
  does differently stays inline — that is not a mess, it is the design.
- **Editing `vc-theme.css` changes every page that links it.** That is the payoff: one theme colour
  change, one edit, instead of the "Find and replace across all files" ritual below.
### ⚖️ THE STANDING RULE (Edwin's decision, July 20, 2026) — READ BEFORE BUILDING A PAGE

**Every EXISTING page stays exactly as built. Every NEW page links `/vc-theme.css`.**

No exceptions, nothing to remember per-page. This is a deliberate stopping point, not an
unfinished job. Existing pages cost nothing to leave alone — students never see the difference —
and converting them is plumbing time better spent on lessons. **Do NOT "tidy up" existing pages
into the stylesheet without Edwin asking**, and note that the 16 Std5 assessments were deliberately
reverted once already (see Take-off Point) — do not redo that work.

**The one consequence to remember:** while both styles coexist, a site-wide theme colour change
means editing `vc-theme.css` **AND** every self-contained page. Check both. This is the price of
the split, and it was accepted knowingly.

**Can the shared file break the existing pages? NO — provably.** CSS applies only to pages that
link it. A page with no `<link>` to `vc-theme.css` cannot be affected by anything in it, ever. As
of July 20, 2026 **zero pages link it**, so the file is currently inert — it cannot affect
anything until a new page opts in.

### 🎨 Using vc-theme.css on a NON-Science page (Spanish, Math, Scriptures, PE, CompSci)

⚠️ `vc-theme.css` was extracted from **Science** pages, so its accent is **Science teal `#20C997`**.
It is baked into **16 CSS variables** — but **all 16 are variable definitions, ZERO are plain
rules**, so a page recolours itself by overriding variables inline. Never edit `vc-theme.css` to
recolour one page — that repaints every page that links it.

```html
<link rel="stylesheet" href="/vc-theme.css">
<style>
/* Spanish page — override the 16 teal-tinted vars. Swap #FF922B for your subject accent. */
:root, body[class*="theme-"]{
  --top-badge-bg:#FF922B;  --input-focus:#FF922B;   --opt-sel-b:#FF922B;
  --opt-sel-bg:rgba(255,146,43,0.15);   --opt-hover:rgba(255,146,43,0.12);
  --score-bg:rgba(255,146,43,0.08);     --score-border:rgba(255,146,43,0.25);
  --fb-bg:rgba(255,146,43,0.06);        --fb-border:rgba(255,146,43,0.22);
  --info-border:rgba(255,146,43,0.18);  --lock-border:rgba(255,146,43,0.22);
  --modal-border:rgba(255,146,43,0.30);
  --scenario-bg:rgba(255,146,43,0.06);  --scenario-border:rgba(255,146,43,0.22);
  --h1-grad:linear-gradient(135deg,#fff 0%,#FF922B 50%,#4DABF7 100%);
  /* --grad-bar is the multi-colour rainbow bar — usually leave it alone */
}
</style>
```

Subject accent hexes are in the **Subject Accent Colors** table below.

- **Currently linked by:** nothing yet — the first page to use it will be the next page built.
- **Building a new test/quiz:** copy any existing Std5 assessment (e.g.
  `standard5/science/tests/c1-unit1/index.html`), then **delete from its `<style>` block every rule
  that already exists in `vc-theme.css`** and add the `<link>` above it. What remains should be
  roughly 6–16 page-specific rules — typically `.wrapper`, `.test-container`, figure sizing,
  `.q-progress-inner`, a `@media` block and any one-off tweak.
- **First time you do this, check it in the browser with the test's KV gate OPEN.** Most of the
  shared file styles the question paper, options, results, modal and feedback — none of which
  render while the gate is closed. A closed-gate page looking right proves very little.
- Redirect stubs (`/science/`, `/spanish/`, `/portfolios/`) stay fully inline **on purpose** — a
  redirect must not wait on a stylesheet.
- JS is still fully inline on every page. IDEAS #10's JS half is deliberately NOT done yet.

### Fonts
- **Headings:** Fredoka One (Google Fonts)
- **Body:** Nunito (Google Fonts)

### ⚖️ STANDING RULE — every NEW page's accent FOLLOWS THE THEME (Edwin, July 21, 2026)

**The accent colour changes with the theme, not with the subject:**

| Theme | Accent |
|---|---|
| 🌙 Night | Teal `#20C997` |
| ☀️ Sunny | Orange `#FF922B` |
| ☁️ Cloudy | Blue `#4A90D9` |
| 🌿 Nature | Green `#4CAF50` |

- **Apply via `body.theme-*`** (site-wide convention) — **never `[data-theme]` on `<html>`.**
  `[data-theme]` pages also tend to carry `overflow-x:hidden` on `html`, which breaks sticky
  headers (see Mobile Rules).
- **Change WITH the accent, not just `--bg`:** the accent itself, text-on-accent (a dark teal
  label is unreadable on orange), the h1 gradient, right/wrong feedback colours (light themes
  need darker `#2e7d1a` / `#c62828`, not `#69DB7C` / `#FF6B6B`), footer borders, soft accent tints.
- **Copy the palette from** `standard5/science/index.html` (the Science hub).
  **Worked example for a lesson page:** `standard5/science/lessons/week01-technology-climate/`.
- **EXISTING pages are NOT being converted** (Edwin, July 21, 2026). The 16 Std5 tests and quizzes
  keep a fixed subject accent, and `dashboard/`, `teacher/`, `login/`, Science Weeks 2–3 and
  `prevenient-grace` keep what they have. They are live and they work; the gain is cosmetic.
  **Accepted consequence:** a student going lesson → test sees the accent change. That is fine.
  If one of those pages is rebuilt for another reason, bring it onto this rule then — but do not
  open files just to recolour them. Full audit in `IDEAS.md` #12.

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
- Wrapper: `max-width: 1400px`, padding `0 max(1rem, 4vw)` — NEVER use `1in`
- Same `max(1rem, 4vw)` padding applies to `.site-footer`
- Cards: `flex: 0 1 260px`, centered with flexbox, incomplete rows center automatically
- Wide cards (activities/assessments): `flex: 0 1 340px`
- Lab cards: `flex: 0 1 420px`
- Each subject has its own accent color

### Mobile Rules (apply to every subject hub page)
- At `max-width: 640px`: `.wide-card` and `.lab-card` → `flex: 0 1 100%`
- At `max-width: 480px`: `.grid .card` → `flex: 0 1 100%`
- `overflow-x: hidden` goes on **`body` (and `.wrapper`) — NOT on `html`**
  ⚠️ **Corrected July 20, 2026.** This rule used to say "`html`, `body`, and `.wrapper` must all
  have `overflow-x: hidden`". That is wrong and it silently breaks `position: sticky`:
  `overflow-x: hidden` on `<html>` makes `<html>` a scroll container, so a sticky header pins to
  that instead of the viewport and just scrolls away. It cost a debugging round on the Week 1
  lesson's sticky progress bar. **The live Std5 test pages never followed the old rule** — they
  put `overflow-x: hidden` on `body` only, which is why their sticky progress bar works. Match
  the tests. `body` alone still prevents horizontal scroll on a phone.
- h1 font size must use `clamp(1.8rem, 8vw, 3.8rem)` — never a fixed size
- `.welcome-text` must have `min-width: 0` and `word-break: break-word`

### Cycle Divider Mobile Rules
- `.cycle-divider-label`: always `white-space: normal` and `text-align: center`
- At `max-width: 640px`: `.cycle-divider` → `flex-wrap: wrap; justify-content: center`
- At `max-width: 640px`: `.cycle-divider-label` → `width: 100%; text-align: center`
- At `max-width: 640px`: `.cycle-divider-line` → `display: none`

### Copyright Footer
Footer text is grade-specific (since the site now serves two grades):
```
Grade picker (home):  © 2026 Mr. EdLo's Virtual Classroom — Belize · All rights reserved.
Standard 5 pages:      © 2026 Mr. EdLo's Virtual Classroom — Standard 5 · Belize · All rights reserved.
Standard 6 pages:      © 2026 Mr. EdLo's Virtual Classroom — Standard 6 · Belize · All rights reserved.
```

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

## 🖼️ Image Guidelines

- **Max image size:** 500 KB per image
- **Recommended dimensions:** 1600 x 900 px for hero/banner images
- **Compression tools:** squoosh.app or tinypng.com
- **Storage strategy:** Host large images on Postimg.cc and reference by URL — keeps repo size lean
- **GitHub Pages limit:** 1 GB repo storage (free) — no monthly cost

---

## 🔧 VS Code Workflow

### Opening the repo
`File → Open Folder` → select the Virtual-Classroom folder

### Saving files
`Ctrl + S` — always check the dot (●) on the tab disappears before pushing

### Pushing changes to GitHub
```bash
git add .
git commit -m "Your message here"
git push
```

### Switching to Virtual-Classroom in terminal
```bash
cd "C:\Users\Dell Latitude 3520\OneDrive\Shared with me\Code Projects\Python Projects\Virtual-Classroom"
```

### Find and replace across all files
`Ctrl + Shift + H` — use to update things like domain names, copyright year, or school name across all files at once

---

## 📚 Pages Built

| Page | URL | Status |
|---|---|---|
| Grade Picker (home) | edlovirtualclassroom.com | ✅ Live |
| Standard 5 Hub | edlovirtualclassroom.com/standard5/ | ✅ Live (Science card now links to its hub) |
| Standard 5 Science Hub | edlovirtualclassroom.com/standard5/science/ | ✅ Live (July 15 — phone-verified, themes fixed) |
| Std5 Science tests & quizzes (16) | edlovirtualclassroom.com/standard5/science/tests/… &amp; /quizzes/… | ✅ Live (July 15) |
| Std5 Science Lesson Wk 1 | edlovirtualclassroom.com/standard5/science/lessons/week01-technology-climate/ | ✅ Built July 16 — live after next push |
| Std5 Science Lesson Wk 2 | edlovirtualclassroom.com/standard5/science/lessons/week02-climate-economy/ | ✅ Built July 16 — live after next push |
| Std5 Science Lesson Wk 3 | edlovirtualclassroom.com/standard5/science/lessons/week03-weather-vs-climate/ | ✅ Built July 16 — live after next push |
| Standard 6 Hub | edlovirtualclassroom.com/standard6/ | ✅ Live |
| Spanish Hub (Std6) | edlovirtualclassroom.com/standard6/spanish/ | ✅ Live |
| Science Hub (Std6) | edlovirtualclassroom.com/standard6/science/ | ✅ Live |
| Portfolios (Std6) | edlovirtualclassroom.com/standard6/portfolios/ | ✅ Live |
| Math Hub (Std6) | edlovirtualclassroom.com/standard6/math/ | ❌ Not built yet |
| Scriptures Hub (Std6) | edlovirtualclassroom.com/standard6/scriptures/ | ❌ Not built yet |
| Computer Science Hub (Std6) | edlovirtualclassroom.com/standard6/computersc/ | ❌ Not built yet |
| PE Hub (Std6) | edlovirtualclassroom.com/standard6/pe/ | ❌ Not built yet |
| Other Standard 5 subject hubs | edlovirtualclassroom.com/standard5/&lt;subject&gt;/ | ❌ Not built yet (Science done first) |
| Login Page | edlovirtualclassroom.com/login/ | ✅ Live (July 16, 2026) |
| Student Dashboard | edlovirtualclassroom.com/dashboard/ | ✅ Built July 17, 2026 — live after next push |
| Teacher Dashboard | edlovirtualclassroom.com/teacher/ | ✅ Built July 17, 2026 — live after next push |

---

## 📚 Lessons Built

### Spanish
| Lesson | Folder | Status | Activities | AI Feedback |
|---|---|---|---|---|
| Mis Aspiraciones: Voy a + infinitivo | mis-aspiraciones-intro | ✅ Live | ✅ Full interactive | ✅ Active (OpenAI) |

### Science
| Lesson | Folder | Status | Activities | AI Feedback |
|---|---|---|---|---|
| SC 6.19 Plant Adaptations (Test) | science/ | ✅ Live | ✅ Full test | ✅ Active (OpenAI) |
| SC 6.20 Plant Diversity (Test) | science/ | ✅ Live | ✅ Full test | ✅ Active (OpenAI) |

### Science — Standard 5 (interactive lessons, 🌱 beans wired, zero AI cost)
| Lesson | Folder | Status | Activities | Beans max |
|---|---|---|---|---|
| Wk 1 · SC 1.09 Technology & Climate Change | standard5/science/lessons/week01-technology-climate/ | ✅ Built July 16, 2026 | 5 rule-based + hook + reflect | 72 🌱 |
| Wk 2 · SC 1.10 Climate Change & Belize's Economy | standard5/science/lessons/week02-climate-economy/ | ✅ Built July 16, 2026 | 5 rule-based + hook + reflect | 70 🌱 |
| Wk 3 · SC 1.11 Weather vs. Climate | standard5/science/lessons/week03-weather-vs-climate/ | ✅ Built July 16, 2026 | 5 rule-based + hook + reflect | 70 🌱 |

---

## 🗺️ Current Priorities (May 2026 — before summer)

1. **Build remaining subject hubs** — Math, Scriptures, Computer Science, PE
2. **More Spanish lessons** — build out remaining lessons using the established template
3. **Science lessons** — build lesson content under science hub
4. **Rubric system** — add rubric table to PDF output for official grading
5. **AI-powered chatbot** — lesson-aware assistant students can ask questions
6. **Teacher voice audio** — replace TTS with recorded MP3 clips per section

---

## 🏗️ LMS Vision — Summer 2026 Build Plan

A lightweight Learning Management System built entirely on free infrastructure already in place. No new services needed.

> **⚠️ July 16, 2026 — Foundation stage is BUILT.** The diagram below shows the ORIGINAL vision;
> the as-built system differs (dedicated `edlo-lms` Worker + Apps Script bridge instead of
> edlo-gemini routes + service account). See the **LMS Login System** section above for the
> authoritative as-built reference.

### What it adds
- One username/password per student stored in Google Sheets
- Student logs in once — session persists across all pages and subjects
- Every activity (test, quiz, lesson, exit slip) automatically logs a result row to Google Sheets
- Student dashboard showing personal progress per subject and per LO
- Teacher dashboard showing full class performance, weak LOs, and submission tracking

### Architecture Overview
```
Student Browser
     |
     ├── edlo-utils.js  (shared JS linked on every page)
     |        ├── vcLogin()         → Worker /login
     |        ├── vcSaveProgress()  → Worker /save-result
     |        └── vcGetProgress()   → Worker /progress
     |
     └── Cloudflare Worker (edlo-gemini) — 3 new endpoints added
              ├── /ai-feedback    (existing — unchanged)
              ├── /login          (new)
              ├── /save-result    (new)
              └── /progress       (new)
                       |
                       └── Google Sheets (via Service Account)
                                ├── Tab 1: Students
                                ├── Tab 2: All Results
                                ├── Tab 3: Per Student Progress (formula-driven)
                                └── Tab 4: Class Summary (formula-driven)
```

### Google Sheet Structure

**Tab 1 — Students**
| Column | Field | Example |
|---|---|---|
| A | username | `john.smith` |
| B | password | (hashed) |
| C | full_name | `John Smith` |
| D | first_name | `John` |
| E | class_id | `Std6-2026` |
| F | active | `YES` / `NO` |

**Tab 2 — All Results** (one row per submission, auto-appended)
| Column | Field | Example |
|---|---|---|
| A | timestamp | `2026-09-15 08:42` |
| B | username | `john.smith` |
| C | student_name | `John Smith` |
| D | subject | `Science` |
| E | lo_code | `SC6.19` |
| F | activity_type | `test` / `quiz` / `lesson` / `exit-slip` |
| G | activity_name | `Plant Adaptations` |
| H | score | `24` |
| I | max_score | `30` |
| J | percent | `80` |
| K | ai_feedback | (AI feedback text if any) |

**Tabs 3 and 4** — Formula-driven only. No code writes to them. Auto-calculate averages, weak LOs (below 70%), and class summaries from Tab 2.

### Worker — New Endpoints

| Endpoint | What it does |
|---|---|
| `/login` | Validates username + password against Tab 1, checks active=YES, returns session token |
| `/save-result` | Validates session token, appends one row to Tab 2 |
| `/progress` | Validates session token, returns all Tab 2 rows for that student |

### edlo-utils.js — Shared JS File
Hosted at: `edlovirtualclassroom.com/edlo-utils.js`
Linked on every page with: `<script src="/edlo-utils.js"></script>`

Functions:
- `vcLogin(username, password)` — authenticates student
- `vcGetSession()` — returns stored session or null
- `vcRequireLogin()` — redirects to /login/ if no session found
- `vcSaveProgress(payload)` — sends result row to Worker
- `vcGetProgress()` — fetches all results for current student

Adding LMS to any existing page requires only 2 lines:
```html
<script src="/edlo-utils.js"></script>
<script> vcRequireLogin(); </script>
```

Adding result logging to any submit button:
```javascript
vcSaveProgress({
  subject: 'Science',
  lo_code: 'SC6.19',
  activity_type: 'test',
  activity_name: 'Plant Adaptations',
  score: 24,
  max_score: 30,
  ai_feedback: feedbackText
});
```

### New Pages to Build

| Page | Path | Description |
|---|---|---|
| Login | `/login/index.html` | Student login page, styled to match site |
| Student Dashboard | `/dashboard/index.html` | Personal progress — subject cards, LO bars, activity history, badges |
| Teacher Dashboard | `/teacher/index.html` | Password-protected — class overview, LO breakdown, per-student drill-down, submission tracker |

### Student Dashboard Features
- Subject cards showing current average per subject
- Progress bar per LO — green (strong), yellow (needs review)
- Activity history timeline with scores and AI feedback
- Achievement badges — First Test, Perfect Score, 10 Activities, etc.

### Teacher Dashboard Features
- Password-protected (teacher credentials only)
- Full class overview — one row per student, colour-coded by performance
- Per LO breakdown — which LOs the whole class struggled with
- Per student drill-down — click name, see full activity history
- Submission tracker — who submitted today's activity, who has not
- Weekly summary report

### Scalability — Tutor Academy Ready
The system is architected to scale beyond one school class with zero rework:
- `class_id` field in Tab 1 separates school students from tutor students automatically
- Worker URL (`smartstandardsix.workers.dev`) has no school-specific naming
- `edlo-utils.js` has no hardcoded class references — all context comes from session
- Adding a tutor academy = new rows in Tab 1 with a different `class_id` + a new branded landing page
- No existing school pages, tests, or lessons are ever touched

### Summer Build Order

| Month | Stage | What gets built | Status |
|---|---|---|---|
| June | Foundation | Google Sheet + Apps Script backend + `edlo-lms` Worker + `edlo-utils.js` + login page | ✅ Done July 16, 2026 |
| July | Retrofit | Add `vcSaveProgress()` to existing tests (2 lines each) + per-test open/closed KV switch + `vcRequireLogin()` on the 16 Std5 pages | ❌ Next |
| July | Student Dashboard | `/dashboard/index.html` — personal progress view | ❌ |
| August | Teacher Dashboard | `/teacher/index.html` — full class management view | ❌ |
| September | Go Live | Enroll all students, brief them on login, every activity feeds dashboards from day one | ❌ |

### AI Features — Later Phase
- Hint mode — student clicks for a guiding question before submitting
- Re-attempt feedback — AI compares first and second attempt
- Vocabulary check — flags missing required scientific terms
- Lesson activity grading — drag/drop, labelling, sorting activities

### Storage Capacity
Google Sheets limit is 10 million cells. At ~40 students with ~1,400 submissions per year, the site uses roughly 15,400 cells annually — well under any practical limit. Archive previous year's Tab 2 at the start of each school year to keep formulas fast.

---

## 💰 Cost Summary

| Service | Cost | Notes |
|---|---|---|
| GitHub Pages | Free | Hosting for all pages |
| Namecheap Domain | ~$10–15/year | edlovirtualclassroom.com |
| Cloudflare Worker | Free | 100,000 requests/day free tier |
| OpenAI (gpt-4o-mini) | ~$23/month | 40 students, all lessons active |
| Google Fonts | Free | Fredoka One + Nunito |
| Google Classroom | Free | Assignment submission + grading |
| Google Apps Script | Free | LMS backend bridge (`VC-LMS Backend`) — replaced the planned service account |

**Total monthly cost when fully built:** ~$23/month + ~$1/month domain

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

*Documentation maintained by Mr. EdLo — update this file whenever a new lesson goes live, a new system is added, or infrastructure changes.*
