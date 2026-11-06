/**
 * ═══════════════════════════════════════════════════════════════
 *  Computer Club Backend — Google Apps Script (Nov 6, 2026)
 *
 *  ⚠️ LOCAL MASTER COPY — mirrors the Apps Script attached to the
 *  "Computer Club Records" Google Sheet (Extensions → Apps Script).
 *  NOT run by GitHub Pages. When you change the live script, update
 *  this file too (and vice versa). No secrets live in this file.
 *
 *  Separate from VC-LMS on purpose: a club problem can never touch
 *  class logins, grading or lessons.
 *
 *  Browser → Worker "computer-club-records" (adds the secret key)
 *          → this script (all logic) → the Sheet
 *
 *  Script Properties (Project Settings → Script Properties):
 *    API_KEY        → shared secret; must match the Worker's APPS_SCRIPT_KEY
 *    SESSION_SECRET → any long random string; signs sign-in tokens and
 *                     scrambles PINs. ⚠️ NEVER change it after PINs are hashed.
 *    TEACHER_CODE   → the code that opens /computer-club/teacher/
 *
 *  Settings tab (typed by the teacher, never committed — the repo is public):
 *    club_code · week · mission · typingclub_url (the TypingClub class sign-up link,
 *    handed only to signed-in members)
 *
 *  Actions (all POST bodies carry { key, action, ... }):
 *    ping · status · roster · signin · save-result · save-typing · me · leaderboard · standings
 *    teacher-data · teacher-standings · set-session
 *
 *  Teacher utilities (run from the editor):
 *    setupSheet()   → builds every tab with headers (safe to re-run)
 *    prepareRoster()→ gives every student an id and scrambles plain PINs
 * ═══════════════════════════════════════════════════════════════
 */

var TZ = 'America/Belize';

var TAB = {
  STUDENTS:   'Students',
  SETTINGS:   'Settings',
  SESSIONS:   'Sessions',
  ATTENDANCE: 'Attendance',
  RESULTS:    'Mission Results',
  TYPING:     'Typing',
  BADGES:     'Badges',
  SUMMARY:    'Summary'
};

var HEADERS = {
  Students:          ['student_id', 'display_name', 'full_name', 'standard', 'pin', 'active'],
  Settings:          ['key', 'value'],
  Sessions:          ['date', 'week', 'mission', 'club_code', 'saved_at'],
  Attendance:        ['timestamp', 'date', 'week', 'student_id', 'display_name', 'standard'],
  'Mission Results': ['timestamp', 'date', 'week', 'student_id', 'display_name', 'standard',
                      'mission_id', 'activity', 'level', 'score', 'max_score', 'stars',
                      'misses', 'best_streak', 'detail', 'attempt_id'],
  Typing:            ['timestamp', 'date', 'week', 'student_id', 'display_name', 'standard',
                      'level', 'duration_s', 'wpm', 'accuracy', 'errors', 'chars_typed', 'attempt_id'],
  Badges:            ['timestamp', 'student_id', 'display_name', 'badge_id', 'badge_name', 'source', 'attempt_id']
};

var MISSION_LEVELS = ['bronze', 'silver', 'gold'];
var SESSION_HOURS  = 6;     // a sign-in lasts one club session, not all week
var PIN_MAX_FAILS  = 5;     // then the student waits PIN_LOCK_MIN minutes
var PIN_LOCK_MIN   = 10;

// ─────────────────────────────────────────────
// BADGES — one place for every badge rule.
// Each rule is checked after a result is saved; a badge is given once per student.
// ─────────────────────────────────────────────
var BADGES = [
  { id: 'shortcut-ninja', name: 'Shortcut Ninja', icon: '🥷', kind: 'mission',
    test: function (r) {
      return r.mission_id === 'shortcut-ninja' &&
        ((r.level === 'gold' && r.score >= 12) ||
         ((r.level === 'bronze' || r.level === 'silver') && r.stars >= 2));
    } },
  { id: 'typing-15', name: 'Speedy Fingers (15 WPM)', icon: '⌨️', kind: 'typing',
    test: function (t) { return t.wpm >= 15 && t.accuracy >= 90; } },
  { id: 'typing-25', name: 'Keyboard Racer (25 WPM)', icon: '🏎️', kind: 'typing',
    test: function (t) { return t.wpm >= 25 && t.accuracy >= 90; } },
  { id: 'typing-35', name: 'Typing Champion (35 WPM)', icon: '🏆', kind: 'typing',
    test: function (t) { return t.wpm >= 35 && t.accuracy >= 90; } }
];

// ─────────────────────────────────────────────
// MISSION WEEKS — every mission page's id and the club week it opens in.
// A mission stays LOCKED until the teacher's current week (Settings → week, set with
// "Start this session") reaches it: future-week results are refused here, whatever the page does.
// ⚠️ Add each new mission here before students use it (an unknown id is refused).
// ─────────────────────────────────────────────
var MISSION_WEEKS = {
  'shortcut-ninja': 1
};

// ─────────────────────────────────────────────
// CLUB XP — worked out from rows the Sheet already has (nothing extra to type in).
// Daily caps stop anyone farming XP by replaying the same easy round.
// ─────────────────────────────────────────────
var XP = {
  ATTEND: 10,                 // each club day signed in
  MISSION_ROUND: 5,           // each finished mission round…
  MISSION_STAR: 5,            // …plus 5 per star
  MISSION_DAY_CAP: 60,        // most mission XP one student can earn in one day
  TYPING_TEST: 5,             // each typing test (any accuracy)
  TYPING_DAY_CAP: 25,         // most typing-test XP in one day
  PERSONAL_BEST: 10,          // beating your own best (typing at 90%+, or a Gold mission score)
  BADGE: 25,                  // each badge
  PER_LEVEL: 100              // one level every 100 XP
};
var LEVEL_NAMES = ['Rookie', 'Explorer', 'Coder', 'Hacker', 'Wizard', 'Legend'];
var STANDINGS_CACHE = 'standings_v1';
var STANDINGS_SECONDS = 30;

// ─────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var apiKey = prop('API_KEY');
    if (!apiKey || body.key !== apiKey) return reply({ ok: false, error: 'Unauthorized' });

    switch (body.action) {
      case 'ping':         return reply({ ok: true, message: 'Computer Club backend is alive' });
      case 'status':       return reply(handleStatus());
      case 'roster':       return reply(handleRoster(body));
      case 'signin':       return reply(handleSignin(body));
      case 'save-result':  return reply(handleSaveResult(body));
      case 'save-typing':  return reply(handleSaveTyping(body));
      case 'me':           return reply(handleMe(body));
      case 'leaderboard':  return reply(handleLeaderboard(body));
      case 'standings':    return reply(handleStandings(body));
      case 'teacher-standings': return reply(handleTeacherStandings(body));
      case 'teacher-data': return reply(handleTeacherData(body));
      case 'set-session':  return reply(handleSetSession(body));
    }
    return reply({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return reply({ ok: false, error: 'Server error: ' + err.message });
  }
}

// ─────────────────────────────────────────────
// STATUS — public (no sign-in): the current club week, so pages can lock future missions.
// Never returns the club code.
// ─────────────────────────────────────────────
function handleStatus() {
  var s = getSettings();
  return { ok: true, week: s.week, mission: s.mission };
}

// ─────────────────────────────────────────────
// ROSTER — { club_code } → names to pick from (only with this week's code)
// ─────────────────────────────────────────────
function handleRoster(body) {
  var s = getSettings();
  if (!codeMatches(body.club_code, s.club_code)) {
    return { ok: false, error: 'That club code is not right. Check the board and try again.' };
  }
  var students = readStudents().filter(function (st) { return st.active; }).map(function (st) {
    return { id: st.id, name: st.display_name, standard: st.standard };
  });
  students.sort(function (a, b) {
    return (a.standard - b.standard) || a.name.localeCompare(b.name);
  });
  return { ok: true, students: students, week: s.week, mission: s.mission };
}

// ─────────────────────────────────────────────
// SIGN IN — { club_code, student_id, pin } → token; records attendance once a day
// ─────────────────────────────────────────────
function handleSignin(body) {
  var s = getSettings();
  if (!codeMatches(body.club_code, s.club_code)) {
    return { ok: false, error: 'That club code is not right. Check the board and try again.' };
  }
  var id = String(body.student_id || '').trim();
  var st = findStudent(id);
  if (!st || !st.active) return { ok: false, error: 'Name not found. Ask Mr. EdLo.' };

  var cache = CacheService.getScriptCache();
  var failKey = 'pinfail_' + id;
  var fails = Number(cache.get(failKey) || 0);
  if (fails >= PIN_MAX_FAILS) {
    return { ok: false, locked: true, error: 'Too many wrong PINs. Wait ' + PIN_LOCK_MIN + ' minutes or ask Mr. EdLo.' };
  }
  if (!/^\d{4}$/.test(String(body.pin || '')) || hashPin(id, String(body.pin)) !== st.pin) {
    cache.put(failKey, String(fails + 1), PIN_LOCK_MIN * 60);
    var left = PIN_MAX_FAILS - fails - 1;
    return { ok: false, error: left > 0 ? 'Wrong PIN. ' + left + (left === 1 ? ' try' : ' tries') + ' left.'
                                        : 'Too many wrong PINs. Wait ' + PIN_LOCK_MIN + ' minutes or ask Mr. EdLo.' };
  }
  cache.remove(failKey);

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var today = todayStr();
    var att = sheet(TAB.ATTENDANCE);
    var rows = att.getDataRange().getValues();
    var already = false;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][3]) === id && dateStr(rows[i][1]) === today) { already = true; break; }
    }
    if (!already) { att.appendRow([nowStr(), today, s.week, id, st.display_name, st.standard]); dropStandings(); }
  } finally {
    lock.releaseLock();
  }

  var expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  return {
    ok: true,
    token: makeToken(id, expires),
    expires: expires,
    student: { id: id, name: st.display_name, standard: st.standard },
    week: s.week,
    mission: s.mission,
    typingclub_url: safeUrl(s.typingclub_url)
  };
}

// ─────────────────────────────────────────────
// SAVE MISSION RESULT — { token, attempt_id, mission_id, activity, level, score, max_score,
//                         stars, misses, best_streak, detail }
// ─────────────────────────────────────────────
function handleSaveResult(body) {
  var who = checkToken(body.token);
  if (!who.ok) return { ok: false, auth: true, error: who.error };
  var st = findStudent(who.id);
  if (!st || !st.active) return { ok: false, auth: true, error: 'Account not active' };

  var attempt = cleanId(body.attempt_id);
  if (!attempt) return { ok: false, error: 'Missing attempt id' };
  var level = String(body.level || '').toLowerCase();
  if (MISSION_LEVELS.indexOf(level) === -1) return { ok: false, error: 'Bad level' };

  var r = {
    mission_id: cleanId(body.mission_id),
    activity: String(body.activity || '').slice(0, 80),
    level: level,
    score: num(body.score, 0, 1000),
    max_score: num(body.max_score, 0, 1000),
    stars: num(body.stars, 0, 3),
    misses: num(body.misses, 0, 1000),
    best_streak: num(body.best_streak, 0, 1000),
    detail: String(body.detail || '').slice(0, 300)
  };
  if (!r.mission_id) return { ok: false, error: 'Missing mission id' };
  var opensIn = MISSION_WEEKS[r.mission_id];
  if (!opensIn) return { ok: false, error: 'Unknown mission. Please tell Mr. EdLo.' };
  if (opensIn > getSettings().week) {
    return { ok: false, locked: true, error: 'This mission opens in Week ' + opensIn + '. It is done during Computer Club.' };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = sheet(TAB.RESULTS);
    if (columnHas(sh, 16, attempt)) {
      return { ok: true, duplicate: true, badges: [] };
    }
    var s = getSettings();
    sh.appendRow([nowStr(), todayStr(), s.week, who.id, st.display_name, st.standard,
      r.mission_id, r.activity, r.level, r.score, r.max_score, r.stars, r.misses, r.best_streak,
      r.detail, attempt]);
    var badges = awardBadges(who.id, st.display_name, 'mission', r, attempt);
    dropStandings();
    return { ok: true, badges: badges };
  } finally {
    lock.releaseLock();
  }
}

// ─────────────────────────────────────────────
// SAVE TYPING TEST — { token, attempt_id, level, duration_s, wpm, accuracy, errors, chars_typed }
// ─────────────────────────────────────────────
function handleSaveTyping(body) {
  var who = checkToken(body.token);
  if (!who.ok) return { ok: false, auth: true, error: who.error };
  var st = findStudent(who.id);
  if (!st || !st.active) return { ok: false, auth: true, error: 'Account not active' };

  var attempt = cleanId(body.attempt_id);
  if (!attempt) return { ok: false, error: 'Missing attempt id' };
  var level = String(body.level || '').toLowerCase();
  if (MISSION_LEVELS.indexOf(level) === -1) return { ok: false, error: 'Bad level' };

  var t = {
    level: level,
    duration_s: num(body.duration_s, 0, 600),
    wpm: num(body.wpm, 0, 200),
    accuracy: num(body.accuracy, 0, 100),
    errors: num(body.errors, 0, 5000),
    chars_typed: num(body.chars_typed, 0, 10000)
  };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = sheet(TAB.TYPING);
    if (columnHas(sh, 13, attempt)) return { ok: true, duplicate: true, badges: [] };
    var s = getSettings();
    sh.appendRow([nowStr(), todayStr(), s.week, who.id, st.display_name, st.standard,
      t.level, t.duration_s, t.wpm, t.accuracy, t.errors, t.chars_typed, attempt]);
    var badges = awardBadges(who.id, st.display_name, 'typing', t, attempt);
    dropStandings();
    return { ok: true, badges: badges, best_wpm: bestWpm(who.id) };
  } finally {
    lock.releaseLock();
  }
}

// ─────────────────────────────────────────────
// ME — { token } → my badges + bests (hub page + mission pages)
// ─────────────────────────────────────────────
function handleMe(body) {
  var who = checkToken(body.token);
  if (!who.ok) return { ok: false, auth: true, error: who.error };
  var st = findStudent(who.id);
  if (!st || !st.active) return { ok: false, auth: true, error: 'Account not active' };

  var mine = rowsOf(TAB.BADGES).filter(function (b) { return String(b[1]) === who.id; })
    .map(function (b) { return badgeOut(String(b[3]), b[0]); });

  var gold = 0;
  rowsOf(TAB.RESULTS).forEach(function (r) {
    if (String(r[3]) === who.id && r[6] === 'shortcut-ninja' && r[8] === 'gold') gold = Math.max(gold, Number(r[9]) || 0);
  });
  return { ok: true, student: { id: who.id, name: st.display_name, standard: st.standard },
           badges: mine, best_wpm: bestWpm(who.id), shortcut_gold_best: gold, all_badges: badgeList(),
           typingclub_url: safeUrl(getSettings().typingclub_url) };
}

// ─────────────────────────────────────────────
// LEADERBOARD — { token } → top 10 typing (best WPM, accuracy ≥ 90) + top 10 Shortcut Ninja Gold
// ─────────────────────────────────────────────
function handleLeaderboard(body) {
  var who = checkToken(body.token);
  if (!who.ok) return { ok: false, auth: true, error: who.error };
  return { ok: true, typing: topTyping(10), shortcut_gold: topShortcutGold(10) };
}

function topTyping(n) {
  var best = {};
  rowsOf(TAB.TYPING).forEach(function (r) {
    var id = String(r[3]), wpm = Number(r[8]) || 0, acc = Number(r[9]) || 0;
    if (acc < 90) return;
    if (!best[id] || wpm > best[id].value) best[id] = { name: String(r[4]), standard: r[5], value: wpm };
  });
  return topN(best, n);
}

function topShortcutGold(n) {
  var best = {};
  rowsOf(TAB.RESULTS).forEach(function (r) {
    if (r[6] !== 'shortcut-ninja' || r[8] !== 'gold') return;
    var id = String(r[3]), v = Number(r[9]) || 0;
    if (!best[id] || v > best[id].value) best[id] = { name: String(r[4]), standard: r[5], value: v };
  });
  return topN(best, n);
}

function topN(map, n) {
  return Object.keys(map).map(function (k) { return map[k]; })
    .sort(function (a, b) { return b.value - a.value; }).slice(0, n);
}

// ─────────────────────────────────────────────
// TEACHER — { teacher_code } → everything the dashboard needs
// ─────────────────────────────────────────────
function checkTeacher(body) {
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get('teacherfail') || 0);
  if (fails >= 10) return { ok: false, error: 'Too many wrong codes. Wait 10 minutes.' };
  var code = prop('TEACHER_CODE');
  if (!code || String(body.teacher_code || '') !== code) {
    cache.put('teacherfail', String(fails + 1), 600);
    return { ok: false, error: 'Wrong teacher code' };
  }
  return { ok: true };
}

function handleTeacherData(body) {
  var t = checkTeacher(body);
  if (!t.ok) return t;
  var students = readStudents().map(function (s) {
    return { id: s.id, name: s.display_name, full_name: s.full_name, standard: s.standard, active: s.active };
  });
  var attendance = rowsOf(TAB.ATTENDANCE).map(function (r) {
    return { date: dateStr(r[1]), week: r[2], id: String(r[3]) };
  });
  var typing = rowsOf(TAB.TYPING).map(function (r) {
    return { ts: String(r[0]), date: dateStr(r[1]), week: r[2], id: String(r[3]), level: r[6],
             duration_s: r[7], wpm: Number(r[8]) || 0, accuracy: Number(r[9]) || 0, errors: r[10] };
  });
  var results = rowsOf(TAB.RESULTS).map(function (r) {
    return { ts: String(r[0]), date: dateStr(r[1]), week: r[2], id: String(r[3]), mission_id: r[6],
             activity: r[7], level: r[8], score: r[9], max_score: r[10], stars: r[11], misses: r[12] };
  });
  var badges = rowsOf(TAB.BADGES).map(function (r) {
    return { ts: String(r[0]), id: String(r[1]), badge_id: String(r[3]), name: String(r[4]) };
  });
  var sessions = rowsOf(TAB.SESSIONS).map(function (r) {
    return { date: dateStr(r[0]), week: r[1], mission: r[2] };
  });
  return { ok: true, settings: getSettings(), students: students, attendance: attendance,
           typing: typing, results: results, badges: badges, sessions: sessions,
           leaderboard: { typing: topTyping(10), shortcut_gold: topShortcutGold(10) },
           all_badges: badgeList() };
}

// { teacher_code, club_code, week, mission } → updates Settings, logs the session
function handleSetSession(body) {
  var t = checkTeacher(body);
  if (!t.ok) return t;
  var code = String(body.club_code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{3,12}$/.test(code)) return { ok: false, error: 'Club code: 3–12 letters or numbers' };
  var week = num(body.week, 1, 60);
  var mission = String(body.mission || '').slice(0, 60);

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    setSetting('club_code', code);
    setSetting('week', week);
    setSetting('mission', mission);
    sheet(TAB.SESSIONS).appendRow([todayStr(), week, mission, code, nowStr()]);
  } finally {
    lock.releaseLock();
  }
  return { ok: true, settings: getSettings() };
}

// ─────────────────────────────────────────────
// STANDINGS — { token } → my XP, level, rank, the student just ahead, and the boards.
// Students see the top 10 only (plus themselves); the teacher sees everyone.
// ─────────────────────────────────────────────
function handleStandings(body) {
  var who = checkToken(body.token);
  if (!who.ok) return { ok: false, auth: true, error: who.error };
  var all = computeStandings();
  var mine = null, idx = -1;
  for (var i = 0; i < all.ranking.length; i++) if (all.ranking[i].id === who.id) { mine = all.ranking[i]; idx = i; }
  if (!mine) return { ok: false, auth: true, error: 'Account not active' };
  var ahead = null;
  for (var j = idx - 1; j >= 0; j--) {
    if (all.ranking[j].xp > mine.xp) { ahead = { name: all.ranking[j].name, gap: all.ranking[j].xp - mine.xp }; break; }
  }
  return {
    ok: true,
    me: { name: mine.name, standard: mine.standard, xp: mine.xp, level: mine.level, level_name: mine.level_name,
          into_level: mine.xp % XP.PER_LEVEL, per_level: XP.PER_LEVEL, rank: mine.rank, total: all.ranking.length,
          ahead: ahead, parts: mine.parts },
    top: all.ranking.slice(0, 10).map(function (r) { var o = publicRow(r); o.is_me = r.id === who.id; return o; }),
    most_improved: all.most_improved.slice(0, 10),
    fastest_by_standard: all.fastest_by_standard,
    battle: all.battle,
    shortcut_gold: topShortcutGold(10),
    xp_rules: xpRules(),
    updated: all.updated
  };
}

function handleTeacherStandings(body) {
  var t = checkTeacher(body);
  if (!t.ok) return t;
  var all = computeStandings();
  return { ok: true, ranking: all.ranking.map(function (r) {
             var o = publicRow(r); o.parts = r.parts; o.id = r.id; return o; }),
           most_improved: all.most_improved.slice(0, 10), fastest_by_standard: all.fastest_by_standard,
           battle: all.battle, shortcut_gold: topShortcutGold(10), xp_rules: xpRules(), updated: all.updated };
}

function publicRow(r) {
  return { rank: r.rank, name: r.name, standard: r.standard, xp: r.xp, level: r.level, level_name: r.level_name };
}

function levelName(level) { return LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1]; }

function xpRules() {
  return [
    'Come to club and sign in: +' + XP.ATTEND,
    'Finish a mission round: +' + XP.MISSION_ROUND + ', plus ' + XP.MISSION_STAR + ' per star (up to ' + XP.MISSION_DAY_CAP + ' a day)',
    'Do a typing test: +' + XP.TYPING_TEST + ' (up to ' + XP.TYPING_DAY_CAP + ' a day)',
    'Beat your own best: +' + XP.PERSONAL_BEST + ' (typing at 90%+ accuracy, or a Gold score)',
    'Earn a badge: +' + XP.BADGE,
    'Every ' + XP.PER_LEVEL + ' XP = a new level'
  ];
}

function dropStandings() { CacheService.getScriptCache().remove(STANDINGS_CACHE); }

/** Works out everyone's XP and every board. Cached for STANDINGS_SECONDS; any new row clears the cache. */
function computeStandings() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get(STANDINGS_CACHE);
  if (hit) return JSON.parse(hit);

  var S = {};
  readStudents().filter(function (s) { return s.active; }).forEach(function (s) {
    S[s.id] = { id: s.id, name: s.display_name, standard: s.standard, xp: 0,
                parts: { attend: 0, missions: 0, typing: 0, bests: 0, badges: 0 } };
  });

  rowsOf(TAB.ATTENDANCE).forEach(function (r) {
    var p = S[String(r[3])]; if (p) p.parts.attend += XP.ATTEND;
  });

  var missionDay = {}, goldBest = {};
  rowsOf(TAB.RESULTS).forEach(function (r) {
    var id = String(r[3]), p = S[id]; if (!p) return;
    var day = id + '|' + dateStr(r[1]);
    var used = missionDay[day] || 0;
    var add = Math.min(XP.MISSION_ROUND + XP.MISSION_STAR * (Number(r[11]) || 0), XP.MISSION_DAY_CAP - used);
    if (add > 0) { p.parts.missions += add; missionDay[day] = used + add; }
    if (r[8] === 'gold') {
      var key = id + '|' + r[6], score = Number(r[9]) || 0;
      if (goldBest[key] !== undefined && score > goldBest[key]) p.parts.bests += XP.PERSONAL_BEST;
      if (goldBest[key] === undefined || score > goldBest[key]) goldBest[key] = score;
    }
  });

  var typingDay = {}, typeFirst = {}, typeBest = {};
  rowsOf(TAB.TYPING).forEach(function (r) {
    var id = String(r[3]), p = S[id]; if (!p) return;
    var day = id + '|' + dateStr(r[1]);
    var used = typingDay[day] || 0;
    var add = Math.min(XP.TYPING_TEST, XP.TYPING_DAY_CAP - used);
    if (add > 0) { p.parts.typing += add; typingDay[day] = used + add; }
    var wpm = Number(r[8]) || 0, acc = Number(r[9]) || 0;
    if (acc >= 90) {
      if (typeBest[id] !== undefined && wpm > typeBest[id]) p.parts.bests += XP.PERSONAL_BEST;
      if (typeFirst[id] === undefined) typeFirst[id] = wpm;
      if (typeBest[id] === undefined || wpm > typeBest[id]) typeBest[id] = wpm;
    }
  });

  rowsOf(TAB.BADGES).forEach(function (r) {
    var p = S[String(r[1])]; if (p) p.parts.badges += XP.BADGE;
  });

  var ranking = Object.keys(S).map(function (k) {
    var p = S[k], q = p.parts;
    p.xp = q.attend + q.missions + q.typing + q.bests + q.badges;
    p.level = Math.floor(p.xp / XP.PER_LEVEL) + 1;
    p.level_name = levelName(p.level);
    return p;
  }).sort(function (a, b) { return (b.xp - a.xp) || a.name.localeCompare(b.name); });
  ranking.forEach(function (p) {
    var higher = 0;
    for (var i = 0; i < ranking.length; i++) if (ranking[i].xp > p.xp) higher++;
    p.rank = higher + 1;               // ties share a rank
  });

  // Most improved typing: best (90%+) minus the first 90%+ test. Needs two qualifying tests.
  var improved = Object.keys(typeBest).filter(function (id) { return S[id] && typeBest[id] > typeFirst[id]; })
    .map(function (id) { return { name: S[id].name, standard: S[id].standard,
                                  value: Math.round((typeBest[id] - typeFirst[id]) * 10) / 10,
                                  from: typeFirst[id], to: typeBest[id] }; })
    .sort(function (a, b) { return b.value - a.value; });

  // Fastest per standard: best 90%+ WPM, top 5 in each standard.
  var byStd = {};
  Object.keys(typeBest).forEach(function (id) {
    var p = S[id]; if (!p) return;
    (byStd[p.standard] = byStd[p.standard] || []).push({ name: p.name, standard: p.standard, value: typeBest[id] });
  });
  Object.keys(byStd).forEach(function (k) {
    byStd[k] = byStd[k].sort(function (a, b) { return b.value - a.value; }).slice(0, 5);
  });

  // Standard vs Standard: AVERAGE XP of every active member, so a bigger group has no advantage.
  var groups = {};
  ranking.forEach(function (p) {
    var g = groups[p.standard] = groups[p.standard] || { standard: p.standard, total: 0, members: 0 };
    g.total += p.xp; g.members++;
  });
  var battle = Object.keys(groups).map(function (k) {
    var g = groups[k]; return { standard: g.standard, avg: Math.round(g.total / g.members), members: g.members };
  }).sort(function (a, b) { return b.avg - a.avg; });

  var out = { ranking: ranking, most_improved: improved, fastest_by_standard: byStd, battle: battle, updated: nowStr() };
  try { cache.put(STANDINGS_CACHE, JSON.stringify(out), STANDINGS_SECONDS); } catch (e) {}
  return out;
}

// ─────────────────────────────────────────────
// BADGE HELPERS
// ─────────────────────────────────────────────
function awardBadges(id, name, kind, data, attempt) {
  var owned = {};
  rowsOf(TAB.BADGES).forEach(function (b) { if (String(b[1]) === id) owned[String(b[3])] = true; });
  var won = [];
  BADGES.forEach(function (b) {
    if (b.kind !== kind || owned[b.id]) return;
    if (b.test(data)) {
      sheet(TAB.BADGES).appendRow([nowStr(), id, name, b.id, b.name, kind, attempt]);
      won.push(badgeOut(b.id, nowStr()));
    }
  });
  return won;
}

function badgeOut(badgeId, when) {
  for (var i = 0; i < BADGES.length; i++) {
    if (BADGES[i].id === badgeId) return { id: badgeId, name: BADGES[i].name, icon: BADGES[i].icon, when: String(when) };
  }
  return { id: badgeId, name: badgeId, icon: '🏅', when: String(when) };
}

function badgeList() {
  return BADGES.map(function (b) { return { id: b.id, name: b.name, icon: b.icon }; });
}

function bestWpm(id) {
  var best = 0;
  rowsOf(TAB.TYPING).forEach(function (r) {
    if (String(r[3]) === id && (Number(r[9]) || 0) >= 90) best = Math.max(best, Number(r[8]) || 0);
  });
  return best;
}

// ─────────────────────────────────────────────
// SHEET HELPERS
// ─────────────────────────────────────────────
function sheet(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Missing tab "' + name + '" — run setupSheet()');
  return sh;
}

function rowsOf(name) {
  var v = sheet(name).getDataRange().getValues();
  return v.slice(1).filter(function (r) { return r.join('') !== ''; });
}

function columnHas(sh, col, value) {
  var last = sh.getLastRow();
  if (last < 2) return false;
  var vals = sh.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === value) return true;
  return false;
}

function readStudents() {
  return rowsOf(TAB.STUDENTS).map(function (r) {
    return {
      id: String(r[0]).trim(),
      display_name: String(r[1]).trim(),
      full_name: String(r[2]).trim(),
      standard: Number(r[3]) || 0,
      pin: String(r[4]).trim(),
      active: String(r[5]).trim().toUpperCase() !== 'NO'
    };
  }).filter(function (s) { return s.id && s.display_name; });
}

function findStudent(id) {
  var all = readStudents();
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
}

function getSettings() {
  var out = { club_code: '', week: 1, mission: '' };
  rowsOf(TAB.SETTINGS).forEach(function (r) { out[String(r[0]).trim()] = r[1]; });
  out.week = Number(out.week) || 1;
  out.club_code = String(out.club_code || '');
  out.mission = String(out.mission || '');
  return out;
}

function setSetting(key, value) {
  var sh = sheet(TAB.SETTINGS);
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim() === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  }
  sh.appendRow([key, value]);
}

// Only a TypingClub https link is ever handed to a page (the value is typed into the Settings tab).
function safeUrl(v) {
  v = String(v || '').trim();
  return /^https:\/\/[a-z0-9-]+\.typingclub\.com\//i.test(v) ? v : '';
}

function codeMatches(given, real) {
  real = String(real || '').trim().toUpperCase();
  return !!real && String(given || '').trim().toUpperCase() === real;
}

// ─────────────────────────────────────────────
// TOKENS + PINS (same signing method as VC-LMS, separate secret)
// ─────────────────────────────────────────────
function makeToken(id, expires) {
  var payload = id + '|' + expires;
  return Utilities.base64EncodeWebSafe(payload) + '.' + sign(payload);
}

function checkToken(token) {
  if (!token) return { ok: false, error: 'Not signed in' };
  var parts = String(token).split('.');
  if (parts.length !== 2) return { ok: false, error: 'Invalid sign-in' };
  var payload;
  try {
    payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
  } catch (e) {
    return { ok: false, error: 'Invalid sign-in' };
  }
  if (sign(payload) !== parts[1]) return { ok: false, error: 'Invalid sign-in' };
  var pieces = payload.split('|');
  if (Date.now() > Number(pieces[1])) return { ok: false, error: 'Sign-in expired. Please sign in again.' };
  return { ok: true, id: pieces[0] };
}

function sign(payload) { return sha256Hex(payload + '::' + prop('SESSION_SECRET')); }

function hashPin(id, pin) { return 'sha256:' + sha256Hex(id + '::' + pin + '::' + prop('SESSION_SECRET')); }

function sha256Hex(text) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return digest.map(function (b) {
    var v = (b + 256) % 256;
    return (v < 16 ? '0' : '') + v.toString(16);
  }).join('');
}

// ─────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────
function prop(name) { return PropertiesService.getScriptProperties().getProperty(name); }
function nowStr() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function todayStr() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function dateStr(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  return String(v).slice(0, 10);
}
function cleanId(v) {
  var s = String(v || '').trim();
  return /^[A-Za-z0-9._:-]{1,80}$/.test(s) ? s : '';
}
function num(v, min, max) {
  var n = Number(v);
  if (!isFinite(n)) n = 0;
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}
function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ═════════════════════════════════════════════
// TEACHER UTILITIES — run from the Apps Script editor
// ═════════════════════════════════════════════

/** Builds every tab with headers. Safe to re-run: existing tabs and data are kept. */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS[name]);
      sh.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });
  var settings = ss.getSheetByName(TAB.SETTINGS);
  if (settings.getLastRow() === 1) {
    settings.appendRow(['club_code', 'CLUB1']);
    settings.appendRow(['week', 1]);
    settings.appendRow(['mission', 'Shortcut Ninja']);
    settings.appendRow(['typingclub_url', '']);   // paste the class sign-up link here (never in the repo)
  }
  // Summary tab — formulas only; one row per student (rows 2–101)
  var sum = ss.getSheetByName(TAB.SUMMARY) || ss.insertSheet(TAB.SUMMARY);
  if (sum.getLastRow() === 0) {
    sum.appendRow(['student_id', 'display_name', 'standard', 'sessions_attended', 'typing_tests',
                   'best_wpm', 'latest_wpm', 'missions_finished', 'badges']);
    sum.getRange(1, 1, 1, 9).setFontWeight('bold');
    sum.setFrozenRows(1);
    var f = [];
    for (var r = 2; r <= 101; r++) {
      f.push([
        '=IF(Students!A' + r + '="","",Students!A' + r + ')',
        '=IF(A' + r + '="","",Students!B' + r + ')',
        '=IF(A' + r + '="","",Students!D' + r + ')',
        '=IF(A' + r + '="","",COUNTIF(Attendance!D:D,A' + r + '))',
        '=IF(A' + r + '="","",COUNTIF(Typing!D:D,A' + r + '))',
        '=IF(A' + r + '="","",IFERROR(MAXIFS(Typing!I:I,Typing!D:D,A' + r + ',Typing!J:J,">=90"),0))',
        '=IF(A' + r + '="","",IFERROR(INDEX(FILTER(Typing!I:I,Typing!D:D=A' + r + '),COUNTIF(Typing!D:D,A' + r + ')),""))',
        '=IF(A' + r + '="","",COUNTIF(\'Mission Results\'!D:D,A' + r + '))',
        '=IF(A' + r + '="","",COUNTIF(Badges!B:B,A' + r + '))'
      ]);
    }
    sum.getRange(2, 1, 100, 9).setFormulas(f);
  }
  var junk = ss.getSheetByName('Sheet1');
  if (junk && junk.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(junk);
}

/**
 * Students tab: type display_name (e.g. "Ana R."), full_name, standard (4, 5 or 6) and a
 * plain 4-digit PIN in column E. Leave student_id empty. Then run this once.
 * Every student gets an id (cc001, cc002…) and every plain PIN becomes a scrambled hash.
 * Already-done rows are skipped, so it is always safe to re-run (also after adding students).
 * To reset a PIN: type a new 4-digit PIN over the hash and run this again.
 */
function prepareRoster() {
  var sh = sheet(TAB.STUDENTS);
  var data = sh.getDataRange().getValues();
  var maxN = 0;
  for (var i = 1; i < data.length; i++) {
    var m = String(data[i][0]).match(/^cc(\d+)$/);
    if (m) maxN = Math.max(maxN, Number(m[1]));
  }
  var ids = 0, pins = 0, bad = [];
  for (var j = 1; j < data.length; j++) {
    if (String(data[j][1]).trim() === '') continue;
    var id = String(data[j][0]).trim();
    if (!id) {
      maxN += 1;
      id = 'cc' + ('00' + maxN).slice(-3);
      sh.getRange(j + 1, 1).setValue(id);
      ids++;
    }
    var pin = String(data[j][4]).trim();
    if (pin.indexOf('sha256:') === 0) continue;
    if (/^\d{1,4}$/.test(pin)) pin = ('0000' + pin).slice(-4);   // Sheets drops leading zeros
    if (!/^\d{4}$/.test(pin)) { bad.push('row ' + (j + 1)); continue; }
    sh.getRange(j + 1, 5).setValue(hashPin(id, pin));
    pins++;
    if (String(data[j][5]).trim() === '') sh.getRange(j + 1, 6).setValue('YES');
  }
  Logger.log('New ids: ' + ids + ' · PINs scrambled: ' + pins + (bad.length ? ' · Not a 4-digit PIN: ' + bad.join(', ') : ''));
}
