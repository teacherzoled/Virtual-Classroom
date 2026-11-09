// Minimal Google Apps Script mock that runs the real .gs file in a vm context.
const fs = require('fs'), vm = require('vm'), crypto = require('crypto');

function makeSheet(name) {
  const rows = [];
  const sh = {
    name, rows,
    getLastRow: () => rows.length,
    appendRow: r => { rows.push(r.slice()); },
    getDataRange: () => ({ getValues: () => rows.map(r => r.slice()) }),
    getRange: (r, c, nr = 1, nc = 1) => ({
      getValues: () => { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) row.push((rows[r - 1 + i] || [])[c - 1 + j] ?? ''); o.push(row); } return o; },
      setValue: v => { while (rows.length < r) rows.push([]); rows[r - 1][c - 1] = v; },
      setValues: vs => vs.forEach((row, i) => row.forEach((v, j) => { while (rows.length < r + i) rows.push([]); rows[r - 1 + i][c - 1 + j] = v; })),
      setFormulas: fs => fs.forEach((row, i) => row.forEach((v, j) => { while (rows.length < r + i) rows.push([]); rows[r - 1 + i][c - 1 + j] = v; })),
      setFontWeight: () => {}
    }),
    setFrozenRows: () => {}
  };
  return sh;
}

function createGas(gsPath, props) {
  const sheets = {};
  const ss = {
    getSheetByName: n => sheets[n] || null,
    insertSheet: n => (sheets[n] = makeSheet(n)),
    getSheets: () => Object.values(sheets),
    deleteSheet: s => { delete sheets[s.name]; }
  };
  const cache = {};
  const ctx = {
    console,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null }) },
    CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = String(v); }, remove: k => { delete cache[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Logger: { log: m => ctx._log.push(m) }, _log: [],
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: t => ({ text: t, setMimeType() { return this; } }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (alg, text) => Array.from(crypto.createHash('sha256').update(text, 'utf8').digest()).map(b => b > 127 ? b - 256 : b),
      base64EncodeWebSafe: s => Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
      base64DecodeWebSafe: s => Array.from(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')),
      newBlob: bytes => ({ getDataAsString: () => Buffer.from(bytes.map(b => (b + 256) % 256)).toString('utf8') }),
      formatDate: (d, tz, fmt) => {
        const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belize', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d).reduce((a, x) => (a[x.type] = x.value, a), {});
        return fmt.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', p.hour === '24' ? '00' : p.hour).replace('mm', p.minute).replace('ss', p.second);
      }
    }
  };
  ctx.Date = Date;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(gsPath, 'utf8'), ctx, { filename: 'Computer-Club-Backend.gs' });
  ctx.post = body => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).text);
  ctx.sheets = sheets;
  ctx.cache = cache;
  return ctx;
}
module.exports = { createGas };
