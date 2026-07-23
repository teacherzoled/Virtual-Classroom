/* ═══════════════════════════════════════════════════════════════
 *  vc-icons.js — Constellation icon kit
 *  Mr. EdLo's Virtual Classroom · edlovirtualclassroom.com
 *
 *  Custom SVG subject & feature icons drawn as constellations:
 *  line-art joined by glowing star nodes, inside a "space orb".
 *  Fully theme-aware — strokes use the per-theme accent variables
 *  (--a-science, --a-math …) and the orb uses --orb-g1/--orb-g2
 *  from vc-theme.css, so icons adapt to all 4 themes automatically.
 *
 *  Usage in HTML (script auto-replaces on load):
 *    <span data-vc-icon="science"></span>     ← subject/feature orb
 *    <span data-vc-toggle="night"></span>     ← small theme-bar glyph
 *
 *  Available icons: spanish science math scripture cs pe gclass
 *                   worksheet portfolio review weekly activities submit
 *  Built July 22, 2026 · Constellation redesign
 * ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var UID = 0;

  /* Twinkling star node: soft halo + core that pulses */
  function node(x, y, a, big, delay) {
    var halo = big ? 7 : 5.5, core = big ? 3.6 : 2.6;
    var dur = (2.4 + (delay % 3) * 0.4).toFixed(1);
    return '<circle cx="' + x + '" cy="' + y + '" r="' + halo + '" fill="' + a + '" opacity="0.28"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + core + '" fill="' + a + '">' +
      '<animate attributeName="opacity" values="1;0.5;1" dur="' + dur + 's" begin="' + (delay * 0.3).toFixed(1) + 's" repeatCount="indefinite"/></circle>';
  }

  /* Faint background stars inside the orb (hidden on light themes via CSS) */
  function orbStars() {
    var pts = [[34,40,.9,.5],[88,36,.7,.4],[30,86,.8,.6],[92,82,.6,.35],[60,26,.6,.3],[22,62,.7,.45],[98,60,.6,.3],[60,96,.7,.4],[46,20,.5,.3],[76,100,.5,.3]];
    var s = '<g class="orb-star">';
    for (var i = 0; i < pts.length; i++) {
      s += '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="' + pts[i][2] + '" fill="#fff" opacity="' + pts[i][3] + '"/>';
    }
    return s + '</g>';
  }

  function orb(accent, inner) {
    UID++;
    var g = 'vcg' + UID;
    return '<svg viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="' + g + '" cx="50%" cy="42%" r="65%">' +
      '<stop offset="0%" stop-color="var(--orb-g1,#232a4d)"/><stop offset="100%" stop-color="var(--orb-g2,#0d1128)"/></radialGradient></defs>' +
      '<circle cx="60" cy="60" r="56" fill="url(#' + g + ')" stroke="' + accent + '" stroke-opacity="0.5" stroke-width="2"/>' +
      orbStars() +
      '<g stroke="' + accent + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">' + inner + '</g></svg>';
  }

  /* name → [accent CSS var, inner-drawing fn(accentString)] */
  var ICONS = {
    spanish: ['--a-spanish', function (a) {
      return '<circle cx="52" cy="60" r="26"/><ellipse cx="52" cy="60" rx="26" ry="9"/><ellipse cx="52" cy="60" rx="9" ry="26"/>' +
        '<ellipse cx="70" cy="42" rx="20" ry="9" transform="rotate(-25 70 42)" stroke-dasharray="1 6" stroke-width="2.5"/>' +
        node(88, 32, a, false, 1) + node(52, 34, a, false, 2);
    }],
    science: ['--a-science', function (a) {
      return '<ellipse cx="60" cy="60" rx="30" ry="12"/><ellipse cx="60" cy="60" rx="30" ry="12" transform="rotate(60 60 60)"/>' +
        '<ellipse cx="60" cy="60" rx="30" ry="12" transform="rotate(120 60 60)"/>' +
        node(60, 60, a, true, 0) + node(90, 60, a, false, 1) + node(45, 34, a, false, 2) + node(45, 86, a, false, 3);
    }],
    math: ['--a-math', function (a) {
      return '<line x1="34" y1="60" x2="86" y2="60" stroke-width="4.5"/>' +
        '<path d="M18 66 L26 70 L34 44" stroke-width="2.5" opacity="0.55"/>' +
        node(60, 34, a, false, 0) + node(60, 86, a, false, 2);
    }],
    scripture: ['--a-scripture', function (a) {
      return '<line x1="60" y1="26" x2="60" y2="90" stroke-width="4.5"/><line x1="40" y1="46" x2="80" y2="46" stroke-width="4.5"/>' +
        node(60, 24, a, true, 0) + node(40, 46, a, false, 1) + node(80, 46, a, false, 2) + node(60, 90, a, false, 3);
    }],
    cs: ['--a-cs', function (a) {
      return '<path d="M48 40 L28 60 L48 80" stroke-width="4.5"/><path d="M72 40 L92 60 L72 80" stroke-width="4.5"/>' +
        '<rect x="57" y="52" width="6" height="16" fill="' + a + '" stroke="none">' +
        '<animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect>';
    }],
    pe: ['--a-pe', function (a) {
      return '<path d="M 72.7 61.3 L 73.6 50.2 L 84.0 46.2 L 73.7 42.0 L 73.2 30.9 L 65.9 39.3 L 55.2 36.4 L 61.0 45.9 L 54.9 55.2 L 65.7 52.6 Z" fill="' + a + '" stroke="none"/>' +
        '<path d="M52 62 L26 82" stroke-width="4" opacity="0.7"/><path d="M50 50 L20 60" stroke-width="3" opacity="0.45"/>' +
        '<path d="M54 74 L30 96" stroke-width="2.5" opacity="0.3"/>';
    }],
    gclass: ['--a-gclass', function (a) {
      return '<rect x="30" y="52" width="60" height="40" rx="4"/><path d="M30 54 L60 78 L90 54"/>' +
        '<path d="M60 44 L60 20"/><path d="M50 28 L60 18 L70 28"/>';
    }],
    worksheet: ['--a-worksheet', function (a) {
      return '<path d="M40 24 H72 L84 36 V96 H40 Z"/><path d="M72 24 V36 H84" stroke-width="3"/>' +
        '<line x1="50" y1="56" x2="76" y2="56" stroke-width="3.2"/><line x1="50" y1="68" x2="76" y2="68" stroke-width="3.2"/>' +
        '<line x1="50" y1="80" x2="70" y2="80" stroke-width="3.2"/>' + node(45, 44, a, false, 1);
    }],
    portfolio: ['--a-portfolio', function (a) {
      return '<path d="M24 44 H50 L58 52 H96 V88 A4 4 0 0 1 92 92 H28 A4 4 0 0 1 24 88 Z"/>' +
        '<path d="M 63.8 78.4 L 64.4 69.3 L 73.0 66.2 L 64.5 62.8 L 64.2 53.7 L 58.4 60.7 L 49.6 58.2 L 54.5 65.9 L 49.4 73.5 L 58.2 71.2 Z" fill="' + a + '" stroke="none"/>';
    }],
    review: ['--a-math', function (a) {
      return '<path d="M60 34 C50 28 38 28 30 32 V84 C38 80 50 80 60 86 C70 80 82 80 90 84 V32 C82 28 70 28 60 34 Z"/>' +
        '<line x1="60" y1="34" x2="60" y2="86"/>' + node(60, 24, a, false, 1);
    }],
    weekly: ['--a-worksheet', function (a) {
      return '<rect x="32" y="34" width="56" height="56" rx="6"/><line x1="32" y1="50" x2="88" y2="50" stroke-width="3.5"/>' +
        '<line x1="46" y1="26" x2="46" y2="38"/><line x1="74" y1="26" x2="74" y2="38"/>' + node(60, 70, a, false, 2);
    }],
    activities: ['--a-portfolio', function (a) {
      return '<path d="M34 86 L38 70 L70 38 L82 50 L50 82 Z"/><line x1="62" y1="46" x2="74" y2="58" stroke-width="3"/>' +
        node(84, 32, a, false, 0);
    }],
    submit: ['--a-cs', function (a) {
      return '<path d="M28 66 L92 34 L64 92 L56 68 Z"/><line x1="56" y1="68" x2="92" y2="34" stroke-width="3"/>' +
        '<path d="M20 54 L34 58" stroke-width="2.5" opacity="0.5"/><path d="M22 44 L34 50" stroke-width="2" opacity="0.35"/>';
    }]
  };

  /* Small monochrome theme-bar glyphs (inherit button text colour) */
  var TOGGLES = {
    night: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4 A8 8 0 1 0 15 20 A6.2 6.2 0 0 1 15 4 Z"/><circle cx="18.5" cy="5.5" r="0.9" fill="currentColor" stroke="none"/></svg>',
    sunny: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/><line x1="5" y1="5" x2="6.8" y2="6.8"/><line x1="17.2" y1="17.2" x2="19" y2="19"/><line x1="19" y1="5" x2="17.2" y2="6.8"/><line x1="6.8" y1="17.2" x2="5" y2="19"/></svg>',
    cloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 18 A4 4 0 0 1 6 10 A5 5 0 0 1 15.8 8.5 A4.2 4.2 0 0 1 17 18 Z"/></svg>',
    nature: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21 C12 13 15 8 20 5 C19 12 16 17 12 21 Z"/><path d="M12 21 C12 15 9 11 5 9 C6 14 8 18 12 21 Z" stroke-width="1.6"/></svg>'
  };

  function render(name) {
    var def = ICONS[name];
    if (!def) return '';
    var accent = 'var(' + def[0] + ')';
    return orb(accent, def[1](accent));
  }

  function init() {
    var els = document.querySelectorAll('[data-vc-icon]');
    for (var i = 0; i < els.length; i++) {
      var svg = render(els[i].getAttribute('data-vc-icon'));
      if (svg) { els[i].classList.add('vc-icon'); els[i].innerHTML = svg; }
    }
    var tg = document.querySelectorAll('[data-vc-toggle]');
    for (var j = 0; j < tg.length; j++) {
      var t = TOGGLES[tg[j].getAttribute('data-vc-toggle')];
      if (t) { tg[j].classList.add('vc-tgl'); tg[j].innerHTML = t; }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.VCIcons = { render: render, init: init };
})();
