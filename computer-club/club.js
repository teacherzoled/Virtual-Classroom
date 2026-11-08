/**
 * ═══════════════════════════════════════════════════════════════
 *  /computer-club/club.js — Computer Club shared helpers (Nov 6, 2026)
 *
 *  The ONE shared JS file for the club pages (the same exception as
 *  /edlo-utils.js: it exists only because sign-in and unsent results
 *  must carry from page to page). Every page's CSS and page JS stay inline.
 *
 *  Talks ONLY to the "computer-club-records" Worker — never to edlo-lms or
 *  edlo-gemini — so the club cannot affect class logins or grading.
 *
 *  localStorage keys (all start with cc-):
 *    cc-session            → { token, expires, id, name, standard }
 *    cc-unsent::<id>       → results waiting to be sent (per student)
 *    cc-shortcut-gold-best → Gold best for practice play while signed out
 *
 *  API:
 *    CC.session()                    → session object or null (expired = null)
 *    CC.signOut()
 *    CC.call(path, body)             → Promise<json>  (never throws; {ok:false,error} on failure)
 *    CC.submit(path, payload)        → Promise<{ok, queued?, badges?}> — keeps the result on this
 *                                      computer until the Worker confirms it (retry, no duplicates)
 *    CC.sendUnsent()                 → resend anything waiting
 *    CC.newAttemptId()
 *    CC.statusChip(el, nextUrl)      → fills el with "Signed in as …" or a Sign in button
 *    CC.toastBadges(badges)          → shows a badge pop-up
 *    CC.img(name, size) / CC.badgeIcon(badge, size) / CC.levelIcon(level, size)
 *                                    → <img> from /computer-club/assets/ (badge: emoji if no picture)
 *    CC.refreshProgress()            → reloads the live XP bar now (also runs every 60 s)
 *    CC.cachedStatus() / CC.clubStatus() → { club_open, open_until, open_missions[], week } (cached / fresh)
 *    CC.missionOpen(status, id)      → true only if the club is in session AND that mission is switched open
 *    CC.sound.click(kind) / .chime() / .toggle(buttonEl) → key click, soft time's-up chime, 🔊 on/off (cc-sound)
 *    CC.flash(title, sub)            → big flashing notice ("⏰ Time's up!"), closes itself after 9 s
 *    CC.timer.start(label, minutes, next) / .stop() → club countdown (cc-timer): a pill on every club page,
 *                                      the countdown in the tab name, and a floating window on top of every tab
 *                                      (call start() inside a click). Chime + flash + flashing tab name at the end.
 *
 *  OPEN/CLOSE: the teacher dashboard has a "Club in session" switch (3 hours, then it closes by itself)
 *  and one switch per mission. Pages lock themselves from /status (kept in cc-status); the Apps Script
 *  refuses sign-in, results and typing tests while closed anyway, so the page lock is only the front door.
 *
 *  LIVE XP BAR: on every club page a signed-in student sees a sticky bar under the theme bar:
 *  level, XP progress to the next level, rank ("#4 of 22") and the student just ahead.
 *  Each refresh also fires a 'cc-standings' event on window (detail = the /standings answer),
 *  so a page can draw boards without asking the Worker twice. Pages opt out with
 *  <body data-cc-no-bar> (the teacher dashboard does).
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  var API = 'https://computer-club-records.smartstandardsix.workers.dev';
  var SESSION_KEY = 'cc-session';
  var TIMEOUT_MS = 15000;

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function session() {
    var s = null;
    try { s = JSON.parse(read(SESSION_KEY) || 'null'); } catch (e) { s = null; }
    if (!s || !s.token || !s.expires || Date.now() > s.expires) return null;
    return s;
  }

  function saveSession(r) {
    write(SESSION_KEY, JSON.stringify({
      token: r.token, expires: r.expires, id: r.student.id, name: r.student.name, standard: r.student.standard
    }));
  }

  function signOut() { drop(SESSION_KEY); }

  function call(path, body) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;
    return fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // simple request: no preflight
      body: JSON.stringify(body || {}),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) { return res.json(); })
      .catch(function () { return { ok: false, network: true, error: 'Cannot reach the club records right now.' }; })
      .then(function (j) { if (timer) clearTimeout(timer); return j; });
  }

  function newAttemptId() {
    return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ── Unsent results: kept per student until the Worker confirms ──
  function unsentKey(id) { return 'cc-unsent::' + id; }
  function unsentList(id) {
    try { return JSON.parse(read(unsentKey(id)) || '[]'); } catch (e) { return []; }
  }
  function setUnsent(id, list) {
    if (list.length) write(unsentKey(id), JSON.stringify(list)); else drop(unsentKey(id));
  }

  function submit(path, payload) {
    var s = session();
    if (!s) return Promise.resolve({ ok: false, signedOut: true });
    payload = Object.assign({}, payload);
    if (!payload.attempt_id) payload.attempt_id = newAttemptId();
    var list = unsentList(s.id);
    list.push({ path: path, payload: payload });
    setUnsent(s.id, list);
    return send(s, path, payload);
  }

  function send(s, path, payload) {
    return call(path, Object.assign({ token: s.token }, payload)).then(function (r) {
      if (r && r.ok) {
        setUnsent(s.id, unsentList(s.id).filter(function (x) { return x.payload.attempt_id !== payload.attempt_id; }));
        refreshSoon();
        return r;
      }
      if (r && r.auth) return { ok: false, queued: true, auth: true, error: r.error };
      if (r && !r.network) {
        // The backend refused it for good (bad data) — do not retry forever.
        setUnsent(s.id, unsentList(s.id).filter(function (x) { return x.payload.attempt_id !== payload.attempt_id; }));
        return r;
      }
      return { ok: false, queued: true, error: (r && r.error) || 'Not sent yet' };
    });
  }

  var sending = false;
  function sendUnsent() {
    var s = session();
    if (!s || sending) return Promise.resolve(0);
    var list = unsentList(s.id);
    if (!list.length) return Promise.resolve(0);
    sending = true;
    var sent = 0, badges = [];
    return list.reduce(function (p, item) {
      return p.then(function () {
        return send(s, item.path, item.payload).then(function (r) {
          if (r.ok) { sent++; if (r.badges) badges = badges.concat(r.badges); }
        });
      });
    }, Promise.resolve()).then(function () {
      sending = false;
      if (badges.length) toastBadges(badges);
      if (sent && chipEl) statusChip(chipEl, chipNext);   // clear the "waiting to send" note
      return sent;
    });
  }



  // ── Club status (the teacher's Open/Close switches) ──
  var STATUS_KEY = 'cc-status';
  function normalise(st) {
    if (!st) return null;
    var until = Number(st.open_until) || 0;
    return { club_open: !!st.club_open && Date.now() < until, open_until: until,
             open_missions: st.open_missions || [], week: Number(st.week) || 1 };
  }
  function cachedStatus() {
    try { return normalise(JSON.parse(read(STATUS_KEY) || 'null')); } catch (e) { return null; }
  }
  function clubStatus() {
    return call('/status', {}).then(function (r) {
      if (r && r.ok) { write(STATUS_KEY, JSON.stringify(r)); return normalise(r); }
      return cachedStatus();                       // offline: last known (an expired "open" counts as closed)
    });
  }
  function missionOpen(st, id) { return !!(st && st.club_open && st.open_missions.indexOf(id) !== -1); }
  function untilText(st) {
    return st && st.club_open ? new Date(st.open_until).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  }

  // ── Live XP bar ──
  var REFRESH_MS = 60000;
  var barEl = null, refreshTimer = null, soonTimer = null;


  // ── Club pictures (computer-club/assets/*.webp, 256×256, transparent) ──────────────────────
  // Badge id → picture. A badge with no picture here still shows its emoji from the Apps Script.
  var ASSETS = '/computer-club/assets/';
  var BADGE_IMG = {
    'shortcut-ninja': 'm01-shortcut-ninja', 'know-your-computer': 'm02-know-your-computer',
    'folder-detective': 'm03-folder-detective', 'safe-surfer': 'm04-safe-surfer',
    'search-sleuth': 'm05-search-sleuth', 'pixel-artist': 'm06-pixel-artist',
    'badge-designer': 'm07-badge-designer', 'poster-pro': 'm08-poster-pro',
    'slide-show-star': 'm09-slide-show-star', 'typing-olympics': 'm10-typing-olympics',
    'typing-15': 'b-typing-15', 'typing-25': 'b-typing-25', 'typing-35': 'b-typing-35',
    'stage-1-complete': 'r-cadet', 'stage-2-complete': 'r-pilot', 'stage-3-complete': 'r-commander'
  };
  var LEVEL_IMG = ['x1-rookie', 'x2-explorer', 'x3-coder', 'x4-hacker', 'x5-wizard', 'x6-legend'];

  function img(name, size, alt) {
    var i = document.createElement('img');
    i.src = ASSETS + name + '.webp';
    i.width = size; i.height = size;
    i.alt = alt || '';
    i.className = 'cc-img';
    i.decoding = 'async';
    return i;
  }
  // Picture for a badge ({id, icon, name}); falls back to the emoji in a <span>.
  function badgeIcon(b, size) {
    var name = b && BADGE_IMG[b.id];
    if (name) return img(name, size || 40, '');
    var sp = document.createElement('span');
    sp.className = 'cc-emoji';
    sp.textContent = (b && b.icon) || '🏅';
    return sp;
  }
  // Picture for an XP level (1 = Rookie … 6+ = Legend).
  function levelIcon(level, size) {
    var n = Math.max(1, Math.min(Number(level) || 1, LEVEL_IMG.length));
    return img(LEVEL_IMG[n - 1], size || 28, '');
  }

  function levelKey(s) { return 'cc-last-level::' + s.id; }

  function buildBar() {
    if (barEl || document.body.hasAttribute('data-cc-no-bar')) return barEl;
    barEl = document.createElement('div');
    barEl.className = 'cc-xp';
    barEl.setAttribute('role', 'region');
    barEl.setAttribute('aria-label', 'My club progress');
    barEl.innerHTML =                                   // fixed markup only; data goes in with textContent
      '<a class="cc-xp-inner" href="/computer-club/#standings" title="See the club standings">' +
        '<span class="cc-lvl"><img class="cc-lvl-ico" src="' + ASSETS + 'x1-rookie.webp" width="26" height="26" alt=""><span class="cc-lvl-txt">Lv 1</span></span>' +
        '<span class="cc-track"><span class="cc-fill"></span><span class="cc-track-txt">Loading your XP…</span></span>' +
        '<span class="cc-rank"></span>' +
        '<span class="cc-ahead"></span>' +
      '</a>';
    var themeBar = document.querySelector('.theme-bar');
    if (themeBar && themeBar.parentNode) themeBar.parentNode.insertBefore(barEl, themeBar.nextSibling);
    else document.body.insertBefore(barEl, document.body.firstChild);
    return barEl;
  }

  function drawBar(st) {
    if (!barEl || !st || !st.me) return;
    var m = st.me;
    barEl.querySelector('.cc-lvl-txt').textContent = 'Lv ' + m.level + ' · ' + m.level_name;
    barEl.querySelector('.cc-lvl-ico').src = levelIcon(m.level).src;
    barEl.querySelector('.cc-fill').style.width = Math.round(m.into_level / m.per_level * 100) + '%';
    barEl.querySelector('.cc-track-txt').textContent =
      m.xp + ' XP · ' + (m.per_level - m.into_level) + ' to Level ' + (m.level + 1);
    barEl.querySelector('.cc-rank').textContent = '🏆 #' + m.rank + ' of ' + m.total;
    barEl.querySelector('.cc-ahead').textContent = m.ahead
      ? '⬆️ ' + m.ahead.gap + ' XP behind ' + m.ahead.name
      : (m.rank === 1 ? '👑 You are in first place!' : '');
  }

  function refreshProgress() {
    var s = session();
    if (!s) return Promise.resolve(null);
    buildBar();
    return call('/standings', { token: s.token }).then(function (st) {
      if (!st || !st.ok) {
        if (st && st.auth && barEl) barEl.querySelector('.cc-track-txt').textContent = 'Sign in again to see your XP';
        return null;
      }
      drawBar(st);
      var last = Number(read(levelKey(s)) || 0);
      if (last && st.me.level > last) {
        toastBadges([{ icon: '⭐', level: st.me.level, name: 'Level ' + st.me.level + ' · ' + st.me.level_name }], 'Level up!');
      }
      write(levelKey(s), String(st.me.level));
      try { window.dispatchEvent(new CustomEvent('cc-standings', { detail: st })); } catch (e) {}
      return st;
    });
  }

  function refreshSoon() {
    clearTimeout(soonTimer);
    soonTimer = setTimeout(refreshProgress, 800);
  }

  function startLive() {
    if (!session()) return;
    refreshProgress();
    clearInterval(refreshTimer);
    refreshTimer = setInterval(function () {
      if (document.visibilityState !== 'hidden') refreshProgress();
    }, REFRESH_MS);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') refreshSoon();
    });
  }

  // ── UI helpers ──
  var chipEl = null, chipNext = '';
  function statusChip(el, nextUrl) {
    if (!el) return;
    chipEl = el; chipNext = nextUrl;
    el.textContent = '';
    var s = session();
    if (s) {
      var name = document.createElement('span');
      name.className = 'cc-chip-name';
      name.textContent = '👤 ' + s.name;                 // textContent only — never innerHTML
      var out = document.createElement('button');
      out.type = 'button';
      out.className = 'cc-chip-btn';
      out.textContent = 'Sign out';
      out.addEventListener('click', function () { signOut(); location.reload(); });
      el.appendChild(name);
      el.appendChild(out);
      var n = unsentList(s.id).length;
      if (n) {
        var w = document.createElement('span');
        w.className = 'cc-chip-wait';
        w.textContent = '⏳ ' + n + ' result' + (n === 1 ? '' : 's') + ' waiting to send';
        el.appendChild(w);
      }
    } else {
      var a = document.createElement('a');
      a.className = 'cc-chip-btn';
      a.href = '/computer-club/sign-in/?next=' + encodeURIComponent(nextUrl || location.pathname);
      a.textContent = '🔑 Sign in to save your results';
      el.appendChild(a);
    }
  }

  function toastBadges(badges, title) {
    if (!badges || !badges.length) return;
    var box = document.createElement('div');
    box.className = 'cc-toast';
    box.setAttribute('role', 'status');
    var h = document.createElement('strong');
    h.textContent = title || (badges.length === 1 ? 'New badge!' : badges.length + ' new badges!');
    box.appendChild(h);
    badges.forEach(function (b) {
      var p = document.createElement('div');
      p.className = 'cc-toast-item';
      p.appendChild(b.level ? levelIcon(b.level, 44) : badgeIcon(b, 44));
      p.appendChild(document.createTextNode(' ' + b.name));
      box.appendChild(p);
    });
    document.body.appendChild(box);
    setTimeout(function () { box.classList.add('cc-toast-out'); }, 4500);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 5200);
  }

  // Toast + chip styles live here so every club page shows them the same way.
  var css = document.createElement('style');
  css.textContent =
    '.cc-chip-name{font-weight:800}' +
    '.cc-chip-btn{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:999px;border:2px solid var(--top-badge-bg);background:transparent;color:inherit;font:800 .85rem Nunito,sans-serif;cursor:pointer;text-decoration:none}' +
    '.cc-chip-btn:hover{background:var(--top-badge-bg);color:var(--top-badge-c)}' +
    '.cc-chip-wait{font-size:.8rem;font-weight:700;opacity:.8}' +
    '.cc-toast{position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);z-index:200;background:var(--top-badge-bg);color:var(--top-badge-c);padding:1rem 1.4rem;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:700 1rem Nunito,sans-serif;text-align:center;max-width:90vw;animation:ccIn .35s ease}' +
    '.cc-toast strong{display:block;font-family:"Fredoka One",cursive;font-weight:400;font-size:1.3rem;margin-bottom:.2rem}' +
    '.cc-toast-out{opacity:0;transition:opacity .6s}' +
    '.cc-xp{position:sticky;top:0;z-index:60;background:var(--bg);border-bottom:2px solid var(--top-badge-bg);box-shadow:0 4px 14px rgba(0,0,0,.18)}' +
    '.cc-xp-inner{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;max-width:1400px;margin:0 auto;padding:.5rem max(1rem,4vw);color:var(--body-color);text-decoration:none;font:800 .88rem Nunito,sans-serif}' +
    '.cc-lvl{display:inline-flex;align-items:center;gap:.35rem;background:var(--top-badge-bg);color:var(--top-badge-c);border-radius:999px;padding:.15rem .8rem .15rem .25rem;font-family:"Fredoka One",cursive;font-weight:400;white-space:nowrap}' +
    '.cc-lvl-ico{width:26px;height:26px;display:block}' +
    '.cc-toast-item{display:flex;align-items:center;justify-content:center;gap:.5rem;margin-top:.3rem}' +
    '.cc-toast-item .cc-img{width:44px;height:44px;flex-shrink:0}' +
    '.cc-toast-item .cc-emoji{font-size:1.8rem;line-height:1}' +
    '.cc-track{position:relative;flex:1 1 220px;min-width:160px;height:26px;border-radius:999px;background:var(--card-bg);border:1.5px solid var(--card-border-h);overflow:hidden}' +
    '.cc-fill{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--top-badge-bg);opacity:.85;transition:width .8s ease}' +
    '.cc-track-txt{position:relative;display:block;text-align:center;line-height:23px;font-size:.8rem;text-shadow:0 0 4px var(--bg)}' +
    '.cc-rank{white-space:nowrap}' +
    '.cc-ahead{color:var(--cycle-color)}' +
    '@media (max-width:480px){.cc-xp-inner{font-size:.8rem;gap:.35rem .7rem}.cc-track{flex-basis:100%;order:3}}' +
    '.cc-hidden{display:none!important}' +
    '.cc-timer{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:150;display:flex;align-items:center;gap:.6rem;background:var(--card-bg);backdrop-filter:blur(8px);border:2px solid var(--top-badge-bg);color:var(--body-color);border-radius:999px;padding:.35rem .5rem .35rem 1rem;font:800 .9rem Nunito,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.3)}' +
    '.cc-timer-time{font-family:"Fredoka One",cursive;font-weight:400;font-size:1.25rem;min-width:3.2em;text-align:center;color:var(--cycle-color)}' +
    '.cc-timer-low{animation:ccPulse 1s ease-in-out infinite}' +
    '.cc-timer-pin{background:transparent!important;border:2px solid var(--top-badge-bg)!important;font-size:.95rem}' +
    '.cc-timer-x{width:36px;height:36px;border-radius:50%;border:0;background:var(--top-badge-bg);color:var(--top-badge-c);font-weight:900;cursor:pointer}' +
    '@keyframes ccPulse{50%{box-shadow:0 0 0 6px rgba(255,90,90,.35)}}' +
    '.cc-flash{position:fixed;inset:0;z-index:400;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:rgba(0,0,0,.72);color:#fff;cursor:pointer;animation:ccFlash .5s ease-in-out 0s 4 alternate}' +
    '.cc-flash-title{font-family:"Fredoka One",cursive;font-size:clamp(2.6rem,10vw,6rem);line-height:1.1;color:#FFD43B;text-shadow:0 4px 30px rgba(0,0,0,.5)}' +
    '.cc-flash-sub{font:800 clamp(1.1rem,3vw,1.8rem) Nunito,sans-serif;margin-top:.8rem;max-width:900px}' +
    '.cc-flash-hint{font:700 .9rem Nunito,sans-serif;opacity:.7;margin-top:1.4rem}' +
    '@keyframes ccFlash{from{background:rgba(0,0,0,.72)}to{background:rgba(255,212,59,.35)}}' +
    '@media (max-width:480px){.cc-timer{bottom:.6rem;font-size:.8rem}}' +
    '@keyframes ccIn{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}';
  document.head.appendChild(css);


  // ── Sounds (Web Audio, made in code: no sound files) ──
  // Browsers only allow sound after the student clicks or types on the page, so the audio is
  // unlocked on the first click/keypress. If it is still locked, the on-screen notice still shows.
  var SOUND_KEY = 'cc-sound';
  var actx = null;
  function audio() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { actx = new AC(); } catch (e) { return null; }
    }
    if (actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }
    return actx;
  }
  function soundOn() { return read(SOUND_KEY) !== 'off'; }
  function setSound(on) { write(SOUND_KEY, on ? 'on' : 'off'); }
  ['pointerdown', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { if (soundOn()) audio(); }, { capture: true, passive: true });
  });

  // Short soft "tick" like a keyboard key.
  function click(kind) {
    if (!soundOn()) return;
    var a = audio(); if (!a || a.state !== 'running') return;
    var t = a.currentTime, len = Math.floor(a.sampleRate * 0.03);
    var buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    var src = a.createBufferSource(); src.buffer = buf;
    var f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kind === 'wrong' ? 900 : 2600; f.Q.value = 0.9;
    var g = a.createGain(); g.gain.value = kind === 'wrong' ? 0.22 : 0.14;
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(t);
  }

  // Soft three-note chime for "time's up".
  function chime() {
    if (!soundOn()) return;
    var a = audio(); if (!a) return;
    var t = a.currentTime + 0.02;
    [659.25, 830.61, 987.77].forEach(function (freq, i) {
      var o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      var start = t + i * 0.28;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.16, start + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 1.4);
      o.connect(g); g.connect(a.destination);
      o.start(start); o.stop(start + 1.5);
    });
  }

  // A 🔊 on/off button; el = an empty <button>.
  function soundToggle(el) {
    if (!el) return;
    function draw() {
      el.textContent = soundOn() ? '🔊 Sound: on' : '🔇 Sound: off';
      el.setAttribute('aria-pressed', soundOn() ? 'true' : 'false');
    }
    el.type = 'button';
    el.addEventListener('click', function () { setSound(!soundOn()); draw(); if (soundOn()) click(); });
    draw();
  }

  // ── Flashing notice ("Time's up!") — big, on top of the page, closes itself ──
  function flash(title, sub) {
    var old = document.querySelector('.cc-flash');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var box = document.createElement('div');
    box.className = 'cc-flash';
    box.setAttribute('role', 'alert');
    var h = document.createElement('div'); h.className = 'cc-flash-title'; h.textContent = title;
    box.appendChild(h);
    if (sub) { var p = document.createElement('div'); p.className = 'cc-flash-sub'; p.textContent = sub; box.appendChild(p); }
    var hint = document.createElement('div'); hint.className = 'cc-flash-hint'; hint.textContent = 'Click to close';
    box.appendChild(hint);
    function close() { if (box.parentNode) box.parentNode.removeChild(box); }
    box.addEventListener('click', close);
    document.body.appendChild(box);
    setTimeout(close, 9000);
  }

  // ── Club timer: one countdown at a time, kept in cc-timer so it follows the student
  //    from page to page. Shown three ways (Edwin, Nov 6: "the timer must show when other tabs are open"):
  //    1. a pill at the bottom of every club page;
  //    2. the countdown in the TAB NAME ("⏱ 12:34 · Warm-up"), visible from any other tab;
  //    3. a FLOATING WINDOW that stays on top of every tab (Document Picture-in-Picture: Edge/Chrome).
  //       Browsers open it only from a click, so CC.timer.start() must be called inside the click
  //       handler (it also works in the same click that opens TypingClub — tested Nov 6).
  //       Closing the floating window does not stop the timer; the 📌 button on the pill reopens it.
  var TIMER_KEY = 'cc-timer';
  var timerEl = null, timerTick = null, pipWin = null, baseTitle = document.title, titleFlash = null;
  function readTimer() { try { return JSON.parse(read(TIMER_KEY) || 'null'); } catch (e) { return null; } }
  function canFloat() { return 'documentPictureInPicture' in window; }

  function startTimer(label, minutes, next) {
    write(TIMER_KEY, JSON.stringify({ label: label, next: next || '', end: Date.now() + minutes * 60000, minutes: minutes }));
    audio();                                   // the click that started it unlocks the sound
    openFloat();                               // must run inside the same click
    runTimer();
  }
  function stopTimer() { drop(TIMER_KEY); closeFloat(); restoreTitle(); runTimer(); }
  function mmss(ms) {
    var sec = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
  }

  // ── floating window ──
  var PIP_CSS =
    'html,body{margin:0;height:100%;background:#0d1f1a;color:#fff;font-family:Nunito,Segoe UI,Arial,sans-serif;overflow:hidden}' +
    '.w{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6px}' +
    '.l{font-weight:800;font-size:15px;opacity:.85}' +
    '.t{font-weight:900;font-size:46px;line-height:1.05;color:#20C997;font-variant-numeric:tabular-nums;letter-spacing:1px}' +
    '.low .t{color:#FF8787}' +
    '.up{animation:f .5s ease-in-out infinite alternate}' +
    '.up .t{font-size:30px;color:#FFD43B}' +
    '.n{font-size:13px;font-weight:700;opacity:.85;margin-top:2px}' +
    '@keyframes f{from{background:#0d1f1a}to{background:#5c4a00}}';
  function openFloat() {
    if (!canFloat() || pipWin) return;
    try {
      documentPictureInPicture.requestWindow({ width: 260, height: 130 }).then(function (w) {
        pipWin = w;
        var st = w.document.createElement('style'); st.textContent = PIP_CSS;
        w.document.head.appendChild(st);
        w.document.title = 'Club timer';
        w.document.body.innerHTML = '<div class="w" id="w"><div class="l" id="l"></div><div class="t" id="t"></div><div class="n" id="n"></div></div>';
        w.addEventListener('pagehide', function () { pipWin = null; });
        drawFloat();
      }).catch(function () { pipWin = null; });
    } catch (e) { pipWin = null; }
  }
  function closeFloat() { if (pipWin) { try { pipWin.close(); } catch (e) {} pipWin = null; } }
  function drawFloat(state) {
    if (!pipWin) return;
    var d = pipWin.document, t = readTimer(), box = d.getElementById('w');
    if (!box) return;
    if (state && state.up) {
      box.className = 'w up';
      d.getElementById('l').textContent = state.label;
      d.getElementById('t').textContent = '⏰ Time\'s up!';
      d.getElementById('n').textContent = state.next ? 'Next: ' + state.next : '';
      return;
    }
    if (!t) return;
    var left = t.end - Date.now();
    box.className = 'w' + (left <= 60000 ? ' low' : '');
    d.getElementById('l').textContent = '⏱️ ' + t.label;
    d.getElementById('t').textContent = mmss(left);
    d.getElementById('n').textContent = t.next ? 'Next: ' + t.next : '';
  }

  // ── tab name ──
  function setTitle(text) { document.title = text + ' · ' + baseTitle; }
  function restoreTitle() { clearInterval(titleFlash); titleFlash = null; document.title = baseTitle; }
  function flashTitle(text) {
    var on = false, n = 0;
    clearInterval(titleFlash);
    titleFlash = setInterval(function () {
      document.title = (on = !on) ? text : baseTitle;
      if (++n > 40) restoreTitle();           // about 40 seconds, then back to normal
    }, 1000);
  }

  function runTimer() {
    clearInterval(timerTick);
    var t = readTimer();
    if (!t) { if (timerEl) timerEl.classList.add('cc-hidden'); return; }
    if (!timerEl) {
      timerEl = document.createElement('div');
      timerEl.className = 'cc-timer';
      timerEl.setAttribute('role', 'timer');
      timerEl.innerHTML = '<span class="cc-timer-label"></span><b class="cc-timer-time"></b>' +
                          (canFloat() ? '<button type="button" class="cc-timer-x cc-timer-pin" aria-label="Show the timer on top of every tab" title="Show on top of every tab">📌</button>' : '') +
                          '<button type="button" class="cc-timer-x" aria-label="Stop timer" title="Stop timer">✕</button>';
      timerEl.querySelector('.cc-timer-x:not(.cc-timer-pin)').addEventListener('click', stopTimer);
      var pin = timerEl.querySelector('.cc-timer-pin');
      if (pin) pin.addEventListener('click', openFloat);
      document.body.appendChild(timerEl);
    }
    timerEl.classList.remove('cc-hidden');
    timerEl.querySelector('.cc-timer-label').textContent = '⏱️ ' + t.label;
    function tick() {
      var left = t.end - Date.now();
      timerEl.querySelector('.cc-timer-time').textContent = mmss(left);
      timerEl.classList.toggle('cc-timer-low', left <= 60000);
      setTitle('⏱ ' + mmss(left) + ' · ' + t.label);
      drawFloat();
      if (left <= 0) {
        clearInterval(timerTick);
        drop(TIMER_KEY);
        timerEl.classList.add('cc-hidden');
        // Only ring if the time ran out recently (not when coming back to the page the next day).
        if (Date.now() - t.end < 10 * 60000) {
          chime();
          flash('⏰ Time\'s up!', t.label + ' is over.' + (t.next ? ' Next: ' + t.next + '.' : ''));
          flashTitle('⏰ TIME\'S UP!');
          drawFloat({ up: true, label: t.label + ' is over', next: t.next });
          setTimeout(closeFloat, 2 * 60000);   // the floating "Time's up" stays 2 minutes
        } else {
          restoreTitle();
        }
      }
    }
    tick();
    timerTick = setInterval(tick, 1000);
  }

  window.CC = {
    API: API,
    session: session,
    saveSession: saveSession,
    signOut: signOut,
    call: call,
    submit: submit,
    sendUnsent: sendUnsent,
    newAttemptId: newAttemptId,
    unsentCount: function () { var s = session(); return s ? unsentList(s.id).length : 0; },
    statusChip: statusChip,
    toastBadges: toastBadges,
    refreshProgress: refreshProgress,
    sound: { click: click, chime: chime, on: soundOn, toggle: soundToggle },
    flash: flash,
    timer: { start: startTimer, stop: stopTimer, current: readTimer },
    cachedStatus: cachedStatus,
    clubStatus: clubStatus,
    missionOpen: missionOpen,
    untilText: untilText,
    img: img,
    badgeIcon: badgeIcon,
    levelIcon: levelIcon
  };

  // Try to send anything left over from a dropped connection.
  window.addEventListener('online', sendUnsent);
  setTimeout(sendUnsent, 1500);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { startLive(); runTimer(); });
  else { startLive(); runTimer(); }
})();
