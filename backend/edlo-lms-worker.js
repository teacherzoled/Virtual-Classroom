/**
 * ═══════════════════════════════════════════════════════════════
 *  edlo-lms — Cloudflare Worker (dedicated LMS proxy)
 *  Routes:  POST /login  ·  POST /save-result  ·  POST /progress
 *           POST /leaderboard · POST /teacher-data · POST /award-bonus
 *           POST /prizes · POST /redeem-prize
 *           GET or POST /lesson-locks   (PUBLIC — read released weeks, no auth)
 *           POST /set-lesson-locks      (teacher_code required)
 *           GET  /?action=ping   (health check)
 *
 *  ⚠️ LOCAL MASTER COPY — mirrors the code deployed in the "edlo-lms"
 *  Cloudflare Worker (dash.cloudflare.com → Workers → edlo-lms). It is
 *  NOT run by GitHub Pages; it is the source of truth so future edits start
 *  from here and produce a complete file to paste back.
 *  When you change the live Worker, update this file too (and vice versa).
 *  Last synced: July 19, 2026 (added lesson unlock routes — IDEAS #8).
 *
 *  Job: add CORS + attach the secret API key, then forward the
 *  request to the Google Apps Script backend. All real logic
 *  (passwords, tokens, Sheet writes) lives in Apps Script.
 *
 *  Secrets required (Worker > Settings > Variables and Secrets):
 *    APPS_SCRIPT_URL → your Apps Script web app /exec URL
 *    APPS_SCRIPT_KEY → must match API_KEY in Apps Script properties
 * ═══════════════════════════════════════════════════════════════
 */

const ALLOWED_ORIGINS = [
  'https://edlovirtualclassroom.com',
  'https://www.edlovirtualclassroom.com',
  'https://teacherzoled.github.io',
  'http://localhost:5500',           // VS Code Live Server testing
  'http://127.0.0.1:5500'
];

const ROUTES = {
  '/login': 'login', '/save-result': 'save-result', '/progress': 'progress',
  '/leaderboard': 'leaderboard', '/teacher-data': 'teacher-data', '/award-bonus': 'award-bonus',
  '/prizes': 'prizes', '/redeem-prize': 'redeem-prize',
  '/lesson-locks': 'lesson-locks', '/set-lesson-locks': 'set-lesson-locks'
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // Health check: GET /?action=ping  or  GET /ping
    if (request.method === 'GET' && (url.searchParams.get('action') === 'ping' || url.pathname === '/ping')) {
      const upstream = await callAppsScript(env, { action: 'ping' });
      return json(upstream, cors);
    }

    // PUBLIC read: GET /lesson-locks — hub pages call this while logged OUT.
    // Allowed as a GET so the browser can cache it; no body, no auth, no token.
    if (request.method === 'GET' && url.pathname === '/lesson-locks') {
      const upstream = await callAppsScript(env, { action: 'lesson-locks' });
      return json(upstream, cors);
    }

    // LMS routes
    const action = ROUTES[url.pathname];
    if (!action || request.method !== 'POST') {
      return json({ ok: false, error: 'Not found' }, cors, 404);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'Invalid JSON body' }, cors, 400);
    }

    // Never allow the client to smuggle in a key
    delete body.key;
    body.action = action;

    const upstream = await callAppsScript(env, body);
    return json(upstream, cors);
  }
};

async function callAppsScript(env, payload) {
  payload.key = env.APPS_SCRIPT_KEY;
  try {
    const res = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow' // Apps Script replies via 302 redirect
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: 'Backend unreachable: ' + err.message };
  }
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(obj, cors, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  });
}
