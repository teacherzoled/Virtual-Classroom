/* ═══════════════════════════════════════════════════════════════
 *  vc-mascot.js — "Balam" the Jaguar mascot
 *  Mr. EdLo's Virtual Classroom · edlovirtualclassroom.com
 *
 *  Belize's national animal as an animated site mascot. He shares
 *  the header badge with the Mr. EdLo logo: every 12 seconds the
 *  logo flips away and Balam springs out past the badge edge,
 *  waves at the students, blinks, and shows a greeting bubble
 *  (rotates English → Spanish → Kriol), then hands back to the logo.
 *
 *  Fully self-contained (injects its own CSS). Theme-aware: his
 *  bandana uses --top-badge-bg, so he matches Night/Sunny/Cloudy/
 *  Nature automatically. Respects prefers-reduced-motion.
 *
 *  Usage: <script src="/vc-mascot.js"></script>  (after the header)
 *  Optional: <body data-mascot-off> disables him on a page.
 *  Built July 22, 2026 · Constellation redesign phase 2
 * ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var GREETINGS = ['Welcome!', '¡Bienvenidos!', 'Gud day!', 'Come in!'];

  var CSS = [
    '.vcm-wrap{position:relative;width:48px;height:48px;flex-shrink:0;}',
    '.vcm-wrap>img{position:absolute;inset:0;height:48px;width:auto;animation:vcmLogo 12s ease-in-out infinite;}',
    '.vcm-jag{position:absolute;inset:-4px;display:block;line-height:0;transform:translateY(30px) scale(.6);opacity:0;animation:vcmJag 12s ease-in-out infinite;pointer-events:none;}',
    '.vcm-jag svg{width:100%;height:100%;overflow:visible;display:block;}',
    '.vcm-paw{transform-origin:96px 88px;animation:vcmWave 12s ease-in-out infinite;}',
    '.vcm-ear-l{transform-origin:34px 40px;animation:vcmEar 12s ease-in-out infinite;}',
    '.vcm-bubble{position:absolute;left:calc(100% + 12px);top:-6px;background:var(--top-badge-bg,#20C997);color:var(--top-badge-c,#fff);font-family:\'Fredoka One\',cursive;font-size:.78rem;padding:5px 12px;border-radius:12px;white-space:nowrap;opacity:0;transform:scale(.6);transform-origin:left center;animation:vcmBubble 12s cubic-bezier(.36,1.5,.6,1) infinite;pointer-events:none;z-index:5;}',
    '.vcm-bubble::before{content:\'\';position:absolute;left:-6px;top:14px;border:6px solid transparent;border-right-color:var(--top-badge-bg,#20C997);border-left:0;}',
    '@keyframes vcmLogo{0%,40%{opacity:1;transform:rotateY(0)}46%,88%{opacity:0;transform:rotateY(90deg)}94%,100%{opacity:1;transform:rotateY(0)}}',
    '@keyframes vcmJag{0%,42%{opacity:0;transform:translateY(30px) scale(.6)}50%{opacity:1;transform:translateY(-8px) scale(1.22) rotate(-6deg)}54%{transform:translateY(-4px) scale(1.15) rotate(-4deg)}84%{opacity:1;transform:translateY(-4px) scale(1.15) rotate(-4deg)}90%,100%{opacity:0;transform:translateY(30px) scale(.6)}}',
    '@keyframes vcmWave{0%,54%{transform:rotate(0)}58%{transform:rotate(24deg)}62%{transform:rotate(-12deg)}66%{transform:rotate(22deg)}70%{transform:rotate(-10deg)}74%{transform:rotate(16deg)}78%,100%{transform:rotate(0)}}',
    '@keyframes vcmEar{0%,60%{transform:rotate(0)}63%{transform:rotate(-10deg)}66%{transform:rotate(0)}}',
    '@keyframes vcmBubble{0%,50%{opacity:0;transform:scale(.6)}55%,82%{opacity:1;transform:scale(1)}87%,100%{opacity:0;transform:scale(.6)}}',
    '@media (prefers-reduced-motion:reduce){.vcm-wrap>img,.vcm-jag,.vcm-paw,.vcm-ear-l,.vcm-bubble{animation:none;}.vcm-jag,.vcm-bubble{display:none;}}'
  ].join('\n');

  /* Balam the jaguar — golden coat, rosettes, theme-colour bandana, waving paw */
  var SVG =
    '<svg viewBox="0 0 120 130" role="img" aria-hidden="true" focusable="false">' +
    /* chest + bandana (theme accent) */
    '<path d="M42 96 Q60 88 78 96 L78 124 Q60 130 42 124 Z" fill="#E8A33D" stroke="#8A5A23" stroke-width="1.5"/>' +
    '<path d="M40 92 Q60 100 80 92 L78 104 Q60 111 42 104 Z" fill="var(--top-badge-bg,#20C997)"/>' +
    '<path d="M56 104 L64 104 L62 116 L58 116 Z" fill="var(--top-badge-bg,#20C997)" opacity="0.85"/>' +
    /* ears */
    '<g class="vcm-ear-l"><circle cx="34" cy="36" r="11" fill="#E8A33D" stroke="#8A5A23" stroke-width="1.5"/><circle cx="34" cy="36" r="5.5" fill="#C77B4A"/></g>' +
    '<circle cx="86" cy="36" r="11" fill="#E8A33D" stroke="#8A5A23" stroke-width="1.5"/><circle cx="86" cy="36" r="5.5" fill="#C77B4A"/>' +
    /* head */
    '<circle cx="60" cy="62" r="32" fill="#E8A33D" stroke="#8A5A23" stroke-width="1.5"/>' +
    /* rosettes */
    '<g fill="#8A5A23"><circle cx="44" cy="40" r="3"/><circle cx="60" cy="35" r="2.6"/><circle cx="76" cy="40" r="3"/>' +
    '<circle cx="33" cy="60" r="2.6"/><circle cx="87" cy="60" r="2.6"/><circle cx="40" cy="76" r="2.2"/><circle cx="80" cy="76" r="2.2"/></g>' +
    '<g fill="none" stroke="#8A5A23" stroke-width="1.2" opacity="0.7"><circle cx="44" cy="40" r="5"/><circle cx="76" cy="40" r="5"/></g>' +
    /* muzzle */
    '<ellipse cx="60" cy="76" rx="15" ry="11" fill="#FBE8C8"/>' +
    '<circle cx="55" cy="72" r="0.9" fill="#8A5A23"/><circle cx="65" cy="72" r="0.9" fill="#8A5A23"/>' +
    '<circle cx="52" cy="76" r="0.9" fill="#8A5A23"/><circle cx="68" cy="76" r="0.9" fill="#8A5A23"/>' +
    /* nose + gentle warm smile (corners curve softly upward) */
    '<path d="M54 69 Q60 65 66 69 Q60 76 54 69 Z" fill="#4A2C15"/>' +
    '<path d="M60 73 L60 79" fill="none" stroke="#4A2C15" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M50 79 Q60 86 70 79" fill="none" stroke="#4A2C15" stroke-width="2" stroke-linecap="round"/>' +
    /* whiskers */
    '<g stroke="#4A2C15" stroke-width="1" opacity="0.35" stroke-linecap="round">' +
    '<path d="M44 74 L30 71"/><path d="M44 78 L31 79"/><path d="M76 74 L90 71"/><path d="M76 78 L89 79"/></g>' +
    /* eyes: white, green iris, pupil, sparkle, blinking lids */
    '<ellipse cx="48" cy="58" rx="7.5" ry="8.5" fill="#fff"/><ellipse cx="72" cy="58" rx="7.5" ry="8.5" fill="#fff"/>' +
    '<circle cx="48" cy="59" r="5.4" fill="#6FA84B"/><circle cx="72" cy="59" r="5.4" fill="#6FA84B"/>' +
    '<circle cx="48" cy="59" r="2.8" fill="#23150B"/><circle cx="72" cy="59" r="2.8" fill="#23150B"/>' +
    '<circle cx="46.6" cy="56.8" r="1.3" fill="#fff"/><circle cx="70.6" cy="56.8" r="1.3" fill="#fff"/>' +
    '<ellipse cx="48" cy="58" rx="8" ry="0" fill="#E8A33D"><animate attributeName="ry" values="0;0;9;0;0" keyTimes="0;0.46;0.5;0.54;1" dur="4.6s" repeatCount="indefinite"/></ellipse>' +
    '<ellipse cx="72" cy="58" rx="8" ry="0" fill="#E8A33D"><animate attributeName="ry" values="0;0;9;0;0" keyTimes="0;0.46;0.5;0.54;1" dur="4.6s" repeatCount="indefinite"/></ellipse>' +
    /* waving paw (in front, rotates from the wrist) */
    '<g class="vcm-paw">' +
    '<path d="M96 88 L103 58" stroke="#E8A33D" stroke-width="13" stroke-linecap="round"/>' +
    '<path d="M96 88 L103 58" stroke="#8A5A23" stroke-width="15" stroke-linecap="round" opacity="0.25"/>' +
    '<circle cx="104" cy="52" r="10" fill="#E8A33D" stroke="#8A5A23" stroke-width="1.5"/>' +
    '<g stroke="#8A5A23" stroke-width="1.4" stroke-linecap="round"><path d="M99 46 L97 42"/><path d="M104 44 L104 40"/><path d="M109 46 L111 42"/></g>' +
    '<circle cx="100" cy="55" r="1.6" fill="#8A5A23"/><circle cx="108" cy="55" r="1.6" fill="#8A5A23"/><circle cx="104" cy="58" r="1.8" fill="#8A5A23"/>' +
    '</g></svg>';

  function init() {
    if (document.body.hasAttribute('data-mascot-off')) return;
    var logo = document.querySelector('.site-header-logo img');
    if (!logo || logo.closest('.vcm-wrap')) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var wrap = document.createElement('span');
    wrap.className = 'vcm-wrap';
    logo.parentNode.insertBefore(wrap, logo);
    wrap.appendChild(logo);

    var jag = document.createElement('span');
    jag.className = 'vcm-jag';
    jag.setAttribute('aria-hidden', 'true');
    jag.innerHTML = SVG;
    wrap.appendChild(jag);

    var bubble = document.createElement('span');
    bubble.className = 'vcm-bubble';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.textContent = GREETINGS[0];
    wrap.appendChild(bubble);

    /* Rotate greeting each animation cycle */
    var i = 0;
    jag.addEventListener('animationiteration', function () {
      i = (i + 1) % GREETINGS.length;
      bubble.textContent = GREETINGS[i];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
