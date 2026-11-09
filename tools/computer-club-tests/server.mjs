// Test server: static site on :5500 + the REAL Worker on :8787, whose Apps Script is the REAL .gs in a mock Sheet.
import http from 'http'; import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createGas } = require('./gas-mock.js');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
// Load the REAL Worker file (backend/computer-club-worker.js) as a module, so tests never use a stale copy.
const workerSrc = fs.readFileSync(ROOT + '/backend/computer-club-worker.js', 'utf8');
const worker = (await import('data:text/javascript;base64,' + Buffer.from(workerSrc).toString('base64'))).default;
const G = createGas(ROOT + '/backend/Computer-Club-Backend.gs', { API_KEY: 'k1', SESSION_SECRET: 'sec', TEACHER_CODE: 'TEACH42' });
G.setupSheet();
const S = G.sheets;
[['Ana R.', 'Ana Ramirez', 4, '1234'], ['Ben T.', 'Ben Tun', 6, '0042'], ['Carla M.', 'Carla Mai', 5, '5555'], ['Dev P.', 'Dev Pop', 4, '1111']]
  .forEach(r => S.Students.appendRow(['', r[0], r[1], r[2], r[3], '']));
G.prepareRoster();
S.Settings.rows.forEach(r => { if (r[0] === 'typingclub_url') r[1] = 'https://howardsmithnazarene.typingclub.com/signup/TESTCODE'; });
const APPS = 'https://script.google.com/macros/s/TEST/exec';
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (url === APPS) { const out = G.doPost({ postData: { contents: opts.body } }); return new Response(out.text, { headers: { 'Content-Type': 'application/json' } }); }
  return realFetch(url, opts);
};
const env = { APPS_SCRIPT_URL: APPS, APPS_SCRIPT_KEY: 'k1' };
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  if (req.url.startsWith('/__age_close')) { S.Settings.rows.forEach(r => { if (r[0] === 'club_open_until') r[1] = Date.now() - 31 * 60000; }); res.end('ok'); return; }
  if (req.url.startsWith('/__sheet')) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(Object.fromEntries(Object.entries(S).map(([k, v]) => [k, v.rows])))); return; }
  const r = await worker.fetch(new Request('http://worker' + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(8787);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(5500, () => console.log('ready'));
