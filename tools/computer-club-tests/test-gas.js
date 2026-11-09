const { createGas } = require('./gas-mock');
const assert = require('assert');
const G = createGas(require('path').join(__dirname, '../../backend/Computer-Club-Backend.gs'),
  { API_KEY: 'k1', SESSION_SECRET: 'sec', TEACHER_CODE: 'TEACH' });
G.setupSheet();
const S = G.sheets;
console.log('tabs', Object.keys(S));
S.Students.appendRow(['', 'Ana R.', 'Ana Ramirez', 4, '1234', '']);
S.Students.appendRow(['', 'Ben T.', 'Ben Tun', 6, 42, '']);  // leading zeros dropped -> 0042
S.Students.appendRow(['', 'Cy X.', 'Cy X', 5, 'abc', '']);
G.prepareRoster(); console.log(G._log);
console.log(S.Students.rows.map(r => r.slice(0, 2).concat(String(r[4]).slice(0, 12), r[5])));
const P = b => G.post(Object.assign({ key: 'k1' }, b));
assert.equal(P({ action: 'roster', club_code: 'club1' }).ok, false, 'closed club: no roster');
assert.ok(P({ action: 'set-access', teacher_code: 'TEACH', club_open: true, mission_id: 'shortcut-ninja', mission_open: true }).access.club_open);
assert.equal(G.post({ key: 'bad', action: 'ping' }).ok, false);
assert.equal(P({ action: 'ping' }).ok, true);
assert.equal(P({ action: 'roster', club_code: 'nope' }).ok, false);
let ro = P({ action: 'roster', club_code: 'club1' }); console.log('roster', JSON.stringify(ro));
assert.ok(ro.ok && ro.students.length === 3 && ro.students[0].standard === 4);
// set session via teacher
assert.equal(P({ action: 'set-session', teacher_code: 'x', club_code: 'BYTE7', week: 2, mission: 'M' }).ok, false);
let ss = P({ action: 'set-session', teacher_code: 'TEACH', club_code: 'byte7', week: 2, mission: 'Shortcut Ninja' }); console.log('set', JSON.stringify(ss.settings));
assert.equal(P({ action: 'roster', club_code: 'club1' }).ok, false);
// sign in
let w = P({ action: 'signin', club_code: 'BYTE7', student_id: 'cc001', pin: '9999' }); console.log(w.error);
let ok = P({ action: 'signin', club_code: 'BYTE7', student_id: 'cc001', pin: '1234' }); assert.ok(ok.ok, JSON.stringify(ok));
P({ action: 'signin', club_code: 'BYTE7', student_id: 'cc001', pin: '1234' });
assert.equal(S.Attendance.rows.length, 2, 'attendance once per day');
let ben = P({ action: 'signin', club_code: 'BYTE7', student_id: 'cc002', pin: '0042' }); assert.ok(ben.ok, 'leading zero pin');
// lockout
for (let i = 0; i < 5; i++) w = P({ action: 'signin', club_code: 'BYTE7', student_id: 'cc002', pin: '1111' });
console.log('after 5 wrong:', w.error);
assert.equal(P({ action: 'signin', club_code: 'BYTE7', student_id: 'cc002', pin: '0042' }).ok, false, 'locked');
// tokens
assert.equal(P({ action: 'me', token: 'garbage' }).ok, false);
assert.equal(P({ action: 'me', token: ok.token.replace(/.$/, 'x') }).ok, false);
const T = ok.token;
let r1 = P({ action: 'save-result', token: T, attempt_id: 'a1', mission_id: 'shortcut-ninja', activity: 'Shortcut Challenge', level: 'bronze', score: 10, max_score: 10, stars: 1, misses: 6, best_streak: 4 });
assert.ok(r1.ok && r1.badges.length === 0);
let r2 = P({ action: 'save-result', token: T, attempt_id: 'a2', mission_id: 'shortcut-ninja', level: 'gold', score: 14, max_score: 0, stars: 2 });
assert.ok(r2.badges.length === 1 && r2.badges[0].id === 'shortcut-ninja', JSON.stringify(r2));
let r2b = P({ action: 'save-result', token: T, attempt_id: 'a2', mission_id: 'shortcut-ninja', level: 'gold', score: 14 });
assert.ok(r2b.duplicate); assert.equal(S['Mission Results'].rows.length, 3);
assert.equal(P({ action: 'save-result', token: T, attempt_id: 'a3', mission_id: 'x', level: 'platinum' }).ok, false);
let t1 = P({ action: 'save-typing', token: T, attempt_id: 't1', level: 'silver', duration_s: 60, wpm: 27.4, accuracy: 95, errors: 3, chars_typed: 140 });
console.log('typing', JSON.stringify(t1));
assert.equal(t1.badges.length, 2);
let t2 = P({ action: 'save-typing', token: T, attempt_id: 't2', level: 'gold', duration_s: 120, wpm: 40, accuracy: 80 });
assert.equal(t2.badges.length, 0, 'low accuracy no badge'); assert.equal(t2.best_wpm, 27.4);
let me = P({ action: 'me', token: T }); console.log('me', JSON.stringify(me));
assert.equal(me.badges.length, 3); assert.equal(me.shortcut_gold_best, 14);
let lb = P({ action: 'leaderboard', token: T }); console.log('lb', JSON.stringify(lb));
let td = P({ action: 'teacher-data', teacher_code: 'TEACH' });
console.log('teacher keys', Object.keys(td), td.students.length, td.attendance.length, td.typing.length, td.results.length, td.badges.length, td.sessions.length);
// typingclub url filtering
S.Settings.rows.forEach(r => { if (r[0] === 'typingclub_url') r[1] = 'https://howardsmithnazarene.typingclub.com/signup/ABC'; });
assert.ok(P({ action: 'me', token: T }).typingclub_url.includes('typingclub'));
S.Settings.rows.forEach(r => { if (r[0] === 'typingclub_url') r[1] = 'javascript:alert(1)'; });
assert.equal(P({ action: 'me', token: T }).typingclub_url, '');
// inactive
S.Students.rows[1][5] = 'NO';
assert.equal(P({ action: 'me', token: T }).ok, false);
// expired token
const exp = G.makeToken('cc002', Date.now() - 1000);
assert.equal(P({ action: 'me', token: exp }).ok, false);
console.log('Summary row2', S.Summary.rows[1].slice(0, 3));
console.log('ALL GAS TESTS PASSED');
// ── open / close switches ──
{
  const G2 = createGas(require('path').join(__dirname, '../../backend/Computer-Club-Backend.gs'), { API_KEY: 'k1', SESSION_SECRET: 'sec', TEACHER_CODE: 'TEACH' });
  G2.setupSheet(); G2.sheets.Students.appendRow(['', 'Zed Z.', 'Z', 5, '7777', '']); G2.prepareRoster();
  const Q = b => G2.post(Object.assign({ key: 'k1' }, b));
  let st = Q({ action: 'status' }); console.log('status closed', JSON.stringify(st));
  assert.ok(st.ok && st.club_open === false && st.open_missions.length === 0 && !('club_code' in st));
  let si = Q({ action: 'signin', club_code: 'CLUB1', student_id: 'cc001', pin: '7777' }); assert.ok(!si.ok && si.closed, 'closed: no sign-in');
  assert.equal(Q({ action: 'set-access', teacher_code: 'nope', club_open: true }).ok, false);
  let sa = Q({ action: 'set-access', teacher_code: 'TEACH', club_open: true }); console.log('opened', JSON.stringify(sa.access), JSON.stringify(sa.missions));
  const tk = Q({ action: 'signin', club_code: 'CLUB1', student_id: 'cc001', pin: '7777' }).token; assert.ok(tk);
  let r = Q({ action: 'save-result', token: tk, attempt_id: 'm1', mission_id: 'shortcut-ninja', level: 'bronze', score: 5 });
  console.log('mission closed:', r.error); assert.ok(!r.ok && r.closed);
  assert.ok(Q({ action: 'save-typing', token: tk, attempt_id: 't1', level: 'bronze', duration_s: 60, wpm: 10, accuracy: 95 }).ok, 'typing ok while club open');
  Q({ action: 'set-access', teacher_code: 'TEACH', mission_id: 'shortcut-ninja', mission_open: true });
  assert.ok(Q({ action: 'save-result', token: tk, attempt_id: 'm2', mission_id: 'shortcut-ninja', level: 'bronze', score: 5 }).ok, 'open mission saves');
  assert.equal(Q({ action: 'save-result', token: tk, attempt_id: 'u1', mission_id: 'nope', level: 'bronze', score: 5 }).ok, false);
  Q({ action: 'set-access', teacher_code: 'TEACH', club_open: false });
  assert.equal(Q({ action: 'status' }).club_open, false);
  assert.ok(!Q({ action: 'signin', club_code: 'CLUB1', student_id: 'cc001', pin: '7777' }).ok, 'no sign-in right after close');
  r = Q({ action: 'save-result', token: tk, attempt_id: 'm3', mission_id: 'shortcut-ninja', level: 'bronze', score: 5 });
  assert.ok(r.ok, 'grace: a late result from club time still saves');
  G2.sheets.Settings.rows.forEach(rw => { if (rw[0] === 'club_open_until') rw[1] = Date.now() - 31 * 60000; });
  r = Q({ action: 'save-result', token: tk, attempt_id: 'm4', mission_id: 'shortcut-ninja', level: 'bronze', score: 5 });
  assert.ok(!r.ok && r.closed, 'after the grace: refused');
  assert.ok(!Q({ action: 'save-typing', token: tk, attempt_id: 't2', level: 'bronze', duration_s: 60, wpm: 10, accuracy: 95 }).ok, 'typing blocked after grace');
  // auto-close after CLUB_OPEN_HOURS
  Q({ action: 'set-access', teacher_code: 'TEACH', club_open: true });
  const until = Q({ action: 'status' }).open_until; const hrs = (until - Date.now()) / 3600000; console.log('open hours', hrs.toFixed(2)); assert.ok(hrs > 2.9 && hrs <= 3);
  G2.sheets.Settings.rows.forEach(rw => { if (rw[0] === 'club_open_until') rw[1] = Date.now() - 1000; });
  assert.equal(Q({ action: 'status' }).club_open, false, 'auto-closed');
  // switching a mission off
  Q({ action: 'set-access', teacher_code: 'TEACH', mission_id: 'shortcut-ninja', mission_open: false });
  assert.equal(Q({ action: 'status' }).open_missions.length, 0);
  // start session opens club
  Q({ action: 'set-session', teacher_code: 'TEACH', club_code: 'NEW1', week: 2, mission: 'x' });
  assert.equal(Q({ action: 'status' }).club_open, true, 'start session opens club');
  console.log('SWITCH TESTS PASSED');
}
// ── all 10 Cadet missions + one general badge rule (Nov 9) ──
{
  const G3 = createGas(require('path').join(__dirname, '../../backend/Computer-Club-Backend.gs'), { API_KEY: 'k1', SESSION_SECRET: 'sec', TEACHER_CODE: 'TEACH' });
  G3.setupSheet(); G3.sheets.Students.appendRow(['', 'Dee D.', 'D', 4, '5555', '']); G3.prepareRoster();
  const Q = b => G3.post(Object.assign({ key: 'k1' }, b));
  const ids = ['shortcut-ninja', 'know-your-computer', 'folder-detective', 'safe-surfer', 'search-sleuth',
               'pixel-artist', 'badge-designer', 'poster-pro', 'slide-show-star', 'typing-olympics'];
  let td = Q({ action: 'teacher-data', teacher_code: 'TEACH' });
  assert.deepStrictEqual(td.missions.map(m => m.id), ids, 'all 10 Cadet missions, week order');
  assert.ok(td.missions.every((m, i) => m.week === i + 1 && m.stage === 1 && m.name), 'week + stage 1 + name');
  assert.deepStrictEqual(td.all_badges.map(b => b.id), ids.concat(['typing-15', 'typing-25', 'typing-35']), 'badge order');
  assert.equal(td.all_badges[1].name, 'Hardware Hero'); assert.equal(td.all_badges[9].name, 'Typing Olympian');
  // every mission switch works; unknown id still refused
  ids.forEach(id => assert.ok(Q({ action: 'set-access', teacher_code: 'TEACH', mission_id: id, mission_open: true }).ok, id));
  assert.equal(Q({ action: 'set-access', teacher_code: 'TEACH', mission_id: 'nope', mission_open: true }).ok, false);
  Q({ action: 'set-access', teacher_code: 'TEACH', club_open: true });
  assert.equal(Q({ action: 'status' }).open_missions.length, 10);
  const tk = Q({ action: 'signin', club_code: 'CLUB1', student_id: 'cc001', pin: '5555' }).token; assert.ok(tk);
  let n = 0;
  const save = (mission_id, level, score, stars) => Q({ action: 'save-result', token: tk, attempt_id: 'g' + (++n), mission_id, level, score, max_score: 10, stars });
  // Shortcut Ninja: exactly the old rule
  assert.equal(save('shortcut-ninja', 'gold', 11, 1).badges.length, 0, 'SN gold 11: no badge');
  assert.equal(save('shortcut-ninja', 'gold', 11, 2).badges.length, 0, 'SN gold needs 12 even with 2 stars');
  assert.equal(save('shortcut-ninja', 'bronze', 10, 1).badges.length, 0, 'SN bronze 1 star: no badge');
  let sn = save('shortcut-ninja', 'gold', 12, 2); assert.equal(sn.badges[0].id, 'shortcut-ninja', 'SN gold 12: badge');
  assert.equal(save('shortcut-ninja', 'gold', 20, 3).badges.length, 0, 'badge once only');
  // General rule on a new mission
  assert.equal(save('know-your-computer', 'bronze', 6, 1).badges.length, 0, 'KYC 1 star: no badge');
  let ky = save('know-your-computer', 'silver', 9, 2);
  assert.ok(ky.ok && ky.badges.length === 1 && ky.badges[0].id === 'know-your-computer' && ky.badges[0].name === 'Hardware Hero', JSON.stringify(ky));
  assert.equal(save('search-sleuth', 'gold', 3, 2).badges[0].id, 'search-sleuth', 'no gold_target: 2 stars on Gold pass');
  // Gold bests per mission + boards
  save('know-your-computer', 'gold', 15, 1); save('know-your-computer', 'gold', 9, 1);
  const me = Q({ action: 'me', token: tk });
  assert.equal(me.shortcut_gold_best, 20, 'old field kept'); assert.equal(me.gold_best['shortcut-ninja'], 20);
  assert.equal(me.gold_best['know-your-computer'], 15); assert.equal(me.gold_best['folder-detective'], undefined);
  assert.equal(me.badges.length, 3); assert.equal(me.all_badges.length, 13);
  const lb = Q({ action: 'leaderboard', token: tk });
  assert.equal(lb.shortcut_gold[0].value, 20); assert.equal(lb.gold_boards['know-your-computer'][0].value, 15);
  assert.equal(lb.gold_boards['know-your-computer'].length, 1, 'one row per student');
  const st = Q({ action: 'standings', token: tk });
  assert.equal(st.shortcut_gold[0].value, 20); assert.ok(st.gold_boards['search-sleuth']);
  const ts = Q({ action: 'teacher-standings', teacher_code: 'TEACH' }); assert.ok(ts.gold_boards['know-your-computer']);
  td = Q({ action: 'teacher-data', teacher_code: 'TEACH' }); assert.equal(td.leaderboard.gold_boards['shortcut-ninja'][0].value, 20);
  console.log('MISSIONS + GENERAL BADGE RULE TESTS PASSED');
}
