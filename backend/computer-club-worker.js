/**
 * ═══════════════════════════════════════════════════════════════
 *  computer-club-records — Cloudflare Worker (Nov 6, 2026)
 *
 *  ⚠️ LOCAL MASTER COPY — mirrors the code deployed in the
 *  "computer-club-records" Worker (dash.cloudflare.com → Workers).
 *  NOT run by GitHub Pages. When you change the live Worker, update
 *  this file too (and vice versa).
 *
 *  Job: CORS + attach the secret key, then forward to the
 *  "Computer Club Backend" Apps Script. All real logic (PINs, tokens,
 *  badges, Sheet writes) lives in Apps Script — same pattern as edlo-lms,
 *  but a separate Worker so the club can never break class logins or grading.
 *
 *  Routes (POST, body = JSON sent as text/plain so the browser skips the preflight):
 *    /status · /roster · /signin · /save-result · /save-typing · /me · /leaderboard · /standings
 *    /teacher-data · /teacher-standings · /set-session · /set-access
 *  GET /ping  → health check
 *
 *  Secrets (Worker → Settings → Variables and Secrets):
 *    APPS_SCRIPT_URL → the Apps Script web app /exec URL
 *    APPS_SCRIPT_KEY → must match API_KEY in the Apps Script's Script Properties
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
  '/status': 'status', '/roster': 'roster', '/signin': 'signin', '/save-result': 'save-result',
  '/save-typing': 'save-typing', '/me': 'me', '/leaderboard': 'leaderboard', '/standings': 'standings',
  '/teacher-data': 'teacher-data', '/teacher-standings': 'teacher-standings', '/set-session': 'set-session', '/set-access': 'set-access'
};

const MAX_BODY = 8000;   // bytes — every real request is far smaller

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);

    if (request.method === 'GET' && (url.pathname === '/ping' || url.searchParams.get('action') === 'ping')) {
      return json(await callAppsScript(env, { action: 'ping' }), cors);
    }

    const action = ROUTES[url.pathname];
    if (!action || request.method !== 'POST') return json({ ok: false, error: 'Not found' }, cors, 404);

    // Only pages on the class website may call the club backend.
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ ok: false, error: 'Forbidden' }, cors, 403);

    const text = await request.text();
    if (text.length > MAX_BODY) return json({ ok: false, error: 'Request too large' }, cors, 413);

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ ok: false, error: 'Invalid JSON body' }, cors, 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ ok: false, error: 'Invalid JSON body' }, cors, 400);
    }

    delete body.key;          // never let the browser smuggle in a key
    body.action = action;
    return json(await callAppsScript(env, body), cors);
  }
};

async function callAppsScript(env, payload) {
  if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_KEY) {
    return { ok: false, error: 'Club backend is not set up yet' };
  }
  payload.key = env.APPS_SCRIPT_KEY;
  try {
    const res = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'      // Apps Script replies via a 302 redirect
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
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(obj, cors, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  });
}
