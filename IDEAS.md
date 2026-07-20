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

| 8 | Progressive lesson unlock — students must NOT see the whole year's lesson catalogue at once | July 17, 2026 | ✅ **SHIPPED July 19, 2026** — verified live, all six test steps passed. **Decision: teacher toggle** (rejected dates = site races ahead of a class that falls behind; rejected prior-week completion = conflicts with the Science "no saved progress" rule AND never opens for logged-out visitors). **Lessons stay PUBLIC — no login gate; the lock is for PACING, not protection** (locked cards advertise the year's scope to visiting parents; a login wall would tax Edwin's own device-switching students for a non-existent threat; test answers are already gated behind KV+Worker). Login changes what a student EARNS, not what he or she SEES. **Storage: ONE INTEGER per subject** — `Settings` tab in `VC-LMS`, rows `<subject>-released-week`; a week is open when `N >= its week number`, so the state cannot go invalid the way 30 toggles could; reset all to 1 for a new class. Backend written **subject-generic once for all six subjects** — a new hub needs a Settings row + ~15 lines of wiring, never a backend change; **no row = subject not using locking**. Actions: `lesson-locks` (PUBLIC read, also answers GET; only `-released-week` keys are exposed so other Settings stay private) + `set-lesson-locks` (teacher-gated, accepts `{subject,week}` or `{reset_all:true}`). Hub ships Weeks 2+ locked in the HTML with the target parked in `data-href` (fails CLOSED — never flashes the year); Week 1 is a plain `href` so it works with JS off. Lesson-page guard closes the bookmark path but is a **repaint, not a gate** (Pages serves the file, then the guard overwrites `document.body` — view-source or JS-off defeats it; acceptable, real enforcement would break the self-contained-HTML model). Guard fails OPEN deliberately, unlike the hub — blocking a real student on dropping classroom wifi is worse than a curious one reading ahead. `/teacher/` → **🔓 Release Lessons** panel + **Reset ALL to Week 1**. Both JS blocks marked **LIFT-OUT BLOCK** for the #10 refactor. Full detail in `PROJECT-DOCS.md` Take-off Point. |
| 9 | Revise the 3 sample Std5 Science lessons (Wk1–3) — content + activities | July 17, 2026 | ⏳ Parked. The Week 1–3 lessons built July 16 are **samples**; Edwin wants specific changes to the content and activities (details to be given). Revisit before cloning the Week 1 engine for Week 4+ so the template reflects the changes. |

| 10 | Refactor shared CSS + JS out of the self-contained pages into cached shared files | July 19, 2026 | ⏳ Parked — **own dedicated session, not bolted onto a feature build.** Problem measured July 19: 81 HTML files / 3.6 MB, and **31 files each carry their own copy of the theme system** (the Std5 Science hub's `<style>` block alone is 473 lines). One theme-colour change = 31 edits; the "Find and replace across all files" section in `PROJECT-DOCS.md` is the symptom. Gets worse with every new subject hub and every Week 4–30 lesson. **Real payoff is caching, not raw speed** — inline is actually faster on a first visit (one request, no extra round trip); the win is repeat visits across many pages, which is exactly this site (students, many pages, a school year, phones on uneven connections). **Start the session by deciding the fate of `js/main.js` + `js/subject-page.js`** (April 2026, predate the self-contained convention, look abandoned) — revive or delete, because a half-used shared-JS folder is its own confusion. ⚠️ Touches every page on a LIVE site (LMS, bean store, 16 gated tests, passkey, themes, zoom) — needs a page-by-page verification pass. Note: this REVERSES the current documented convention ("all pages fully self-contained"), whose original rationale was that Edwin could edit any file without deep CSS/JS knowledge — weaker now that Claude Code handles bulk edits. Update the Design System section of `PROJECT-DOCS.md` when it ships. |

*Standing habit: when Edwin says "I just thought of something" — add it here FIRST, then keep working.*
