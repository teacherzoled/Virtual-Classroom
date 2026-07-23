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

  /* Small monochrome UI glyphs (inherit text colour, ~15px) — login/dashboard chrome */
  var GLYPHS = {
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="3.6"/><line x1="12" y1="10.6" x2="12" y2="20"/><line x1="12" y1="15.5" x2="15.2" y2="15.5"/><line x1="12" y1="18.6" x2="14.4" y2="18.6"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.3"/></svg>',
    paw: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><ellipse cx="12" cy="15.5" rx="4.2" ry="3.4"/><circle cx="6.6" cy="11" r="1.7"/><circle cx="10.2" cy="8" r="1.7"/><circle cx="13.8" cy="8" r="1.7"/><circle cx="17.4" cy="11" r="1.7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11 V7.5 a4 4 0 0 1 8 0 V11"/></svg>'
  };

  /* ── Content glyphs for lesson activities ──────────────────────────
     Weather, climate & energy line-art, ~20px, monochrome (inherit the
     surrounding text colour, so theme-aware for free). These are the
     drawn replacements for the emoji the science lessons used to carry.
     Add a new key here when a science topic needs an icon that is missing
     — every lesson picks from this one shared set.
     Render: VCIcons.content('rain')  or  <span data-vc-ico="rain"></span> */
  var ICO0 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var CONTENT = {
    sun:'<circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2.5" x2="12" y2="4.6"/><line x1="12" y1="19.4" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="4.6" y2="12"/><line x1="19.4" y1="12" x2="21.5" y2="12"/><line x1="5.2" y1="5.2" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="18.8" y2="18.8"/><line x1="18.8" y1="5.2" x2="17.3" y2="6.7"/><line x1="6.7" y1="17.3" x2="5.2" y2="18.8"/>',
    moon:'<path d="M15.5 3.5 A8.5 8.5 0 1 0 15.5 20.5 A6.6 6.6 0 0 1 15.5 3.5 Z"/><circle cx="18.3" cy="6" r="0.8" fill="currentColor" stroke="none"/>',
    cloud:'<path d="M7 18 A4.2 4.2 0 0 1 6.4 9.6 A5.3 5.3 0 0 1 16.7 8 A4.4 4.4 0 0 1 18 18 Z"/>',
    partly:'<circle cx="8" cy="8" r="2.7"/><line x1="8" y1="3" x2="8" y2="4.3"/><line x1="3" y1="8" x2="4.3" y2="8"/><line x1="4.5" y1="4.5" x2="5.4" y2="5.4"/><line x1="11.5" y1="4.5" x2="10.6" y2="5.4"/><path d="M8 19 A3.3 3.3 0 0 1 7.5 12.5 A4.2 4.2 0 0 1 15.6 11.3 A3.5 3.5 0 0 1 16.7 19 Z"/>',
    rain:'<path d="M7 14.5 A3.6 3.6 0 0 1 6.5 7.5 A4.5 4.5 0 0 1 15.6 6 A3.8 3.8 0 0 1 16.7 14.5 Z"/><line x1="8.5" y1="17.5" x2="7.6" y2="20.3"/><line x1="12" y1="17.5" x2="11.1" y2="20.3"/><line x1="15.5" y1="17.5" x2="14.6" y2="20.3"/>',
    drizzle:'<path d="M7 14.5 A3.6 3.6 0 0 1 6.5 7.5 A4.5 4.5 0 0 1 15.6 6 A3.8 3.8 0 0 1 16.7 14.5 Z"/><line x1="9.5" y1="17.5" x2="9" y2="19.5"/><line x1="14" y1="17.5" x2="13.5" y2="19.5"/>',
    storm:'<path d="M7 13.5 A3.6 3.6 0 0 1 6.5 6.5 A4.5 4.5 0 0 1 15.6 5 A3.8 3.8 0 0 1 16.7 13.5 Z"/><path d="M12.5 13 L9.5 17.5 H12 L10.5 21.5"/>',
    snow:'<path d="M7 13.5 A3.6 3.6 0 0 1 6.5 6.5 A4.5 4.5 0 0 1 15.6 5 A3.8 3.8 0 0 1 16.7 13.5 Z"/><path d="M8.6 17.4 l1 1 M9.6 17.4 l-1 1 M13.4 17.4 l1 1 M14.4 17.4 l-1 1"/>',
    snowflake:'<line x1="12" y1="3" x2="12" y2="21"/><line x1="4.2" y1="7.5" x2="19.8" y2="16.5"/><line x1="19.8" y1="7.5" x2="4.2" y2="16.5"/><path d="M12 6.2 l-1.8 -1.2 M12 6.2 l1.8 -1.2 M12 17.8 l-1.8 1.2 M12 17.8 l1.8 1.2"/>',
    wind:'<path d="M3 9.5 H13.5 A2.5 2.5 0 1 0 11 7"/><path d="M3 14 H17 A2.6 2.6 0 1 1 14.4 16.6"/>',
    fog:'<path d="M6.5 12.5 A3.4 3.4 0 0 1 6 6 A4.3 4.3 0 0 1 14.8 4.8 A3.6 3.6 0 0 1 16.5 11"/><line x1="4" y1="15.5" x2="20" y2="15.5"/><line x1="6" y1="18.5" x2="18" y2="18.5"/><line x1="4.5" y1="21" x2="15" y2="21"/>',
    umbrella:'<path d="M12 11 V20 A2 2 0 0 0 15.4 21.4"/><path d="M3.2 11 A8.8 8.8 0 0 1 20.8 11 Z"/><line x1="12" y1="8.5" x2="12" y2="11"/>',
    thermometer:'<path d="M10 13.5 V6 A2 2 0 0 1 14 6 V13.5 A3.4 3.4 0 1 1 10 13.5 Z"/><circle cx="12" cy="16.6" r="1.4" fill="currentColor" stroke="none"/><line x1="12" y1="8" x2="12" y2="14.5"/>',
    calendar:'<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8.5" y1="3.5" x2="8.5" y2="7"/><line x1="15.5" y1="3.5" x2="15.5" y2="7"/>',
    globe:'<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.8" ry="8.5"/><line x1="3.6" y1="12" x2="20.4" y2="12"/><line x1="5.2" y1="7.8" x2="18.8" y2="7.8"/><line x1="5.2" y1="16.2" x2="18.8" y2="16.2"/>',
    city:'<rect x="3.5" y="9.5" width="5.5" height="10.5"/><rect x="9.5" y="4.5" width="5" height="15.5"/><rect x="15" y="11.5" width="5.5" height="8.5"/><line x1="5" y1="12.5" x2="7.5" y2="12.5"/><line x1="11" y1="8" x2="13" y2="8"/><line x1="16.5" y1="14.5" x2="19" y2="14.5"/>',
    palm:'<path d="M12 21 C11.2 16 11.3 12.5 12.2 9.5"/><path d="M12 9.5 C9.2 6.8 6 6.6 3.4 8.4"/><path d="M12 9.5 C14.8 6.8 18 6.6 20.6 8.4"/><path d="M12 9.5 C10 5.8 7.6 4.2 5 4"/><path d="M12 9.5 C14 5.8 16.4 4.2 19 4"/>',
    desert:'<path d="M11 20.5 V10.5 A2 2 0 0 1 15 10.5 V20.5"/><path d="M11 14 A2.6 2.6 0 0 1 8 11.4 V15"/><path d="M15 12.5 A2.6 2.6 0 0 1 18 9.9 V13.5"/><line x1="4.5" y1="20.5" x2="19.5" y2="20.5"/>',
    waves:'<path d="M3 8.5 Q6 6 9 8.5 T15 8.5 T21 8.5"/><path d="M3 13 Q6 10.5 9 13 T15 13 T21 13"/><path d="M3 17.5 Q6 15 9 17.5 T15 17.5 T21 17.5"/>',
    leaf:'<path d="M12 21 C12 13 15 8 20 5 C19 12 16 17 12 21 Z"/><path d="M12 21 C12 15 9 11 5 9 C6 14 8 18 12 21 Z"/>',
    tree:'<circle cx="12" cy="9" r="5.3"/><line x1="12" y1="14.3" x2="12" y2="21"/>',
    drop:'<path d="M12 3.5 C12 3.5 5.5 11.2 5.5 15.8 A6.5 6.5 0 0 0 18.5 15.8 C18.5 11.2 12 3.5 12 3.5 Z"/>',
    chartbar:'<polyline points="4,4 4,20 20,20"/><rect x="6.6" y="13" width="2.6" height="6"/><rect x="11" y="9" width="2.6" height="10"/><rect x="15.4" y="6" width="2.6" height="13"/>',
    chartline:'<polyline points="4,4 4,20 20,20"/><polyline points="6,16 10,12 13,14 18,7"/><circle cx="18" cy="7" r="1.1" fill="currentColor" stroke="none"/>',
    fire:'<path d="M12 21 A5.6 5.6 0 0 0 16.2 11.4 C15 13.2 14 12 14 9 C11.8 10.4 9.4 12.4 9.4 15.4 A5.6 5.6 0 0 0 12 21 Z"/>',
    bus:'<rect x="3.5" y="6" width="17" height="10.5" rx="2.2"/><line x1="3.5" y1="12" x2="20.5" y2="12"/><line x1="8" y1="6.5" x2="8" y2="11.6"/><line x1="13" y1="6.5" x2="13" y2="11.6"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>',
    car:'<path d="M4 16 V13 L6.2 9 H15.5 L18.5 13 H20 V16"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="8" cy="16.5" r="1.6"/><circle cx="16" cy="16.5" r="1.6"/>',
    bicycle:'<circle cx="6.6" cy="15.5" r="3.6"/><circle cx="17.4" cy="15.5" r="3.6"/><path d="M6.6 15.5 L10 9 H13.6 M10.4 15.5 L13.6 9 L17.4 15.5"/>',
    factory:'<path d="M3.5 20 V11 L8.5 14 V11 L13.5 14 V8.5 H20 V20 Z"/><line x1="6.6" y1="17" x2="8" y2="17"/><line x1="11.6" y1="17" x2="13" y2="17"/><line x1="16" y1="17" x2="17.6" y2="17"/>',
    solar:'<rect x="4.5" y="6" width="12" height="8" rx="0.8" transform="skewX(-10)"/><line x1="3.8" y1="9" x2="15.8" y2="9"/><line x1="9.4" y1="6" x2="8" y2="14"/><line x1="12" y1="15.5" x2="12" y2="20"/><line x1="8.5" y1="20" x2="15.5" y2="20"/>',
    turbine:'<line x1="12" y1="12.5" x2="12" y2="21"/><line x1="12" y1="12.5" x2="12" y2="4"/><line x1="12" y1="12.5" x2="19" y2="16.5"/><line x1="12" y1="12.5" x2="5" y2="16.5"/><circle cx="12" cy="12.5" r="1.1" fill="currentColor" stroke="none"/>',
    bulb:'<path d="M8.8 15 A5 5 0 1 1 15.2 15 C14.2 15.8 14 16.6 14 17.6 H10 C10 16.6 9.8 15.8 8.8 15 Z"/><line x1="10" y1="20" x2="14" y2="20"/>'
  };

  function content(name) { var i = CONTENT[name]; return i ? ICO0 + i + '</svg>' : ''; }

  function render(name) {
    var def = ICONS[name];
    if (!def) return '';
    var accent = 'var(' + def[0] + ')';
    return orb(accent, def[1](accent));
  }

  /* Returns a small glyph SVG string (trusted, no user data) */
  function glyph(name) { return GLYPHS[name] || ''; }

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
    var gl = document.querySelectorAll('[data-vc-glyph]');
    for (var k = 0; k < gl.length; k++) {
      var gsvg = GLYPHS[gl[k].getAttribute('data-vc-glyph')];
      if (gsvg) { gl[k].classList.add('vc-glyph'); gl[k].innerHTML = gsvg; }
    }
    var ic = document.querySelectorAll('[data-vc-ico]');
    for (var m = 0; m < ic.length; m++) {
      var isvg = content(ic[m].getAttribute('data-vc-ico'));
      if (isvg) { ic[m].classList.add('vc-ico'); ic[m].innerHTML = isvg; }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.VCIcons = { render: render, glyph: glyph, content: content, init: init };
})();
