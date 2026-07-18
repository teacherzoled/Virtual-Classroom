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
    score:         beans,
    max_score:     maxBeans
  }).then(function (res) {
    if (res && res.ok) {
      /* Lock stores the beans earned so lesson pages can RESTORE the count on reload */
      try { localStorage.setItem(lockKey, JSON.stringify({ b: beans, t: Date.now() })); } catch (e) {}
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