/**
 * ═══════════════════════════════════════════════════════════════
 *  Mr. EdLo's Virtual Classroom — LMS Backend (Google Apps Script)
 *  Handles: login, save-result, progress, leaderboard,
 *           teacher-data, award-bonus, prizes, redeem-prize
 *           (called via edlo-lms Worker)
 *
 *  ⚠️ LOCAL MASTER COPY — this file mirrors the code deployed in the
 *  "VC-LMS Backend" Apps Script (attached to the VC-LMS Google Sheet).
 *  It is NOT executed by GitHub Pages; it is the source of truth so future
 *  edits start from here and produce a complete file to paste back.
 *  When you change the live Apps Script, update this file too (and vice versa).
 *  Last synced: July 18, 2026 (added Bean Store: prizes + redeem-prize).
 *
 *  Sheet tabs used:
 *    Tab 1 "Students"     → username | password | full_name | first_name | class_id | active | group_id
 *    Tab 2 "All Results"  → timestamp | username | student_name | subject | lo_code |
 *                           activity_type | activity_name | score | max_score | percent | ai_feedback
 *    Tab 5 "Group Totals" → group | beans (rows 2–5) · class_total (B7) · class_goal (B8)
 *    Tab   "Prizes"       → prize_name | cost | category | stock | active
 *
 *  Script Properties required (File > Project Settings > Script Properties):
 *    API_KEY        → shared secret; must match the Worker's APPS_SCRIPT_KEY
 *    SESSION_SECRET → any long random string; signs session tokens
 *    TEACHER_CODE   → teacher dashboard passcode (added July 2026)
 * ═══════════════════════════════════════════════════════════════
 */

var STUDENTS_TAB = 'Students';
var RESULTS_TAB  = 'All Results';
var GROUPS_TAB   = 'Group Totals';
var PRIZES_TAB   = 'Prizes';
var SESSION_DAYS = 30; // how long a login lasts

// ─────────────────────────────────────────────
// ENTRY POINT — the Worker always POSTs JSON:
// { key: API_KEY, action: '...', ...data }
// ─────────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // 1. Only the Worker knows the API key
    var apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
    if (!apiKey || body.key !== apiKey) {
      return reply({ ok: false, error: 'Unauthorized' });
    }

    // 2. Route by action
    if (body.action === 'login')         return reply(handleLogin(body));
    if (body.action === 'save-result')   return reply(handleSaveResult(body));
    if (body.action === 'progress')      return reply(handleProgress(body));
    if (body.action === 'leaderboard')   return reply(handleLeaderboard(body));
    if (body.action === 'teacher-data')  return reply(handleTeacherData(body));
    if (body.action === 'award-bonus')   return reply(handleAwardBonus(body));
    if (body.action === 'prizes')        return reply(handleGetPrizes(body));
    if (body.action === 'redeem-prize')  return reply(handleRedeemPrize(body));
    if (body.action === 'ping')          return reply({ ok: true, message: 'LMS backend is alive' });

    return reply({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return reply({ ok: false, error: 'Server error: ' + err.message });
  }
}

// ─────────────────────────────────────────────
// LOGIN — { action:'login', username, password }
// ─────────────────────────────────────────────
function handleLogin(body) {
  var username = String(body.username || '').trim().toLowerCase();
  var password = String(body.password || '');
  if (!username || !password) return { ok: false, error: 'Missing username or password' };

  var student = findStudent(username);
  if (!student) return { ok: false, error: 'Wrong username or password' };

  if (String(student.active).toUpperCase() !== 'YES') {
    return { ok: false, error: 'This account is not active. Please see Mr. EdLo.' };
  }

  if (hashPassword(username, password) !== student.password) {
    return { ok: false, error: 'Wrong username or password' };
  }

  var expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  var token = makeToken(username, expires);

  return {
    ok: true,
    token: token,
    username: username,
    full_name: student.full_name,
    first_name: student.first_name,
    class_id: student.class_id,
    expires: expires
  };
}

// ─────────────────────────────────────────────
// SAVE RESULT — { action:'save-result', token, subject, lo_code,
//                 activity_type, activity_name, score, max_score, ai_feedback }
// ─────────────────────────────────────────────
function handleSaveResult(body) {
  var session = checkToken(body.token);
  if (!session.ok) return session;

  var student = findStudent(session.username);
  if (!student || String(student.active).toUpperCase() !== 'YES') {
    return { ok: false, error: 'Account not active' };
  }

  var score    = Number(body.score)     || 0;
  var maxScore = Number(body.max_score) || 0;
  var percent  = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RESULTS_TAB);
  sheet.appendRow([
    Utilities.formatDate(new Date(), 'America/Belize', 'yyyy-MM-dd HH:mm'),
    session.username,
    student.full_name,
    String(body.subject || ''),
    String(body.lo_code || ''),
    String(body.activity_type || ''),
    String(body.activity_name || ''),
    score,
    maxScore,
    percent,
    String(body.ai_feedback || '')
  ]);

  return { ok: true, percent: percent };
}

// ─────────────────────────────────────────────
// PROGRESS — { action:'progress', token }
// Returns every Tab 2 row belonging to this student
// ─────────────────────────────────────────────
function handleProgress(body) {
  var session = checkToken(body.token);
  if (!session.ok) return session;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RESULTS_TAB);
  var data = sheet.getDataRange().getValues(); // row 0 = headers
  var results = [];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase() === session.username) {
      results.push({
        timestamp:     String(data[i][0]),
        subject:       String(data[i][3]),
        lo_code:       String(data[i][4]),
        activity_type: String(data[i][5]),
        activity_name: String(data[i][6]),
        score:         Number(data[i][7]),
        max_score:     Number(data[i][8]),
        percent:       Number(data[i][9]),
        ai_feedback:   String(data[i][10] || '')
      });
    }
  }

  return { ok: true, username: session.username, results: results };
}

// ═══════════════ DASHBOARD ADDITIONS (July 2026) ═══════════════

// LEADERBOARD — { action:'leaderboard', token? } — public class data, no login needed
function handleLeaderboard(body) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GROUPS_TAB);
  if (!sheet) return { ok: false, error: 'Group Totals tab not found' };
  var data = sheet.getRange(1, 1, 8, 2).getValues();
  var groups = [];
  for (var i = 1; i <= 4; i++) {
    groups.push({ group: String(data[i][0]), beans: Number(data[i][1]) || 0 });
  }
  var out = {
    ok: true,
    groups: groups,
    class_total: Number(data[6][1]) || 0,
    class_goal:  Number(data[7][1]) || 0
  };
  if (body.token) {
    var session = checkToken(body.token);
    if (session.ok) {
      var student = findStudent(session.username);
      if (student) out.my_group = student.group_id || '';
    }
  }
  return out;
}

// TEACHER GATE — passcode checked server-side, like the class passkey
function checkTeacher(body) {
  var code = PropertiesService.getScriptProperties().getProperty('TEACHER_CODE');
  if (!code) return { ok: false, error: 'TEACHER_CODE not set' };
  if (String(body.teacher_code || '') !== code) return { ok: false, error: 'Wrong teacher code' };
  return { ok: true };
}

// TEACHER DATA — { action:'teacher-data', teacher_code }
function handleTeacherData(body) {
  var gate = checkTeacher(body);
  if (!gate.ok) return gate;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sData = ss.getSheetByName(STUDENTS_TAB).getDataRange().getValues();
  var students = [];
  for (var i = 1; i < sData.length; i++) {
    if (!String(sData[i][0]).trim()) continue;
    students.push({
      username:   String(sData[i][0]).trim().toLowerCase(),
      full_name:  String(sData[i][2]),
      first_name: String(sData[i][3]),
      class_id:   String(sData[i][4]),
      active:     String(sData[i][5]),
      group_id:   String(sData[i][6] || '')
    });
  }
  var rData = ss.getSheetByName(RESULTS_TAB).getDataRange().getValues();
  var results = [];
  for (var j = 1; j < rData.length; j++) {
    results.push({
      timestamp:     String(rData[j][0]),
      username:      String(rData[j][1]).toLowerCase(),
      subject:       String(rData[j][3]),
      lo_code:       String(rData[j][4]),
      activity_type: String(rData[j][5]),
      activity_name: String(rData[j][6]),
      score:         Number(rData[j][7]),
      max_score:     Number(rData[j][8]),
      percent:       Number(rData[j][9])
    });
  }
  return { ok: true, students: students, results: results };
}

// AWARD BONUS — { action:'award-bonus', teacher_code, username, beans, reason }
function handleAwardBonus(body) {
  var gate = checkTeacher(body);
  if (!gate.ok) return gate;
  var username = String(body.username || '').trim().toLowerCase();
  var beans = Math.round(Number(body.beans) || 0);
  if (!username || beans <= 0) return { ok: false, error: 'Need a username and a positive bean amount' };
  if (beans > 100) return { ok: false, error: 'Maximum 100 beans per bonus' };
  var student = findStudent(username);
  if (!student) return { ok: false, error: 'No student named ' + username };
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RESULTS_TAB);
  sheet.appendRow([
    Utilities.formatDate(new Date(), 'America/Belize', 'yyyy-MM-dd HH:mm'),
    username, student.full_name, 'General', '', 'bonus',
    String(body.reason || 'Teacher bonus'), beans, beans, 100, ''
  ]);
  return { ok: true, awarded: beans, to: username };
}

// ═══════════════ BEAN STORE (July 2026) ═══════════════

// PRIZES — { action:'prizes' } — public catalog, active prizes only
function handleGetPrizes(body) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PRIZES_TAB);
  if (!sheet) return { ok: false, error: 'Prizes tab not found' };
  var data = sheet.getDataRange().getValues();
  var prizes = [];
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0]).trim();
    if (!name) continue;
    if (String(data[i][4]).trim().toUpperCase() !== 'YES') continue; // active only
    prizes.push({
      prize_name: name,
      cost:       Number(data[i][1]) || 0,
      category:   String(data[i][2]).trim().toLowerCase() || 'quick',
      stock:      Number(data[i][3]) || 0
    });
  }
  return { ok: true, prizes: prizes };
}

// REDEEM PRIZE — { action:'redeem-prize', teacher_code, username, prize_name }
// Hard block: rejects if stock <= 0 or cost > balance (earned lesson+bonus − spent redeem).
// On success: appends a 'redeem' row (score = beans spent) and decrements that prize's stock.
function handleRedeemPrize(body) {
  var gate = checkTeacher(body);
  if (!gate.ok) return gate;

  var username  = String(body.username || '').trim().toLowerCase();
  var prizeName = String(body.prize_name || '').trim();
  if (!username || !prizeName) return { ok: false, error: 'Need a student and a prize' };

  var student = findStudent(username);
  if (!student) return { ok: false, error: 'No student named ' + username };

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Look up the prize (cost + stock) from the Prizes tab
  var pSheet = ss.getSheetByName(PRIZES_TAB);
  if (!pSheet) return { ok: false, error: 'Prizes tab not found' };
  var pData = pSheet.getDataRange().getValues();
  var pRow = -1, cost = 0, stock = 0;
  for (var i = 1; i < pData.length; i++) {
    if (String(pData[i][0]).trim() === prizeName) {
      pRow = i; cost = Number(pData[i][1]) || 0; stock = Number(pData[i][3]) || 0; break;
    }
  }
  if (pRow === -1) return { ok: false, error: 'Prize not found: ' + prizeName };
  if (stock <= 0)  return { ok: false, error: 'Out of stock' };

  // Compute the student's balance from All Results (earned − spent)
  var rSheet = ss.getSheetByName(RESULTS_TAB);
  var rData = rSheet.getDataRange().getValues();
  var earned = 0, spent = 0;
  for (var j = 1; j < rData.length; j++) {
    if (String(rData[j][1]).trim().toLowerCase() !== username) continue;
    var type = String(rData[j][5]).trim();
    var sc = Number(rData[j][7]) || 0;
    if (type === 'lesson' || type === 'bonus') earned += sc;
    else if (type === 'redeem') spent += sc;
  }
  var balance = earned - spent;
  if (cost > balance) {
    return { ok: false, error: 'Not enough beans (has ' + balance + ', needs ' + cost + ')' };
  }

  // Append the redeem row (score = beans spent; subject = Bean Store)
  rSheet.appendRow([
    Utilities.formatDate(new Date(), 'America/Belize', 'yyyy-MM-dd HH:mm'),
    username, student.full_name, 'Bean Store', '',
    'redeem', prizeName, cost, cost, 0, ''
  ]);

  // Decrement stock (column D = 4)
  pSheet.getRange(pRow + 1, 4).setValue(stock - 1);

  return { ok: true, to: student.full_name, spent: cost, newBalance: balance - cost, newStock: stock - 1 };
}

// ─────────────────────────────────────────────
// SESSION TOKENS
// Format: base64url(username|expires) + '.' + signature
// ─────────────────────────────────────────────
function makeToken(username, expires) {
  var payload = username + '|' + expires;
  var encoded = Utilities.base64EncodeWebSafe(payload);
  return encoded + '.' + sign(payload);
}

function checkToken(token) {
  if (!token) return { ok: false, error: 'Not logged in' };
  var parts = String(token).split('.');
  if (parts.length !== 2) return { ok: false, error: 'Invalid session' };

  var payload;
  try {
    payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
  } catch (e) {
    return { ok: false, error: 'Invalid session' };
  }

  if (sign(payload) !== parts[1]) return { ok: false, error: 'Invalid session' };

  var pieces = payload.split('|');
  var username = pieces[0];
  var expires  = Number(pieces[1]);
  if (Date.now() > expires) return { ok: false, error: 'Session expired. Please log in again.' };

  return { ok: true, username: username };
}

function sign(payload) {
  var secret = PropertiesService.getScriptProperties().getProperty('SESSION_SECRET');
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, payload + '::' + secret,
    Utilities.Charset.UTF_8
  );
  return digest.map(function (b) {
    var v = (b + 256) % 256;
    return (v < 16 ? '0' : '') + v.toString(16);
  }).join('');
}

// ─────────────────────────────────────────────
// PASSWORDS
// Stored in column B as: sha256:<hex of username::password::SESSION_SECRET>
// ─────────────────────────────────────────────
function hashPassword(username, password) {
  var secret = PropertiesService.getScriptProperties().getProperty('SESSION_SECRET');
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    username + '::' + password + '::' + secret,
    Utilities.Charset.UTF_8
  );
  return 'sha256:' + digest.map(function (b) {
    var v = (b + 256) % 256;
    return (v < 16 ? '0' : '') + v.toString(16);
  }).join('');
}

/**
 * TEACHER UTILITY — run manually from the Apps Script editor.
 * Type plain-text passwords in column B of the Students tab,
 * then run this once. Every plain password is replaced by its hash.
 * Already-hashed rows (starting with "sha256:") are skipped.
 */
function hashPlainPasswords() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STUDENTS_TAB);
  var data = sheet.getDataRange().getValues();
  var changed = 0;

  for (var i = 1; i < data.length; i++) {
    var username = String(data[i][0]).trim().toLowerCase();
    var pwd = String(data[i][1]);
    if (username && pwd && pwd.indexOf('sha256:') !== 0) {
      sheet.getRange(i + 1, 2).setValue(hashPassword(username, pwd));
      changed++;
    }
  }
  Logger.log(changed + ' password(s) hashed.');
}

/**
 * TEACHER UTILITY — run ONCE from the Apps Script editor on a blank spreadsheet.
 * Builds all four tabs with headers, formulas, formatting, and a test student.
 * Safe to re-run: existing tabs are kept, only missing pieces are added.
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Tab 1: Students ──
  var students = ss.getSheetByName(STUDENTS_TAB) || ss.insertSheet(STUDENTS_TAB, 0);
  if (students.getLastRow() === 0) {
    students.appendRow(['username', 'password', 'full_name', 'first_name', 'class_id', 'active']);
    students.appendRow(['test.student', 'test123', 'Test Student', 'Test', 'Std6-2026', 'YES']);
    students.getRange('1:1').setFontWeight('bold').setBackground('#4DABF7').setFontColor('#ffffff');
    students.setFrozenRows(1);
  }

  // ── Tab 2: All Results ──
  var results = ss.getSheetByName(RESULTS_TAB) || ss.insertSheet(RESULTS_TAB, 1);
  if (results.getLastRow() === 0) {
    results.appendRow(['timestamp', 'username', 'student_name', 'subject', 'lo_code',
                       'activity_type', 'activity_name', 'score', 'max_score', 'percent', 'ai_feedback']);
    results.getRange('1:1').setFontWeight('bold').setBackground('#20C997').setFontColor('#ffffff');
    results.setFrozenRows(1);
  }

  // ── Tab 3: Per Student Progress (formula-only) ──
  var perStudent = ss.getSheetByName('Per Student Progress') || ss.insertSheet('Per Student Progress', 2);
  if (perStudent.getRange('A1').isBlank()) {
    perStudent.getRange('A1').setFormula(
      "=QUERY('All Results'!A:J, \"select B, C, D, count(G), avg(J) where B is not null " +
      "group by B, C, D label count(G) 'activities', avg(J) 'average %'\", 1)"
    );
  }

  // ── Tab 4: Class Summary (formula-only) ──
  var summary = ss.getSheetByName('Class Summary') || ss.insertSheet('Class Summary', 3);
  if (summary.getRange('A1').isBlank()) {
    summary.getRange('A1').setFormula(
      "=QUERY('All Results'!A:J, \"select D, E, count(G), avg(J) where D is not null " +
      "group by D, E label count(G) 'submissions', avg(J) 'class average %'\", 1)"
    );
  }

  // ── Remove the default empty sheet if still present ──
  var extra = ss.getSheetByName('Sheet1');
  if (extra && ss.getSheets().length > 4) ss.deleteSheet(extra);

  Logger.log('Sheet setup complete: 4 tabs ready. Now set Script Properties, then run hashPlainPasswords.');
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function findStudent(username) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STUDENTS_TAB);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === username) {
      return {
        username:   username,
        password:   String(data[i][1]),
        full_name:  String(data[i][2]),
        first_name: String(data[i][3]),
        class_id:   String(data[i][4]),
        active:     String(data[i][5]),
        group_id:   String(data[i][6] || '')
      };
    }
  }
  return null;
}

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
