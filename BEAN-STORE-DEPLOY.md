# 🏪 Bean Store — Deploy Steps (your side)
*Companion to `BEAN-STORE-PLAN.md`. The website code (dashboard/teacher/edlo-utils.js) is already
built and committed. These three steps happen outside the repo — Sheet, Apps Script, Worker — and
must be done in this order before the store works live.*

---

## STEP 1 — Add the `Prizes` tab to the `VC-LMS` Sheet

Open the **VC-LMS** Google Sheet → add a new tab named exactly **`Prizes`** → paste these headers
into row 1, then the 9 prize rows below. (Copy the block, Paste into cell A1 — Sheets splits it into
columns automatically.)

```
prize_name	cost	category	stock	active
Sticker or fancy pencil	100	quick	120	YES
Choose your seat for a day	150	quick	20	YES
Pick your own group for group work	180	quick	30	YES
Sit with a friend for a whole week	360	medium	20	YES
Snack/juice from the shop	540	medium	30	YES
Homework pass (one homework)	750	medium	12	YES
Teacher's chair + desk for a morning	1200	big	3	YES
Certificate + note home to parents	1500	big	999	YES
Dashboard Hall of Fame — name + emoji for the year	2500	big	5	YES
```

Notes:
- **cost** = beans to redeem · **category** = `quick` / `medium` / `big` (controls the coloured
  grouping on the dashboard) · **stock** = how many are left (drops by 1 each redemption; the store
  greys the prize out at 0) · **active** = `YES` shows it, `NO` hides it without deleting the row.
- "Certificate + note home" uses **999** = effectively unlimited (your call). Change any number
  anytime; the change is live on the next page load.
- To restock later, just raise the `stock` number. To retire a prize, set `active` to `NO`.

---

## STEP 2 — Add two actions to the `VC-LMS Backend` Apps Script

Open the VC-LMS Sheet → **Extensions → Apps Script**. Paste the two functions below at the end of
the script, then wire them into your existing `doPost` router (the same `switch`/`if` block that
already routes `login`, `save-result`, `leaderboard`, `award-bonus`, etc.).

**2a. Add these two route cases** where your other actions are dispatched (match your existing
style — if your router reads `e.parameter.action` or a JSON `action`, use the same):

```javascript
    case 'prizes':       return jsonOut(getPrizes());
    case 'redeem-prize': return jsonOut(redeemPrize(body));
```

**2b. Paste these functions.** They assume the same helpers your script already uses
(`SpreadsheetApp.getActiveSpreadsheet()`, a `jsonOut()` JSON responder, and the `TEACHER_CODE`
Script Property you already check in `award-bonus`). Adjust the sheet/tab getters to match your
existing code if the names differ.

```javascript
/** Public: return active prizes for the store catalog. */
function getPrizes() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Prizes');
  if (!sh) return { ok: false, error: 'No Prizes tab' };
  var rows = sh.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var name = String(rows[i][0]).trim();
    if (!name) continue;
    if (String(rows[i][4]).trim().toUpperCase() !== 'YES') continue; // active only
    out.push({
      prize_name: name,
      cost:       Number(rows[i][1]) || 0,
      category:   String(rows[i][2]).trim().toLowerCase() || 'quick',
      stock:      Number(rows[i][3]) || 0
    });
  }
  return { ok: true, prizes: out };
}

/**
 * Teacher-gated: redeem a prize for a student.
 * body = { teacher_code, username, prize_name }
 * Server-side hard block: rejects if stock <= 0 or cost > balance.
 * On success: appends a `redeem` row to All Results (score = beans spent) and
 * decrements that prize's stock cell by 1.
 */
function redeemPrize(body) {
  var props = PropertiesService.getScriptProperties();
  if (String(body.teacher_code || '') !== String(props.getProperty('TEACHER_CODE') || '')) {
    return { ok: false, error: 'Wrong teacher code.' };
  }
  var username = String(body.username || '').trim();
  var prizeName = String(body.prize_name || '').trim();
  if (!username || !prizeName) return { ok: false, error: 'Missing student or prize.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- look up the prize (cost + stock) from the Prizes tab ---
  var pSh = ss.getSheetByName('Prizes');
  var pRows = pSh.getDataRange().getValues();
  var pIndex = -1, cost = 0, stock = 0;
  for (var i = 1; i < pRows.length; i++) {
    if (String(pRows[i][0]).trim() === prizeName) {
      pIndex = i; cost = Number(pRows[i][1]) || 0; stock = Number(pRows[i][3]) || 0; break;
    }
  }
  if (pIndex === -1) return { ok: false, error: 'Prize not found.' };
  if (stock <= 0)   return { ok: false, error: 'Out of stock.' };

  // --- compute the student's balance from All Results (earned - spent) ---
  var rSh = ss.getSheetByName('All Results');
  var rRows = rSh.getDataRange().getValues();
  // Column indexes match your Tab 2 layout: B=username(1), F=activity_type(5), H=score(7)
  var earned = 0, spent = 0, fullName = '';
  for (var j = 1; j < rRows.length; j++) {
    if (String(rRows[j][1]).trim() !== username) continue;
    if (!fullName && rRows[j][2]) fullName = String(rRows[j][2]);
    var type = String(rRows[j][5]).trim();
    var score = Number(rRows[j][7]) || 0;
    if (type === 'lesson' || type === 'bonus') earned += score;
    else if (type === 'redeem') spent += score;
  }
  var balance = earned - spent;
  if (cost > balance) {
    return { ok: false, error: 'Not enough beans (has ' + balance + ', needs ' + cost + ').' };
  }

  // --- look up the student's full name if we didn't see a result row for them ---
  if (!fullName) {
    var sSh = ss.getSheetByName('Students');
    var sRows = sSh.getDataRange().getValues();
    for (var k = 1; k < sRows.length; k++) {
      if (String(sRows[k][0]).trim() === username) { fullName = String(sRows[k][2]) || username; break; }
    }
  }

  // --- append the redeem row (score = beans spent; subject = Bean Store) ---
  // Column order must match your All Results header:
  // A timestamp | B username | C student_name | D subject | E lo_code |
  // F activity_type | G activity_name | H score | I max_score | J percent | K ai_feedback
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  rSh.appendRow([stamp, username, fullName || username, 'Bean Store', '',
                 'redeem', prizeName, cost, cost, 0, '']);

  // --- decrement stock (column D = index 4, 1-based) ---
  pSh.getRange(pIndex + 1, 4).setValue(stock - 1);

  return { ok: true, to: fullName || username, spent: cost, newBalance: balance - cost, newStock: stock - 1 };
}
```

> ⚠️ **Check the column indexes** against your real `All Results` and `Students` tabs. The code
> above uses the layout documented in `PROJECT-DOCS.md` (B=username, C=student_name, F=activity_type,
> H=score). If your columns differ, adjust the numbers. Test `redeemPrize` once from the Apps Script
> editor on `test.student` before going live.

After pasting: **Deploy → Manage deployments → edit → deploy a new version** (same as when you added
`award-bonus`), so the Worker reaches the new code.

---

## ⚠️ CRITICAL CHECK — the Group Totals formula must ignore `redeem` rows

The team race and class goal read from the **Group Totals** tab's SUMPRODUCT bean formula. The whole
design depends on that formula counting **only `lesson` and `bonus`** rows. Open Group Totals and look
at the formula in **B2**:

- ✅ **Safe** if it already filters activity_type to lesson/bonus, e.g. it contains something like
  `(All Results!$F$2:$F = "lesson") + (All Results!$F$2:$F = "bonus")`. A new `redeem` row is then
  ignored automatically — nothing to change.
- ❌ **Must fix** if it sums every score for the group regardless of type (no activity_type filter).
  In that case a `redeem` row (positive score) would *increase* the team total — the opposite of what
  we want. Fix by adding a type filter so only lesson+bonus count. Send me the exact B2 formula and
  I'll rewrite it for you.

Do this check **before** the first live redemption. (The website code is already correct — every
bean sum in the dashboard and teacher pages whitelists lesson/bonus, so `redeem` never touches the
race there. This caveat is only about the Sheet formula, which lives outside the repo.)

---

## STEP 3 — Add two routes to the `edlo-lms` Worker

Open `dash.cloudflare.com` → Workers → **edlo-lms** → edit. In the `ROUTES` map (where
`/award-bonus`, `/leaderboard` etc. are listed), add:

```javascript
  '/prizes':       'prizes',
  '/redeem-prize': 'redeem-prize',
```

(Use the exact same right-hand action strings you used in the Apps Script router in Step 2a.) Then
**Deploy**. That's the only Worker change — it stays a thin proxy.

---

## STEP 4 — Verify live

1. In the browser console on your site: `fetch('https://edlo-lms.smartstandardsix.workers.dev/prizes',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.json()).then(console.log)` → should log all 9 prizes.
2. Open `/teacher/`, enter the teacher code → the new **Redeem a Prize** panel appears with the student and prize pickers.
3. Award `test.student` some beans, then redeem a cheap prize for them → success note, stock drops.
4. Try to redeem a prize that costs more than the student's balance → the Redeem button stays disabled with the reason shown.
5. Open `/dashboard/` as `test.student` → the **🏪 Bean Store** panel shows the spendable balance and the prize cards; the one just redeemed reduced the balance, and the **team race bars did not change**.
6. `git add -A → commit → push` the three code files (already done by Claude if you approved) and hard-refresh.
