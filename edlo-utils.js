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

/* ═══════════════════════════════════════════════════════════════
 *  LESSON PROGRESS ON THE STUDENT'S ACCOUNT  (Oct 24, 2026 · CS lessons first)
 *
 *  Why: lesson pages kept progress ONLY in this browser. School computers wipe
 *  browser data when a student logs off Windows, and a student may sit at a
 *  different computer next class, so the lesson started over. Signed-in work is
 *  now also kept on the server: edlo-lms Worker → Cloudflare D1 (table
 *  lesson_state). These routes never touch Apps Script or the Sheet, so they
 *  cannot slow down quiz or bean saves.
 *
 *  Use on a lesson page, AFTER STORE_KEY is set and BEFORE the saved work is read:
 *    const SYNC = (SESSION && !PREVIEW && typeof vcLessonSync === "function")
 *      ? vcLessonSync({ lessonKey: STORE_BASE, storeKey: STORE_KEY,
 *                       beanPrefix: () => "vc-pts-" + LESSON.idBase + "-", beanSuffix: "-" + WHO })
 *      : null;
 *    save()       → if (SYNC && SYNC.isStale()) return;  … then after writing localStorage: if (SYNC) SYNC.touch();
 *    part opens   → if (SYNC) SYNC.now();
 *    teacher reset→ SYNC.clear().then(() => location.reload())
 *
 *  How it decides:
 *   • The browser copy stays the instant save. The server copy is sent at most once
 *     a minute while work changes, at once on SYNC.now(), and when the tab is hidden
 *     or the page closes (switching to Code.org counts).
 *   • Opening the lesson asks the server first. No copy on this computer → the
 *     account copy is written here and the page reloads once ("Loading your saved
 *     work…" covers the page meanwhile). Same version → nothing to do.
 *   • Each save carries the version it was based on (rev). If another computer saved
 *     in between, the copy that is FURTHER ALONG (parts visited, quiz passed) wins —
 *     never the school computer's clock — but a teacher reset beats older waiting work.
 *   • Same lesson in two tabs: the older tab freezes (SYNC.isStale()) and saves nothing.
 *   • The bean locks (vc-pts-…) travel with the work, so a wiped computer cannot
 *     pay the same beans twice.
 *   • Guests and teacher preview: not used (their work stays on this device).
 *   • No server, offline or old Worker → the page works exactly as before.
 * ═══════════════════════════════════════════════════════════════ */
var VC_STATE_THROTTLE_MS = 60000;
var VC_STATE_BOOT_WAIT_MS = 6000;

function vcLessonSync(opts) {
  opts = opts || {};
  var session = vcGetSession();
  if (!session || !opts.lessonKey || !opts.storeKey) return null;

  var lessonKey = String(opts.lessonKey), storeKey = String(opts.storeKey);
  var metaKey = storeKey + '::sync', guardKey = 'vc-sync-reload::' + storeKey;
  var token = session.token;
  var stopped = false, booted = false, lastPush = 0, timer = 0, inFlight = null, again = false;
  var preTouched = false;
  var staleTab = false;     /* the lesson changed in another tab: this tab must not save over it */   /* the page saved while the account was still being asked (its own start-up) */
  var overlay = null, overlayTimer = 0, bootTimer = 0;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function meta() { try { return JSON.parse(get(metaKey) || 'null') || {}; } catch (e) { return {}; } }
  function setMeta(m) { put(metaKey, JSON.stringify(m)); }
  /* Short fingerprint of a saved copy, so an unchanged save sends nothing. */
  function sig(raw) {
    if (raw === null || raw === undefined) return '';
    var h = 0x811c9dc5;
    for (var i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return raw.length + ':' + h.toString(16);
  }

  /* How far along a saved copy is — used only when two computers both changed it. */
  function score(raw) {
    if (typeof opts.score === 'function') { try { return opts.score(raw); } catch (e) {} }
    if (raw === null || raw === undefined) return -1;
    try {
      var s = JSON.parse(raw) || {}, q = s.quiz || {};
      return (s.visited ? Object.keys(s.visited).length : 0) * 10 + (q.passed ? 100 : 0)
           + (q.attempts ? 5 : 0);
    } catch (e) { return -1; }
  }

  function beanKeys() {
    var p = typeof opts.beanPrefix === 'function' ? opts.beanPrefix() : (opts.beanPrefix || '');
    var s = opts.beanSuffix || '', out = {};
    if (!p) return out;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(p) === 0 && (!s || k.slice(-s.length) === s)) out[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }
  function restoreBeans(b) {
    if (!b || typeof b !== 'object') return;
    for (var k in b) {
      if (Object.prototype.hasOwnProperty.call(b, k) && k.indexOf('vc-pts-') === 0
          && typeof b[k] === 'string' && b[k].length < 300 && get(k) === null) put(k, b[k]);
    }
  }

  function post(path, body, keepalive) {
    var text = JSON.stringify(body);
    /* text/plain keeps this a "simple" request: no CORS preflight, and keepalive works on page close */
    return fetch(VC_LMS_URL + path, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: text,
      keepalive: !!keepalive && text.length < 60000
    }).then(function (r) {
      return r.json().then(function (j) { j = j || {}; j.status = r.status; return j; });
    });
  }
  /* 404 = the Worker has no progress routes yet · 503 = D1 not set up → stop asking this visit */
  function unavailable(res) { return !!res && (res.status === 404 || res.status === 503); }

  function showOverlay() {
    if (overlay || !document.body) return;
    overlay = document.createElement('div');
    overlay.id = 'vcSyncOverlay';
    overlay.setAttribute('role', 'status');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;'
      + 'background:rgba(10,20,40,.72);padding:16px';
    overlay.innerHTML = '<div style="background:#fff;color:#1a2433;border-radius:16px;padding:22px 26px;max-width:340px;'
      + 'text-align:center;font:700 1.05rem/1.4 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35)">'
      + '⏳ Loading your saved work…<div style="font-weight:500;font-size:.9rem;margin-top:6px">One moment, please.</div></div>';
    document.body.appendChild(overlay);
  }
  function hideOverlay() {
    clearTimeout(overlayTimer); clearTimeout(bootTimer);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  /* Write the account copy here and reload once (never loops). */
  function takeServer(srv) {
    /* The account copy was cleared (teacher reset) and this page already opened blank → nothing to show. */
    if (srv.state === null && !hadLocal) {
      setMeta({ rev: srv.rev, dirty: false, savedAt: srv.savedAt || 0, sig: '' });
      hideOverlay(); return;
    }
    var last = 0;
    try { last = Number(sessionStorage.getItem(guardKey)) || 0; } catch (e) {}
    if (Date.now() - last < 15000) {
      /* Just reloaded and the account still differs: never reload twice. Stop syncing for this visit so the
         copy on screen cannot overwrite the account; the next visit decides again. */
      stopped = true; hideOverlay(); return;
    }
    try { sessionStorage.setItem(guardKey, String(Date.now())); } catch (e) {}
    setMeta({ rev: srv.rev, dirty: false, savedAt: srv.savedAt || 0, sig: sig(srv.state) });
    if (srv.state === null) del(storeKey); else put(storeKey, srv.state);
    showOverlay();
    location.reload();
  }

  /* Compare the account copy with this computer's copy and act. */
  function settle(res, quietLocal) {
    if (!res || !res.ok) {
      if (res && (res.auth || unavailable(res))) stopped = true;   /* signed out / not set up: stay local */
      hideOverlay(); return;
    }
    var local = get(storeKey), m = meta();
    if (!res.found) {                               /* nothing on the account yet */
      hideOverlay();
      if (m.pendingClear) { delete m.pendingClear; setMeta(m); }   /* nothing there to clear */
      /* work saved here before this feature existed → put it on the account (a brand-new page sends nothing) */
      if (local !== null && hadLocal) { m.dirty = true; setMeta(m); push({ boot: true }); }
      return;
    }
    var srv = { rev: Number(res.rev) || 0, state: (typeof res.state === 'string') ? res.state : null, savedAt: res.savedAt };
    restoreBeans(res.beans);
    /* A teacher reset that did not reach the account last time: send it now, never bring the work back. */
    if (m.pendingClear) { hideOverlay(); push({ clear: true, force: true, boot: true }); return; }
    if (local === null || quietLocal) return takeServer(srv);
    /* This computer's last save DID arrive (e.g. sent as the page closed, reply never seen):
       same content or same save time → just adopt the account's version number. */
    if (m.rev !== srv.rev && (sig(local) === sig(srv.state) || (m.savedAt && m.savedAt === Number(srv.savedAt)))) {
      m.rev = srv.rev; m.dirty = false; m.sig = sig(srv.state);
      if (sig(local) !== m.sig) m.dirty = true;     /* changed again after that save → send it */
      setMeta(m); hideOverlay();
      if (m.dirty) push({ boot: true });
      return;
    }
    if (m.rev === srv.rev) {
      hideOverlay();
      if (m.dirty || (preTouched && sig(local) !== m.sig)) { m.dirty = true; setMeta(m); push({ boot: true }); }
      return;
    }
    if (typeof m.rev === 'number' && m.rev > srv.rev) { hideOverlay(); m.dirty = true; setMeta(m); push({ force: true, boot: true }); return; }
    /* The account changed on another computer since this one last synced. */
    if (typeof m.rev === 'number' && !m.dirty) return takeServer(srv);
    /* …and that change was a TEACHER RESET: the reset wins over older work still waiting on this computer. */
    if (srv.state === null) return takeServer(srv);
    if (score(local) > score(srv.state)) { hideOverlay(); m.dirty = true; setMeta(m); push({ force: true, boot: true }); }
    else takeServer(srv);
  }

  function schedule(delay) {
    if (stopped || !booted || timer) return;
    var wait = (delay != null) ? delay : Math.max(0, lastPush + VC_STATE_THROTTLE_MS - Date.now());
    timer = setTimeout(function () { timer = 0; push(); }, wait);
  }

  function push(o) {
    o = o || {};
    if (stopped) return Promise.resolve();
    if (inFlight) { again = true; return inFlight; }
    var m = meta();
    if (!m.dirty && !o.force && !o.clear) return Promise.resolve();
    var sentAt = m.savedAt, raw = o.clear ? null : get(storeKey);
    var afterClear = o.clear || !!m.pendingClear;   /* sent after the reset was asked for */
    var body = {
      token: token, lesson: lessonKey, state: raw, beans: beanKeys(),
      baseRev: (typeof m.rev === 'number') ? m.rev : 0, force: !!o.force, savedAt: m.savedAt || Date.now()
    };
    if (!o.boot) lastPush = Date.now();   /* a start-up sync does not use up the once-a-minute slot */
    inFlight = post('/save-state', body, o.keepalive).then(function (res) {
      inFlight = null;
      if (res && res.ok) {
        var m2 = meta(); m2.rev = Number(res.rev);
        if (afterClear) delete m2.pendingClear;     /* the old work is gone from the account */
        if (m2.savedAt === sentAt) { m2.dirty = false; m2.sig = sig(raw); }
        setMeta(m2);
      } else if (res && res.conflict) {
        return post('/load-state', { token: token, lesson: lessonKey }).then(function (r) { settle(r, false); }, function () {});
      } else if (res && (res.auth || unavailable(res))) {
        stopped = true;
      } else {
        schedule(VC_STATE_THROTTLE_MS);           /* server said no (or old Worker): try again later */
      }
      if (again) { again = false; schedule(); }
    }, function () {
      inFlight = null; again = false;
      schedule(VC_STATE_THROTTLE_MS);             /* offline: keep the work here, try again in a minute */
    });
    return inFlight;
  }

  function flush() {
    if (stopped || !booted) return;
    if (timer) { clearTimeout(timer); timer = 0; }
    var m = meta();
    if (!m.dirty) return;
    if (!inFlight) { push({ keepalive: true }); return; }
    /* A save is still on its way and the page is closing: send the newest copy too. It is forced, so
       whichever of the two arrives first, the account ends with this newest copy (the older save, if it
       arrives second, is refused as out of date). */
    try {
      post('/save-state', { token: token, lesson: lessonKey, state: get(storeKey), beans: beanKeys(),
        baseRev: (typeof m.rev === 'number' ? m.rev : 0), force: true, savedAt: m.savedAt || Date.now() }, true)
        ['catch'](function () {});
    } catch (e) {}
  }

  /* ---- Boot: ask the account first ---- */
  var hadLocal = get(storeKey) !== null;
  /* Cover the page while the account answers (only if it takes more than 0.3 s), so nothing the student
     does in that moment can be thrown away by a reload. */
  overlayTimer = setTimeout(showOverlay, 300);
  var gaveUp = false;
  bootTimer = setTimeout(function () { gaveUp = true; hideOverlay(); }, VC_STATE_BOOT_WAIT_MS);
  var ready = post('/load-state', { token: token, lesson: lessonKey }).then(function (res) {
    booted = true;
    /* Answer came in time and this computer had no copy → the account copy wins outright. */
    settle(res, !hadLocal && !gaveUp && res && res.ok && res.found);
  }, function () {
    booted = true; hideOverlay();                 /* offline: work locally; saves retry later */
    var m = meta(); if (preTouched) { m.dirty = true; setMeta(m); }
    if (m.dirty) schedule(VC_STATE_THROTTLE_MS);
  });

  /* The same lesson changed in ANOTHER tab or window of this browser: this tab's copy is now old.
     Stop sending it (it would overwrite the newer work) and ask the student to reload. */
  window.addEventListener('storage', function (e) {
    if (e.key !== storeKey || staleTab) return;
    staleTab = true; stopped = true;
    if (timer) { clearTimeout(timer); timer = 0; }
    if (!document.body || document.getElementById('vcSyncStale')) return;
    var d = document.createElement('div');
    d.id = 'vcSyncStale'; d.setAttribute('role', 'alert');
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;'
      + 'background:rgba(10,20,40,.72);padding:16px';
    d.innerHTML = '<div style="background:#fff;color:#1a2433;border-radius:16px;padding:22px 26px;max-width:360px;'
      + 'text-align:center;font:700 1.05rem/1.4 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35)">'
      + 'This lesson is open in another tab.<div style="font-weight:500;font-size:.9rem;margin:6px 0 14px">'
      + 'Reload to see your newest work here.</div>'
      + '<button type="button" style="min-height:44px;padding:8px 20px;border-radius:10px;border:0;background:#1971c2;'
      + 'color:#fff;font:700 1rem system-ui,sans-serif;cursor:pointer">Reload</button></div>';
    d.querySelector('button').onclick = function () { location.reload(); };
    document.body.appendChild(d);
  });

  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);

  return {
    ready: ready,
    /** true once the lesson changed in another tab — the page must stop saving (its copy is old). */
    isStale: function () { return staleTab; },
    /** Call after every localStorage save of the lesson. */
    touch: function () {
      if (stopped) return;
      if (!booted) { preTouched = true; return; }   /* start-up saves: decided when the account answers */
      var m = meta();
      if (!m.dirty && sig(get(storeKey)) === m.sig) return;   /* saved, but nothing changed */
      m.dirty = true; m.savedAt = Date.now(); setMeta(m);
      schedule();
    },
    /** Send now (a part just opened, a quiz attempt finished). */
    now: function () {
      if (stopped || !booted) return;
      if (timer) { clearTimeout(timer); timer = 0; }
      push();
    },
    /** Teacher reset: clears the account copy too (bean locks stay). Resolves within 5 s either way. */
    clear: function () {
      var m = meta(); m.dirty = true; m.savedAt = Date.now(); m.pendingClear = true; setMeta(m);
      function go() { return push({ clear: true, force: true }); }
      var p = inFlight ? inFlight.then(go, go) : go();   /* wait for a save already on its way, then clear */
      /* If it is slow or fails, pendingClear stays set and the next opening sends the clear first. */
      return Promise.race([p, vcWait_(5000)]).then(function () {}, function () {});
    }
  };
}
