# 🏪 Bean Store Build Plan
**Mr. EdLo's Virtual Classroom — edlovirtualclassroom.com**
*Plan created: July 18, 2026 · Status: ✅ website code BUILT (backend steps for Edwin in `BEAN-STORE-DEPLOY.md`) · Design source: `IDEAS.md` #6 (finalized July 17, 2026)*

---

## 1. The Goal

Let students cash in cacao beans 🌱 they've earned for real classroom prizes, without ever touching
the team race or class goal. This is the session queued right after the secure test-gate retrofit
(`NEXT-SESSION-START.md`, `PROJECT-DOCS.md` Take-off Point) — the gate rollout is committed and
pushed (`a6d8edf`), so this plan assumes that work is done. **Please confirm the 5-step gate
deploy checklist (KV paste, push, live spot-check, class enrollment) is actually finished on the
Cloudflare/Sheets side** — those steps happen outside the repo, so I can't verify them from files.

---

## 2. Core Design Decisions (locked — from `IDEAS.md` #6 + this session)

| Decision | Choice | Reason |
|---|---|---|
| Balance basis | **Individual student balance** = earned (`lesson`+`bonus` beans) − spent (`redeem` beans) | Confirmed: spending must never lower the team race or class goal — those only ever sum `lesson`+`bonus` rows |
| Redemption flow | **Teacher-initiated only** — student asks in class, teacher fills the Redeem form on `/teacher/` | No student purchase button, no online approval queue — matches "redemption happens in class" |
| Stock/balance limits | **Hard block** — Redeem button disabled (and rejected server-side) if `cost > balance` or `stock ≤ 0` | Your call this session — prevents accidental over-redemption even in the heat of class |
| Prize catalog storage | New **Prizes tab** in the `VC-LMS` Sheet — you edit name/cost/category/stock/active directly | Matches how Group Totals/Quest data already lives in Sheet tabs, zero code changes to update prices |
| Where it lives | `/dashboard/` gets a browse-only **Store panel** (balance + catalog); `/teacher/` gets a **Redeem panel** (twin of the existing Award Bonus panel) | Reuses the exact card/panel language already on both pages |

---

## 3. What Will NOT Be Built (scope exclusions)

- ❌ Student self-checkout / "Redeem" button on the student dashboard — browse only, teacher completes every redemption
- ❌ Online approval queue, notifications, or pending states — a redemption is instant once the teacher submits it
- ❌ Any change to Group Totals, class goal, or team race bars — `redeem` rows are a new `activity_type`, automatically excluded from every existing team-total formula/JS filter (which already only checks `lesson`/`bonus`)
- ❌ Auto-restocking or purchase history export — stock is a number you edit by hand in the Prizes tab when you restock
- ❌ Changes to the test gate, passkey, or AI feedback systems

---

## 4. Data Architecture Changes

Same pattern as every prior build: **rows into Tab 2 → a new Prizes tab for catalog data → dashboard/teacher read both.** No new services.

### Google Sheet (`VC-LMS`)

**New tab — `Prizes`** (you fill in, ~10 min):
| Column | Field | Example |
|---|---|---|
| A | prize_name | `Sticker or fancy pencil` |
| B | cost | `100` |
| C | category | `quick` / `medium` / `big` |
| D | stock | `20` *(you set the starting count; decrements on redemption)* |
| E | active | `YES` / `NO` *(set NO to hide a retired prize without deleting the row)* |

Starting catalog = your finalized July 17 list (Quick wins 100–180 🌱, Medium saves 360–750 🌱, Big
saves 1200–2500 🌱) — I'll hand you the exact 9 rows to paste in step 2.1.

**Tab 2 — All Results:** no structural change. New `activity_type` value: `redeem`. For redeem rows,
`score` = beans spent (always positive), `subject` = `Bean Store`, `activity_name` = prize name,
`lo_code` blank.

**Balance formula (client-side, no new tab needed):** same pattern already used for the beans-earned
chip on `/dashboard/` — `balance = Σ(lesson+bonus scores) − Σ(redeem scores)`, computed from the
student's own `vcGetProgress()` rows. The teacher's redeem form needs the same number server-side
(see below) so the hard block can't be bypassed by a slow client.

### Apps Script (`VC-LMS Backend`)
| Action | Status | Behavior |
|---|---|---|
| `prizes` *(new, public)* | Layer 2 | Returns all `Prizes` rows where `active = YES` |
| `redeem-prize` *(new, teacher-gated by `TEACHER_CODE`)* | Layer 2 | Params: `username`, `prize_name`. Looks up `cost`/`stock` from the Prizes tab **server-side** (never trusts the client number) → computes the student's current balance from Tab 2 → rejects with a clear error if `cost > balance` or `stock ≤ 0` → on success: appends the `redeem` row to Tab 2 AND decrements that prize's `stock` cell by 1 → returns `{ok, newBalance, newStock}` |

### Worker (`edlo-lms`)
| Route | Status | Change |
|---|---|---|
| `/login`, `/save-result`, `/progress`, `/leaderboard`, `/teacher-data`, `/award-bonus` | Existing | None |
| `/prizes` *(new)* | Layer 2 | Thin proxy → Apps Script `prizes` action, no auth needed (public catalog, no personal data) |
| `/redeem-prize` *(new)* | Layer 2 | Thin proxy → Apps Script `redeem-prize` action, forwards the teacher code the same way `/award-bonus` already does |

### edlo-utils.js
| Function | Status |
|---|---|
| `vcGetPrizes()` *(new)* | Fetches `/prizes`, used by the dashboard Store panel |
| Everything else | Unchanged |

---

## 5. Build Layers

### 🔨 LAYER 2 — Build now

| Step | Objective | Files affected | Verification |
|---|---|---|---|
| 2.1 | Add `Prizes` tab to the `VC-LMS` Sheet; paste in the 9-row starting catalog with costs/categories/stock/active | Google Sheet (you, ~10 min, exact rows provided) | Tab visible with 9 rows, correct costs |
| 2.2 | Add `prizes` + `redeem-prize` actions to `VC-LMS Backend` (Apps Script) | Apps Script editor (you paste, I write the code) | Test `redeem-prize` on `test.student` from the Apps Script editor — Tab 2 gets one `redeem` row, stock cell drops by 1 |
| 2.3 | Add `/prizes` + `/redeem-prize` to `edlo-lms` Worker `ROUTES` map | `dash.cloudflare.com` → `edlo-lms` (you deploy, one-line change like `/award-bonus` was) | Browser POST test to `/prizes` returns the 9-item catalog |
| 2.4 | Add `vcGetPrizes()` to `edlo-utils.js` | `/edlo-utils.js` | Console test: call it logged out, get the catalog back |
| 2.5 | Build Store panel on `/dashboard/` — balance chip (earned − spent), prize cards grouped by category (Quick/Medium/Big), greyed + "🔒 not enough beans" or "🔒 out of stock" state when unaffordable/depleted | `dashboard/index.html` | Live test as `test.student`: balance shown correctly; redeem one prize via 2.6, refresh dashboard, balance drops, no change to team race bar |
| 2.6 | Build Redeem panel on `/teacher/` (Section B, next to the bonus awarder) — student picker (reuses existing list) + prize picker (cost/stock shown inline) + Redeem button, hard-disabled when `cost > balance` or `stock = 0`, success/error note like the bonus panel | `teacher/index.html` | Award-then-redeem test end to end; attempt an over-cost redemption → button stays disabled with a clear reason |
| 2.7 | Update `PROJECT-DOCS.md` (new tab, 2 endpoints, `vcGetPrizes()`, `redeem` activity_type) + mark `IDEAS.md` #6 ✅ shipped + flip this file's status | `PROJECT-DOCS.md`, `IDEAS.md`, `BEAN-STORE-PLAN.md` | Read-through |

**Depends on:** the secure test-gate deploy checklist being finished (see §1) — please confirm before I start 2.1.

---

## 6. Cost & Risk Summary

| Item | Impact |
|---|---|
| OpenAI cost | Zero change — redemption is rule-based, no AI calls |
| Sheets capacity | +1 tiny tab (9 rows) + ~1 Tab 2 row per redemption — negligible |
| Worker | Two small routes added to `edlo-lms` only — `edlo-gemini` (AI proxy, live test grading) untouched |
| Risk to existing system | None — `redeem` is a new `activity_type`; every existing formula/JS filter that sums beans already whitelists `lesson`/`bonus` only, so it ignores `redeem` rows automatically |
| Biggest effort item | 2.6 (Redeem panel) — mirrors the bonus panel closely, so should be fast |

---

## 7. Approval Checklist (Edwin decides before build starts)

- [ ] Confirm the secure-gate deploy checklist (§1) is actually finished
- [ ] 9-item starting catalog from July 17 still correct, or any changes to costs/categories?
- [ ] Starting stock counts per prize (I don't have these — needed for step 2.1)
- [ ] Build order confirmed: 2.1 → 2.7 in sequence, you test live after each step

---

*Once approved, this plan gets added alongside `DASHBOARD-GAMIFICATION-PLAN.md` and referenced from
`PROJECT-DOCS.md`'s Take-off Point.*
