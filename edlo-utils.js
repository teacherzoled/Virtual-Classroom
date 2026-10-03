/**
 * ═══════════════════════════════════════════════════════════════
 *  edlo-utils.js — Shared LMS utilities
 *  Mr. EdLo's Virtual Classroom · edlovirtualclassroom.com
 *
 *  Add to any page:
 *    <script src="/edlo-utils.js"></script>
 *    <script> vcRequireLogin(); </script>
 *
 *  Log a result from any submit button:
 *    vcSaveProgress({ subject:'Science', lo_code:'SC6.19',
 *      activity_type:'test', activity_name:'Plant Adaptations',
 *      score:24, max_score:30, ai_feedback:feedbackText });
 *
 *  GRADED results (tests, quizzes, homework) — use vcSubmitResult instead
 *  (Oct 2026). It retries on a busy record book, never writes the same result
 *  twice, and keeps an unsent result on this device until it gets through:
 *    vcSubmitResult(payload, { onRetry }) · vcSendUnsent() · vcRecoverResult({...})
 *  See "GRADED RESULTS" at the bottom of this file.
 * ═══════════════════════════════════════════════════════════════
 */

var VC_LMS_URL     = 'https://edlo-lms.smartstandardsix.workers.dev';
var VC_SESSION_KEY = 'vc-session';
var VC_LOGIN_PAGE  = '/login/';

/** Log a student in. Returns a Promise of the session object, or throws Error. */
function vcLogin(username, password) {
  return fetch(VC_LMS_URL + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok) throw new Error(data.error || 'Login failed');
      var session = {
        token:      data.token,
        username:   data.username,
        full_name:  data.full_name,
        first_name: data.first_name,
        class_id:   data.class_id,
        expires:    data.expires
      };
      localStorage.setItem(VC_SESSION_KEY, JSON.stringify(session));
      return session;
    });
}

/** Returns the stored session object, or null if missing/expired. */
function vcGetSession() {
  try {
    var raw = localStorage.getItem(VC_SESSION_KEY);
    if (!raw) return null;
    var session = JSON.parse(raw);
    if (!session.token || Date.now() > Number(session.expires)) {
      localStorage.removeItem(VC_SESSION_KEY);
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

/** Redirects to the login page if not logged in. Returns session (or null while redirecting). */
function vcRequireLogin() {
  var session = vcGetSession();
  if (!session) {
    var here = location.pathname + location.search;
    location.href = VC_LOGIN_PAGE + '?next=' + encodeURIComponent(here);
    return null;
  }
  return session;
}

/** Clears the session and returns to the login page. */
function vcLogout() {
  localStorage.removeItem(VC_SESSION_KEY);
  location.href = VC_LOGIN_PAGE;
}

/**
 * Sends one result row to the LMS.
 * payload: { subject, lo_code, activity_type, activity_name, score, max_score, ai_feedback? }
 * Resolves { ok:true, percent } — never throws on network failure (logs a warning instead),
 * so a Sheets hiccup can never block a student mid-activity.
 */
function vcSaveProgress(payload) {
  var session = vcGetSession();
  if (!session) {
    console.warn('vcSaveProgress: no session — result not saved');
    return Promise.resolve({ ok: false, error: 'Not logged in' });
  }
  payload = payload || {};
  payload.token = session.token;

  return fetch(VC_LMS_URL + '/save-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function (r) { return r.json(); })
    .catch(function (err) {
      console.warn('vcSaveProgress failed:', err);
      return { ok: false, error: String(err) };
    });
}

/**
 * Awards cacao beans 🌱 for a lesson activity — ONCE per activity per device.
 * vcSaveBeans('std5-sci-wk01-vocab', 8, 10, { subject:'Science', lo_code:'SC1.09',
 *   activity_name:'Wk1 Vocabulary Match' });
 * - First-completion lock: localStorage key `vc-pts-<activityId>` blocks repeats.
 * - Logged out: resolves { ok:false, error:'Not logged in' } silently — the lesson
 *   continues; no lock is set, so beans can still be earned after a later login.
 * - Writes one Tab 2 row with activity_type 'lesson' (score = beans earned,
 *   max_score = beans possible). Never blocks the student on failure.
 */
function vcSaveBeans(activityId, beans, maxBeans, meta) {
  var lockKey = 'vc-pts-' + activityId;
  try {
    if (localStorage.getItem(lockKey)) {
      return Promise.resolve({ ok: false, locked: true });
    }
  } catch (e) { /* storage unavailable — proceed */ }

  var session = vcGetSession();
  if (!session) {
    return Promise.resolve({ ok: false, error: 'Not logged in' });
  }
  meta = meta || {};
  return vcSaveProgress({
    subject:       meta.subject       || 'Science',
    lo_code:       meta.lo_code       || '',
    activity_type: 'lesson',
    activity_name: meta.activity_name || activityId,
    /* lesson_key groups every activity of ONE lesson so the backend can enforce
       the per-lesson bean cap. NEVER use lo_code for this — one outcome can span
       two weeks (SC1.11 = Wks 3 & 4), which would merge two lessons' budgets. */
    lesson_key:    meta.lesson_key    || '',
    score:         beans,
    max_score:     maxBeans
  }).then(function (res) {
    if (res && res.ok) {
      /* The SERVER decides how many beans were actually banked — it may have
         trimmed the award to fit the per-lesson cap. Store what it granted,
         not what the page asked for, so a reload restores the truth. */
      var granted = (res.awarded != null) ? Number(res.awarded) : beans;
      res.granted = granted;
      try { localStorage.setItem(lockKey, JSON.stringify({ b: granted, t: Date.now() })); } catch (e) {}
    }
    return res;
  });
}

/**
 * Fetches the class leaderboard: 4 team bean totals, class total, class goal.
 * Works logged OUT too (public class data). When logged in, the response also
 * includes my_group — the student's own team.
 * Returns Promise of { ok, groups:[{group,beans}], class_total, class_goal, my_group? }
 */
function vcGetLeaderboard() {
  var session = vcGetSession();
  var payload = session ? { token: session.token } : {};
  return fetch(VC_LMS_URL + '/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function (r) { return r.json(); })
    .catch(function (err) {
      console.warn('vcGetLeaderboard failed:', err);
      return { ok: false, error: String(err) };
    });
}

/**
 * Fetches the Bean Store prize catalog (active prizes only).
 * Works logged OUT too (public catalog, no personal data).
 * Returns Promise of { ok, prizes:[{prize_name, cost, category, stock}] }.
 */
function vcGetPrizes() {
  return fetch(VC_LMS_URL + '/prizes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  })
    .then(function (r) { return r.json(); })
    .catch(function (err) {
      console.warn('vcGetPrizes failed:', err);
      return { ok: false, error: String(err) };
    });
}

/** Fetches all result rows for the logged-in student. Returns Promise of an array. */
function vcGetProgress() {
  var session = vcGetSession();
  if (!session) return Promise.reject(new Error('Not logged in'));

  return fetch(VC_LMS_URL + '/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: session.token })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok) throw new Error(data.error || 'Could not load progress');
      return data.results;
    });
}

/* ═══════════════════════════════════════════════════════════════
 *  GRADED RESULTS — submit with retry, no duplicates, recovery on return
 *  (Oct 3, 2026 · built once for every subject: Maths first, Science next)
 *
 *  Why: when a whole class submits at once, Google turns some saves away and the
 *  first try fails (Oct 2, 2026: several students needed "Try again"; anyone who
 *  left without the green message had no Sheet row). This helper:
 *   1. gives each submitted result ONE attempt_id. The VC-LMS Apps Script skips a
 *      save whose attempt_id is already in 'All Results' (column M), so a retry can
 *      never record the same result twice — even when the first reply was lost.
 *   2. stores the result on THIS device, under the signed-in student's own name,
 *      BEFORE the first try (localStorage "vc-unsent::<username>"), so two students
 *      on one computer never overwrite each other's unsent result.
 *   3. retries a busy/unreachable record book 3 times over about 20 seconds, each
 *      device waiting a slightly different time so a class does not retry in step.
 *   4. drops the stored copy only when the record book confirms the save.
 *
 *  Use (a page that logs a graded result):
 *    vcSubmitResult({ subject, lo_code, activity_type, activity_name, score, max_score,
 *                     ai_feedback, attempt_id }, { onRetry: function (n, of) {…} })
 *      → Promise of { ok:true, percent, duplicate? }  or  { ok:false, queued:true, error }
 *      attempt_id is optional — pass one you saved with the result on the device so a
 *      later recovery reuses it; otherwise one is made (vcNewAttemptId()).
 *    vcSendUnsent()        → sends every result this student still has waiting on this device
 *                            (the "Try again" button). Promise of { ok, sent, left }.
 *    vcRecoverResult({ activity_name, payload })
 *                          → for a result kept on the device (lock screen): sends the waiting
 *                            queue, then checks the record book; if no row with this
 *                            activity_name exists, sends payload once. Promise of
 *                            { status:'saved' | 'recovered' | 'unsent' | 'unknown' | 'not-signed-in' }.
 *                            'unknown' = the record book could not be checked → nothing sent.
 *  Lessons and beans keep using vcSaveProgress / vcSaveBeans (unchanged).
 * ═══════════════════════════════════════════════════════════════ */
var VC_UNSENT_PREFIX     = 'vc-unsent::';
var VC_SAVE_RETRY_DELAYS = [3000, 6000, 10000];   /* 3 automatic retries ≈ 20 s (each ±40%) */
var VC_SAVE_TIMEOUT_MS   = 20000;                 /* one try gives up after 20 s */

/** A new id for ONE submitted result: "<username>-<time>-<random>". */
function vcNewAttemptId() {
  var s = vcGetSession(), u = (s && s.username) ? s.username : 'guest', r = '';
  try {
    if (window.crypto && window.crypto.getRandomValues) {
      var a = new Uint32Array(2); window.crypto.getRandomValues(a);
      r = a[0].toString(36) + a[1].toString(36);
    }
  } catch (e) { /* fall back below */ }
  if (!r) r = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return u + '-' + Date.now().toString(36) + '-' + r;
}

function vcUnsentKey_(u) { return VC_UNSENT_PREFIX + u; }
function vcUnsentRead_(u) {
  try { var a = JSON.parse(localStorage.getItem(vcUnsentKey_(u)) || '[]'); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function vcUnsentWrite_(u, list) {
  try {
    if (list.length) localStorage.setItem(vcUnsentKey_(u), JSON.stringify(list.slice(-20)));
    else localStorage.removeItem(vcUnsentKey_(u));
  } catch (e) { /* storage full or blocked — the send itself still goes ahead */ }
}
function vcUnsentPut_(u, item) {
  var list = vcUnsentRead_(u).filter(function (x) { return x && x.attempt_id !== item.attempt_id; });
  list.push(item); vcUnsentWrite_(u, list);
}
function vcUnsentDrop_(u, id) {
  vcUnsentWrite_(u, vcUnsentRead_(u).filter(function (x) { return x && x.attempt_id !== id; }));
}
/** The results the signed-in student still has waiting on this device (payload copies). */
function vcUnsent() {
  var s = vcGetSession(); if (!s) return [];
  return vcUnsentRead_(s.username).map(function (x) { return x.payload; });
}

function vcWait_(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }

/* Retry only when the record book was busy or unreachable — never for a bad session. */
function vcRetryable_(err) {
  err = String(err || '');
  return !err || /backend unreachable|server error|busy|timed? ?out|time-?out|too many|rate limit|quota|service invoked|failed to fetch|network|abort/i.test(err);
}

/* ONE try of /save-result with a timeout. Never throws. */
function vcPostSave_(body) {
  var ctl = (typeof AbortController === 'function') ? new AbortController() : null;
  var timer = ctl ? setTimeout(function () { ctl.abort(); }, VC_SAVE_TIMEOUT_MS) : null;
  return fetch(VC_LMS_URL + '/save-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: ctl ? ctl.signal : undefined
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (timer) clearTimeout(timer);
      d = d || {};
      if (!d.ok) d.retry = vcRetryable_(d.error);
      return d;
    })
    .catch(function (err) {
      if (timer) clearTimeout(timer);
      return { ok: false, retry: true, error: String((err && err.message) || err) };
    });
}

/* Sends one stored item for user u (only while u is the signed-in student). */
function vcSendItem_(u, item) {
  var s = vcGetSession();
  if (!s || s.username !== u) return Promise.resolve({ ok: false, retry: false, error: 'Not logged in' });
  var body = {};
  for (var k in item.payload) if (Object.prototype.hasOwnProperty.call(item.payload, k)) body[k] = item.payload[k];
  body.token = s.token;
  body.attempt_id = item.attempt_id;
  return vcPostSave_(body).then(function (res) {
    if (res && res.ok) vcUnsentDrop_(u, item.attempt_id);
    return res;
  });
}

/** Saves ONE graded result: stored on the device first, retried, never written twice. */
function vcSubmitResult(payload, opts) {
  opts = opts || {};
  var s = vcGetSession();
  if (!s) return Promise.resolve({ ok: false, error: 'Not logged in' });
  var p = {};
  payload = payload || {};
  for (var k in payload) if (Object.prototype.hasOwnProperty.call(payload, k) && k !== 'token') p[k] = payload[k];
  p.attempt_id = String(p.attempt_id || vcNewAttemptId());
  var item = { attempt_id: p.attempt_id, payload: p, t: Date.now() };
  vcUnsentPut_(s.username, item);                       /* kept on THIS device before the first try */
  var delays = opts.retryDelays || VC_SAVE_RETRY_DELAYS, n = 0;
  function attempt() {
    return vcSendItem_(s.username, item).then(function (res) {
      if (res && res.ok) { res.attempt_id = item.attempt_id; return res; }
      if (res && res.retry && n < delays.length) {
        var wait = Math.round(delays[n] * (0.6 + Math.random() * 0.8));
        n++;
        if (typeof opts.onRetry === 'function') { try { opts.onRetry(n, delays.length, wait); } catch (e) {} }
        return vcWait_(wait).then(attempt);
      }
      return { ok: false, queued: true, attempt_id: item.attempt_id, error: (res && res.error) || 'save failed' };
    });
  }
  return attempt();
}

/** Sends every result the signed-in student still has waiting on this device. */
function vcSendUnsent() {
  var s = vcGetSession();
  if (!s) return Promise.resolve({ ok: false, sent: 0, left: 0, error: 'Not logged in' });
  var items = vcUnsentRead_(s.username), sent = 0, lastError = '';
  return items.reduce(function (chain, item) {
    return chain.then(function () {
      return vcSendItem_(s.username, item).then(function (r) {
        if (r && r.ok) sent++; else lastError = (r && r.error) || 'save failed';
      });
    });
  }, Promise.resolve()).then(function () {
    var left = vcUnsentRead_(s.username).length;
    return { ok: left === 0, sent: sent, left: left, error: left ? lastError : '' };
  });
}

/** Recovery on return — see the header above. opts: { activity_name, payload, retryDelays? } */
function vcRecoverResult(opts) {
  opts = opts || {};
  var s = vcGetSession();
  if (!s) return Promise.resolve({ status: 'not-signed-in' });
  var name = String(opts.activity_name || '').trim();
  return vcSendUnsent().then(function () {
    return vcGetProgress().then(function (rows) {
      var has = Array.isArray(rows) && rows.some(function (r) {
        return r && String(r.activity_name || '').trim() === name;
      });
      if (has) return { status: 'saved' };
      if (!opts.payload) return { status: 'unsent' };
      var p = {};
      for (var k in opts.payload) if (Object.prototype.hasOwnProperty.call(opts.payload, k)) p[k] = opts.payload[k];
      /* a result saved before attempt ids existed gets a FIXED id per student + activity,
         so even a repeat recovery can never add a second row */
      if (!p.attempt_id) p.attempt_id = 'rec-' + s.username + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return vcSubmitResult(p, { retryDelays: opts.retryDelays || [4000] }).then(function (res) {
        return res.ok ? { status: res.duplicate ? 'saved' : 'recovered', percent: res.percent }
                      : { status: 'unsent', error: res.error };
      });
    }, function (err) {
      return { status: 'unknown', error: String((err && err.message) || err) };   /* could not check → send nothing */
    });
  });
}
