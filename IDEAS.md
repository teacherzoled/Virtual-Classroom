# 💡 Ideas Parking Lot — Mr. EdLo's Virtual Classroom

Ideas Edwin thinks of mid-session get written HERE immediately so they are never lost.
Anyone (Edwin or Claude) may add a row; only Edwin decides when an idea gets built.
When an idea ships, mark it ✅ and note where it lives.

| # | Idea | Noted | Status |
|---|---|---|---|
| 1 | Login button on the home page so students can log in easily | July 16, 2026 | ✅ Shipped July 16 — teal 🔑 button in site header, swaps to name chip when logged in |
| 2 | Greet logged-in students by name in the welcome banners | July 16, 2026 | ✅ Shipped July 16 — home page + Std5 hub (`id="welcomeName"` pattern for future hubs) |
| 3 | A Standard 5 student who logs in should see Standard 6 LOCKED (and vice versa) | July 16, 2026 | ✅ Soft lock shipped July 16 — grade picker locks the other grade's card (greyed, 🔒 chip, link removed). ⏳ HARD enforcement (blocking direct URLs to the other grade's pages) belongs to the login-gate retrofit session — decide there whether hubs check `class_id`. |
| 4 | Dashboard gamification extras (group shuffle button, badge expansion, quest history, SVG team markers) | July 16, 2026 | ⏳ Parked — recorded as Layer 4 in `DASHBOARD-GAMIFICATION-PLAN.md` |
| 5 | Class goal must grow as more subjects earn beans (all-subject lessons will skyrocket totals) | July 17, 2026 | ⏳ Convention agreed: after 2 real weeks of school, read the class total on `/teacher/`, multiply weekly rate × cycle weeks, set B8 slightly above — retune per cycle and when a new subject's lessons launch. One cell (Group Totals!B8), no code. |
| 6 | 🏪 Bean Store — students cash accumulated beans for prizes (from daughter's pandemic online school) | July 17, 2026 | ✅ SHIPPED July 18, 2026 — website code built (`/dashboard/` Store panel + spendable balance; `/teacher/` Redeem panel with hard block on cost>balance / stock=0; `vcGetPrizes()` in `edlo-utils.js`). Backend steps for Edwin in `BEAN-STORE-DEPLOY.md` (add Prizes tab, 2 Apps Script actions, 2 Worker routes). Balance = earned − spent; `redeem` rows never touch team race/class goal. Plan: `BEAN-STORE-PLAN.md`. Original v1 design agreed: Prizes tab in Sheet (name/cost/stock, Edwin edits) · store panel + spendable balance on `/dashboard/` · Redeem form on `/teacher/` (twin of bonus awarder, writes `redeem` rows) · redemption happens in class, no student purchase button. Key rule: spending NEVER lowers the team race or class goal (they count earned `lesson`+`bonus` rows only); balance = earned − spent. **PRIZE CATALOG FINALIZED by Edwin (July 17, 2026):** |

### 🏪 Bean Store — Official Prize Catalog (Edwin's final list, July 17, 2026)

**🟢 Quick wins**
| Prize | 🌱 Cost |
|---|---|
| Sticker or fancy pencil | 100 |
| Choose your seat for a day | 150 |
| Pick your own group for group work | 180 |

**🟡 Medium saves**
| Prize | 🌱 Cost |
|---|---|
| Sit with a friend for a whole week | 360 |
| Snack/juice from the shop | 540 |
| Homework pass (one homework) | 750 |

**🔴 Big saves**
| Prize | 🌱 Cost |
|---|---|
| Teacher's chair + desk for a morning | 1200 |
| Certificate + note home to parents | 1500 |
| ⭐ Dashboard Hall of Fame — name + chosen emoji on the site for the year | 2500 |

*Open decision for the store session: stock caps (suggested: homework pass limited to ~3 per cycle; Edwin decides caps per prize when filling the Prizes tab).*

| 7 | Open/close a test from the `/teacher/` dashboard instead of hand-editing the KV `open` flag in Cloudflare | July 17, 2026 | ⏳ Parked. **"Test Control" panel** on `/teacher/`: list every test with its current status + an Open/Closed toggle; one click flips the flag. Design: add ONE teacher-only admin route to the `edlo-gemini` Worker that (a) checks a **teacher admin key** (separate from the student passkey; entered once, kept in the teacher session like `vc-teacher-code`, checked server-side so students can't flip tests) and (b) does a KV `.put()` to set `open:true/false` on that test's entry. ⚠️ Touches the SHARED `edlo-gemini` Worker (grades every live test) — add the route carefully and test against one testId first, like the gate build. **Optional extra:** scheduled auto open/close (opens at a set time, closes itself after) so a test is never left open by accident. |

| 8 | Progressive lesson unlock — students must NOT see the whole year's lesson catalogue at once | July 17, 2026 | ✅ **SHIPPED July 19, 2026** — verified live, all six test steps passed. **Decision: teacher toggle** (rejected dates = site races ahead of a class that falls behind; rejected prior-week completion = conflicts with the Science "no saved progress" rule AND never opens for logged-out visitors). **Lessons stay PUBLIC — no login gate; the lock is for PACING, not protection** (locked cards advertise the year's scope to visiting parents; a login wall would tax Edwin's own device-switching students for a non-existent threat; test answers are already gated behind KV+Worker). Login changes what a student EARNS, not what he or she SEES. **Storage: ONE INTEGER per subject** — `Settings` tab in `VC-LMS`, rows `<subject>-released-week`; a week is open when `N >= its week number`, so the state cannot go invalid the way 30 toggles could; reset all to 1 for a new class. Backend written **subject-generic once for all six subjects** — a new hub needs a Settings row + ~15 lines of wiring, never a backend change; **no row = subject not using locking**. Actions: `lesson-locks` (PUBLIC read, also answers GET; only `-released-week` keys are exposed so other Settings stay private) + `set-lesson-locks` (teacher-gated, accepts `{subject,week}` or `{reset_all:true}`). Hub ships Weeks 2+ locked in the HTML with the target parked in `data-href` (fails CLOSED — never flashes the year); Week 1 is a plain `href` so it works with JS off. Lesson-page guard closes the bookmark path but is a **repaint, not a gate** (Pages serves the file, then the guard overwrites `document.body` — view-source or JS-off defeats it; acceptable, real enforcement would break the self-contained-HTML model). Guard fails OPEN deliberately, unlike the hub — blocking a real student on dropping classroom wifi is worse than a curious one reading ahead. `/teacher/` → **🔓 Release Lessons** panel + **Reset ALL to Week 1**. Both JS blocks marked **LIFT-OUT BLOCK** — note #10 CLOSED July 20, 2026 without converting existing pages, so these markers are now dormant: they document where the shared JS *would* go, but no one is coming to lift them out. Full detail in `PROJECT-DOCS.md` Take-off Point. |
| 9 | Revise the 3 sample Std5 Science lessons (Wk1–3) — content + activities | July 17, 2026 | ⏳ Parked. The Week 1–3 lessons built July 16 are **samples**; Edwin wants specific changes to the content and activities (details to be given). Revisit before cloning the Week 1 engine for Week 4+ so the template reflects the changes. |

| 10 | Refactor shared CSS + JS out of the self-contained pages into cached shared files | July 19, 2026 | ✅ **CLOSED July 20, 2026 — `vc-theme.css` exists for FUTURE pages; NO existing page was changed.** **Standing rule: every EXISTING page stays exactly as built; every NEW page links `/vc-theme.css`.** No exceptions. **Do NOT convert existing pages — that was tried and deliberately undone.** **What happened:** the 16 Std5 Science assessments were converted and mechanically verified (no rule lost, none gained, identical cascade order, inline JS byte-identical), then **REVERTED at Edwin's decision** — all 16 are hash-confirmed byte-identical to commit `faf7ec3`. **Why:** they are live graded assessments a student sits once, under time, with a KV gate and PDF report. The checks proved the CSS equivalent but nobody had yet seen a question paper render with the gate OPEN, and the downside of being wrong landed on students mid-test. Not worth it for pages that already work. **Also done:** the abandoned April 2026 `js/` folder deleted (15 files — `main.js`, `subject-page.js`, 10 orphaned `js/modules/` pages; nothing live linked them), and `.gitattributes` added to stop Windows CRLF reporting 42 phantom-modified files. **The file itself:** `/vc-theme.css`, 28 KB, the 172 rules that were byte-identical across those 16 pages — 4 theme variable sets, fonts, layout, cards, buttons, question/option/results components, modal, footer, animations. **Measured while converted (why it is worth using going forward):** 1139 KB → 711 KB inline; a student opening all 16 downloads 738 KB instead of 1139 KB — **35% less**, since the 28 KB core caches once. **⚠️ Two gotchas for whoever builds the first page with it:** (1) its accent is **Science teal**, baked into 16 CSS variables — all are var definitions, none are plain rules, so a Spanish/Math/Scripture page recolours by overriding those vars inline (recipe in `PROJECT-DOCS.md` → Design System); (2) most of the file styles the question paper, options, results, modal and feedback — **none of which render while a test's KV gate is closed**, so check the first page with the gate OPEN. **Accepted trade-off:** while both styles coexist, a site-wide theme colour change means editing `vc-theme.css` AND every self-contained page. **Zero risk to existing pages:** CSS reaches only pages that link it, and as of July 20, 2026 none do — the file is inert until a new page opts in. |

*Standing habit: when Edwin says "I just thought of something" — add it here FIRST, then keep working.*
