/**
 * ═══════════════════════════════════════════════════════════════
 *  edlo-lms — Cloudflare Worker (dedicated LMS proxy)
 *  Routes:  POST /login  ·  POST /save-result  ·  POST /progress
 *           POST /leaderboard · POST /teacher-data · POST /award-bonus
 *           POST /prizes · POST /redeem-prize
 *           GET or POST /lesson-locks   (PUBLIC — read released weeks, no auth)
 *           POST /set-lesson-locks      (teacher_code required)
 *           POST /load-state · POST /save-state   (lesson progress — D1, NOT Apps Script)
 *           GET  /?action=ping   (health check)
 *
 *  ⚠️ LOCAL MASTER COPY — mirrors the code deployed in the "edlo-lms"
 *  Cloudflare Worker (dash.cloudflare.com → Workers → edlo-lms). It is
 *  NOT run by GitHub Pages; it is the source of truth so future edits start
 *  from here and produce a complete file to paste back.
 *  When you change the live Worker, update this file too (and vice versa).
 *  Last synced: July 19, 2026 (added lesson unlock routes — IDEAS #8).
 *  Oct 24, 2026: lesson-progress routes /load-state + /save-state written —
 *  LIVE ONLY once Edwin pastes this file and adds the D1 binding + secret below.
 *
 *  Job: add CORS + attach the secret API key, then forward the
 *  request to the Google Apps Script backend. All real logic
 *  (passwords, tokens, Sheet writes) lives in Apps Script.
 *
 *  Secrets required (Worker > Settings > Variables and Secrets):
 *    APPS_SCRIPT_URL → your Apps Script web app /exec URL
 *    APPS_SCRIPT_KEY → must match API_KEY in Apps Script properties
 *    SESSION_SECRET  → EXACT copy of SESSION_SECRET in the Apps Script's Script
 *                      Properties. The Worker checks the student's sign-in token
 *                      itself for the progress routes (same signature as
 *                      checkToken() in VC-LMS-Backend.gs).
 *  Binding required for the progress routes (Worker > Settings > Bindings):
 *    D1 database, variable name DB  → database "edlo-lms-db", table lesson_state:
 *      CREATE TABLE IF NOT EXISTS lesson_state (username TEXT NOT NULL, lesson_key TEXT NOT NULL, state TEXT NOT NULL, rev INTEGER NOT NULL DEFAULT 1, updated_at INTEGER NOT NULL, PRIMARY KEY (username, lesson_key));
 *  Without DB or SESSION_SECRET those two routes answer 503 and every lesson
 *  page simply keeps working from the browser copy, as before.
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

    // Lesson progress (D1) — answered here, never forwarded to Apps Script
    if (request.method === 'POST' && (url.pathname === '/load-state' || url.pathname === '/save-state')) {
      return handleLessonState(url.pathname, request, env, cors);
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

// ─────────────────────────────────────────────
// LESSON PROGRESS (Oct 24, 2026)
//   /load-state { token, lesson }  → { ok, found, rev, state, beans, savedAt }
//   /save-state { token, lesson, state (string|null), beans {key:value}, baseRev, force, savedAt }
//               → { ok, rev }  ·  { ok:false, conflict:true, rev }  when another computer saved first
// The username comes from the signed token, never from the request.
// ─────────────────────────────────────────────
const STATE_MAX_BYTES = 200000;
const LESSON_KEY_RE = /^[A-Za-z0-9._:-]{1,100}$/;

async function handleLessonState(path, request, env, cors) {
  if (!env.DB || !env.SESSION_SECRET) {
    return json({ ok: false, error: 'Progress storage is not set up yet' }, cors, 503);
  }
  let body;
  try {
    body = JSON.parse(await request.text());      // pages send text/plain (no CORS preflight)
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, cors, 400);
  }
  const who = await verifyToken(body && body.token, env.SESSION_SECRET);
  if (!who.ok) return json({ ok: false, auth: true, error: who.error }, cors, 401);

  const lesson = String((body && body.lesson) || '');
  if (!LESSON_KEY_RE.test(lesson)) return json({ ok: false, error: 'Bad lesson key' }, cors, 400);

  const row = await env.DB.prepare(
    'SELECT state, rev FROM lesson_state WHERE username = ?1 AND lesson_key = ?2'
  ).bind(who.username, lesson).first();
  const saved = row ? parseStored(row.state) : null;

  if (path === '/load-state') {
    if (!row) return json({ ok: true, found: false }, cors);
    return json({ ok: true, found: true, rev: row.rev, state: saved.s, beans: saved.b, savedAt: saved.t }, cors);
  }

  // /save-state
  const state = body.state;
  if (state !== null && typeof state !== 'string') return json({ ok: false, error: 'Bad state' }, cors, 400);
  const beans = Object.assign({}, saved ? saved.b : {});       // bean locks only ever ADD up
  if (body.beans && typeof body.beans === 'object') {
    for (const [k, v] of Object.entries(body.beans).slice(0, 200)) {
      if (k.startsWith('vc-pts-') && k.length <= 200 && typeof v === 'string' && v.length <= 300) beans[k] = v;
    }
  }
  const stored = JSON.stringify({ s: state, b: beans, t: Number(body.savedAt) || Date.now() });
  if (stored.length > STATE_MAX_BYTES) return json({ ok: false, error: 'Saved work is too large' }, cors, 413);

  const now = Date.now();
  const base = Number(body.baseRev) || 0;
  let res;
  if (body.force) {
    res = await env.DB.prepare(
      'INSERT INTO lesson_state (username, lesson_key, state, rev, updated_at) VALUES (?1, ?2, ?3, 1, ?4) ' +
      'ON CONFLICT (username, lesson_key) DO UPDATE SET state = excluded.state, rev = lesson_state.rev + 1, updated_at = excluded.updated_at ' +
      'RETURNING rev'
    ).bind(who.username, lesson, stored, now).first();
  } else {
    // Only overwrite the version this computer last saw; otherwise report a conflict.
    res = await env.DB.prepare(
      'INSERT INTO lesson_state (username, lesson_key, state, rev, updated_at) VALUES (?1, ?2, ?3, 1, ?4) ' +
      'ON CONFLICT (username, lesson_key) DO UPDATE SET state = excluded.state, rev = lesson_state.rev + 1, updated_at = excluded.updated_at ' +
      'WHERE lesson_state.rev = ?5 RETURNING rev'
    ).bind(who.username, lesson, stored, now, base).first();
  }
  if (!res) return json({ ok: false, conflict: true, rev: row ? row.rev : 0 }, cors, 409);
  return json({ ok: true, rev: res.rev }, cors);
}

function parseStored(text) {
  try {
    const o = JSON.parse(text);
    return { s: (typeof o.s === 'string') ? o.s : null, b: (o.b && typeof o.b === 'object') ? o.b : {}, t: Number(o.t) || 0 };
  } catch {
    return { s: null, b: {}, t: 0 };
  }
}

// Same token as Apps Script makeToken(): base64url("username|expires") + "." + hex(SHA-256(payload + "::" + SESSION_SECRET))
async function verifyToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return { ok: false, error: token ? 'Invalid session' : 'Not logged in' };
  let payload;
  try {
    let b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    payload = new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)));
  } catch {
    return { ok: false, error: 'Invalid session' };
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload + '::' + secret));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (!sameText(hex, parts[1])) return { ok: false, error: 'Invalid session' };
  const bar = payload.lastIndexOf('|');
  const username = payload.slice(0, bar), expires = Number(payload.slice(bar + 1));
  if (bar < 1 || !username) return { ok: false, error: 'Invalid session' };
  if (!(Date.now() <= expires)) return { ok: false, error: 'Session expired. Please log in again.' };
  return { ok: true, username };
}

function sameText(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

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
