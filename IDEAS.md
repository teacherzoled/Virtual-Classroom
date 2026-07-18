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

| 8 | Progressive lesson unlock — students must NOT see the whole year's lesson catalogue at once | July 17, 2026 | ⏳ Parked. Rule: only the **current/first week's lesson is active; all later weeks are LOCKED** — and this holds **even when logged OUT**, so the general public gets a "taste" of Week 1 only, with the rest shown locked. Needs a design decision on **what unlocks each later week**: teacher toggle (like the test-control idea #7), a date/schedule, or completion of the prior week. Applies to the Std5 Science lessons hub first (`/standard5/science/` Lessons tab), then any future subject. Distinct from the test gate (that's KV/Worker; lessons are public pages, so likely a lighter per-lesson "unlocked" flag). |
| 9 | Revise the 3 sample Std5 Science lessons (Wk1–3) — content + activities | July 17, 2026 | ⏳ Parked. The Week 1–3 lessons built July 16 are **samples**; Edwin wants specific changes to the content and activities (details to be given). Revisit before cloning the Week 1 engine for Week 4+ so the template reflects the changes. |

*Standing habit: when Edwin says "I just thought of something" — add it here FIRST, then keep working.*
