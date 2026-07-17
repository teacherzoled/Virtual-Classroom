# Dashboard & Gamification Build Plan
**Mr. EdLo's Virtual Classroom — edlovirtualclassroom.com**
*Plan created: July 16, 2026 · Status: **LAYER 1 BUILT July 17, 2026** (after a one-day pause to build three bean-earning Std5 lessons first). Focus is **Standard 5**; Standard 6 on standby. Shipped: Sheet Group Totals tab + group_id col · Apps Script leaderboard/teacher-data/award-bonus (v2) · Worker routes · vcSaveBeans + vcGetLeaderboard · `/dashboard/` · `/teacher/`. Decisions: teams as planned · class goal **6000** (Edwin) · teacher auth = TEACHER_CODE passcode · **quest DEFERRED** (Tab 6 + multiplier + banner/setter = next add-on). Step 1.6 dropped (Std6 lesson retrofit) — Std5 lessons carry beans natively. Remaining: Layer 2 journey map · quest · Layer 3 continues with each new lesson.*

---

## 1. The Goal

Motivate Standard 6 students to use the website to review class material, through:
1. A **student dashboard** showing personal progress (mastery) and engagement (cacao beans)
2. A **teacher dashboard** showing class performance and managing the game layer
3. A **team competition** — students grouped into Belize-animal teams, earning beans that move their team along a journey through Belize's ecosystems

---

## 2. Core Design Decisions (locked)

| Decision | Choice | Reason |
|---|---|---|
| Two tracks, never blended | **Cacao beans** (engagement) vs **Mastery %** (assessments only) | Keeps academic data honest; beans never touch grades |
| Points name | 🌱 **Cacao beans** | Belizean identity (Maya currency); matches Belize-themed passkeys |
| Mastery source | Only `test` / `quiz` / `exit-slip` rows | Lesson activities are practice, not assessment |
| Bean source | Lesson activities (`activity_type: 'lesson'`), teacher bonuses (`'bonus'`) | Rule-based, zero AI cost |
| Teams | 4 teams: 🐆 Jaguars, 🦜 Toucans, 🦙 Tapirs, 🦭 Manatees | Teacher-assigned via `group_id` column (presented to students as "your team"); reshuffle per cycle if desired |
| Anti-farming | **First-completion lock** per activity via localStorage (`vc-pts-<activity-id>`) | Reuses proven quiz-lock pattern; no server logic |
| Streaks | **Weekly** participation, not daily | Daily streaks punish students without reliable home internet |
| Quests | One weekly "double beans" LO, set by teacher | Steers review toward weak LOs |
| Class goal | All-teams-combined bean target with class reward | Keeps trailing teams motivated; competition inside community |
| Dashboard style | **Hybrid A+C** — Concept A card language & starry-night shell + Concept C glanceable tiles | Feels native to the site, not a bolted-on app |
| Journey theme | Ecosystem route through Belize (links to Science content) | Waypoint labels appear in Layer 1; full map in Layer 2 |

### Ecosystem Journey Route (7 waypoints)
1. 🌳 Broadleaf rainforest — Toledo / Punta Gorda (cohune palms, buttress roots)
2. ⛰️ Maya Mountains / Mountain Pine Ridge (pine forest)
3. 🌾 Savanna — coastal plain (bay cedar, dry season)
4. 🐊 Rivers & wetlands — Belize River / Crooked Tree Lagoon
5. 🌿 Coastal mangroves — Belize City coast (red mangrove prop roots)
6. 🏝️ Cayes & seagrass — Caye Caulker
7. 🐠 **Finish:** Barrier Reef / Ambergris Caye

*Layer 1 shows 4 of these as labels under the race bars (Rainforest · Savanna · Mangroves · Reef). Layer 2 uses all 7 on the SVG map.*

---

## 3. What Will NOT Be Built (scope exclusions)

- ❌ Daily point caps (revisit only if one student visibly farms the system)
- ❌ Beans shown anywhere near grades — teacher dashboard keeps mastery and beans in visibly separate sections
- ❌ Random group assignment button in v1 (teacher assigns in Sheet; shuffle button possible later)
- ❌ Bean store / prize redemption system (rewards handled offline by teacher)
- ❌ Real-time updates / websockets — dashboard refreshes on page load only
- ❌ Any change to the AI feedback system, passkey system, or existing tests

---

## 4. Data Architecture Changes

Everything rides on the already-planned pattern: **rows into Tab 2 → formulas summarize → dashboard reads.** No new services.

### Google Sheet (LMS spreadsheet)

**Tab 1 — Students** · one new column:
| Column | Field | Example |
|---|---|---|
| G *(new)* | group_id | `jaguars` / `toucans` / `tapirs` / `manatees` |

**Tab 2 — All Results** · no structural change. New `activity_type` values in use: `lesson` (bean-earning activity) and `bonus` (teacher-awarded). For bean rows, `score` = beans earned, `max_score` = beans possible.

**Tab 5 — Group Totals** *(new, formula-driven only)*:
| Column | Formula concept |
|---|---|
| A | group name (4 fixed rows) |
| B | `SUMIFS` beans from Tab 2 where student's group matches (via lookup to Tab 1) and activity_type is `lesson` or `bonus` |
| C | class total = `SUM(B2:B5)` (single cell for class goal) |

**Tab 6 — Quest** *(new, one row, teacher-edited weekly)*:
| Column | Field | Example |
|---|---|---|
| A | quest_lo | `MA6.4` |
| B | quest_text | `Multiplication activities earn double beans!` |
| C | multiplier | `2` |

### Cloudflare Worker (edlo-gemini)
| Endpoint | Status | Change |
|---|---|---|
| `/login`, `/save-result`, `/progress` | As already planned (June foundation) | None — beans are just rows with different `activity_type` |
| `/leaderboard` *(new, small)* | Layer 1 | Returns Group Totals + class total + current quest. **No login required** (public class data, no personal info) |

### edlo-utils.js
| Function | Status |
|---|---|
| `vcLogin`, `vcGetSession`, `vcRequireLogin`, `vcSaveProgress`, `vcGetProgress` | As planned |
| `vcSaveBeans(activityId, beans, subject, loCode, activityName)` *(new)* | Wraps `vcSaveProgress` with `activity_type:'lesson'`; checks/sets localStorage lock `vc-pts-<activityId>` first — returns silently if already earned; applies quest multiplier if `loCode` matches current quest |
| `vcGetLeaderboard()` *(new)* | Fetches `/leaderboard` |

### localStorage keys (added to site registry)
| Key | Purpose |
|---|---|
| `vc-pts-<activity-id>` | First-completion bean lock, e.g. `vc-pts-spanish-aspiraciones-s2` |

---

## 5. Bean Values (starting economy — adjustable)

| Action | Beans |
|---|---|
| Complete a rule-based lesson activity (matching, word bank, drag-drop, etc.) | 5 flat + 1 per correct item (typical section ≈ 8–12 🌱) |
| Complete a lesson Checkpoint (Section 6) | 10 flat + 1 per correct |
| Finish all sections of a lesson | 15 completion bonus |
| Weekly quest LO | ×2 multiplier on the above |
| Teacher bonus (participation, kindness, great question) | Teacher chooses (suggested 5–20) |

*Assessments (tests/quizzes) award NO beans — they feed Mastery % only. This keeps the tracks clean.*

---

## 6. Build Layers

### 🔨 LAYER 1 — Build now (extends the planned July dashboard session)

| Step | Objective | Files / locations affected | Verification |
|---|---|---|---|
| 1.1 | Add `group_id` column to Tab 1; create Tab 5 (Group Totals) and Tab 6 (Quest) with formulas | Google Sheet (Edwin does this, ~10 min, with exact formulas provided) | Enter a fake Tab 2 row → Tab 5 total updates |
| 1.2 | Add `/leaderboard` endpoint to Worker | Worker code (dash.cloudflare.com) | Browser visit `?action=leaderboard`-style test returns JSON with 4 groups + quest |
| 1.3 | Add `vcSaveBeans()` + `vcGetLeaderboard()` to edlo-utils.js | `/edlo-utils.js` | Console test: call twice, second call blocked by lock; Sheet shows exactly one row |
| 1.4 | Build student dashboard `/dashboard/index.html` — hybrid A+C: header (name, team, bean pill, mastery pill), quest banner, team race bars with ecosystem labels, class goal bar, subject mastery cards, recent activity feed, weekly-streak badge row. Self-contained HTML, 4 themes, all mobile rules from memory (max(1rem,4vw) padding, 640px breakpoint, overflow-x hidden on html, cards flex 0 1 100% on mobile, 44px touch targets) | `dashboard/index.html` | Live browser test on desktop + 320px phone width, all 4 themes |
| 1.5 | Build teacher dashboard `/teacher/index.html` — separate sections: (A) Mastery: class table color-coded, weak-LO panel, per-student drill-down, submission tracker; (B) Game: group totals, group membership editor guidance, quest setter, **bonus beans button** (student picker + amount + reason → `vcSaveProgress` with `activity_type:'bonus'`) | `teacher/index.html` | Award a test bonus → row in Tab 2 → Tab 5 total moves → student dashboard reflects it |
| 1.6 | Retrofit ONE existing lesson (mis-aspiraciones-intro) with `vcSaveBeans()` calls on its rule-based sections as the reference implementation | `spanish/mis-aspiraciones-intro/index.html` | Complete a section as a student → +beans on dashboard; repeat section → no double beans |
| 1.7 | Update PROJECT-DOCS.md: new tabs, endpoint, functions, localStorage key, bean economy, layer status | `PROJECT-DOCS.md` | Read-through |

**Depends on:** the June foundation (login, `/save-result`, `/progress`, Sheet service account) being live first, per the existing summer plan. Layer 1 slots into July as planned + roughly one extra session.

### 🗺️ LAYER 2 — Ecosystem Journey Map (own session(s), Sept–Oct, no deadline)

- Replace race bars with a stylized SVG map of Belize inside `dashboard/index.html`
- 7 ecosystem waypoints; 4 team markers positioned along the route by `beans ÷ journey goal`
- Arrival fact cards: hardcoded one-liner per ecosystem (Science reinforcement, e.g. "Red mangroves grip the mud with prop roots")
- Must work in all 4 themes and at 320px; SVG is inline (self-contained rule)
- **Zero data changes** — reads the same `/leaderboard` response. Pure visual upgrade; race bars remain as fallback until map approved
- Verification: side-by-side check that marker positions match bar percentages; mobile + theme pass

### 🔁 LAYER 3 — Ongoing lesson retrofits (incremental, no session needed)

- Every NEW lesson built from now on includes `vcSaveBeans()` calls as part of the lesson template (template update to be documented after 1.6 proves the pattern)
- Existing lessons retrofitted opportunistically, 2 lines per section
- New cycle option: teacher may reset bean locks by changing activity IDs suffix (e.g. `-c2`) when a new cycle's competition starts

### 🌟 LAYER 4 — Ideas parked for the future (not planned, just recorded)

- Group shuffle button on teacher dashboard
- Achievement badge expansion (badge per ecosystem reached, per subject milestone)
- Quest history / auto-suggest quest from weakest class LO
- Team markers as custom SVG animal icons instead of emoji

---

## 7. Cost & Risk Summary

| Item | Impact |
|---|---|
| OpenAI cost | **Zero change** — beans are rule-based, no AI calls |
| Sheets capacity | More Tab 2 rows (~1 per activity per student); still a tiny fraction of the 10M cell limit; archive yearly as already planned |
| Worker | One small read-only endpoint added |
| Risk to existing system | None — no existing page, test, or the passkey/AI systems are modified except one reference lesson (1.6), and that change is additive |
| Biggest effort item | The Layer 2 map — deliberately isolated so it cannot delay Layer 1 |

---

## 8. Approval Checklist (Edwin decides before build starts)

- [ ] Team names OK? (Jaguars / Toucans / Tapirs / Manatees)
- [ ] Bean values in Section 5 OK as starting economy?
- [ ] Class goal number for the first run (suggested: 2,000 🌱 per cycle)?
- [ ] Teacher dashboard protection: reuse passkey-style code, or username/password with a `role` column? *(still open from earlier — recommendation: a separate teacher passcode validated in the Worker, same pattern as the class passkey, since a full role system adds login complexity for one user)*
- [ ] Build order confirmed: 1.1 → 1.7 in sequence, Edwin tests live after each step (matches the established workflow)

---

*Once approved, this document should be added to the Claude Project alongside PROJECT-DOCS.md so every future session builds against the same plan.*
