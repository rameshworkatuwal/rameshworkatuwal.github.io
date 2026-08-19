/* ============================================================
   RITESH KATUWAL — MOTION V3
   A site-wide cinematic motion layer inspired by the restraint, depth,
   progressive disclosure and glass-like transitions used on modern product
   pages. It is intentionally original code: no Apple assets or source code.

   Principles:
   - big motion on entry, quiet motion at rest
   - transform/opacity first for compositor-friendly animation
   - one RAF loop for scroll/pointer work
   - reduced-motion and touch fallbacks built in
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = false;
  var coarse = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    coarse = window.matchMedia('(pointer: coarse)').matches;
  } catch (e) {}

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function injectStyles() {
    if (document.getElementById('rk-motion-v3-style')) return;
    var style = document.createElement('style');
    style.id = 'rk-motion-v3-style';
    style.textContent = `
:root{
  --rk-spring:cubic-bezier(.16,1,.3,1);
  --rk-soft:cubic-bezier(.22,.74,.22,1);
  --rk-cyan:#42d9ff;
  --rk-blue:#338dff;
  --rk-violet:#8a72ff;
  --rk-pink:#f05aa8;
}

html.rk-motion-v3{scroll-behavior:smooth}
html.rk-motion-v3 body{
  --rk-scroll:0;
  --rk-spot-x:50vw;
  --rk-spot-y:24vh;
}

/* ---------- global ambient depth ---------- */
.rk-motion-spotlight{
  position:fixed;
  left:0;
  top:0;
  z-index:1;
  width:min(58vw,760px);
  aspect-ratio:1;
  border-radius:50%;
  pointer-events:none;
  opacity:.22;
  transform:translate3d(calc(var(--rk-spot-x) - 50%),calc(var(--rk-spot-y) - 50%),0);
  background:radial-gradient(circle,rgba(72,205,255,.25) 0%,rgba(103,105,255,.13) 28%,rgba(240,90,168,.055) 46%,transparent 72%);
  filter:blur(44px) saturate(1.15);
  mix-blend-mode:screen;
  transition:opacity .4s ease;
  will-change:transform;
}
html[data-theme="light"] .rk-motion-spotlight{
  opacity:.12;
  mix-blend-mode:multiply;
  filter:blur(54px) saturate(1.05);
}
.rk-scroll-progress{
  position:fixed;
  top:0;
  left:0;
  z-index:10000;
  width:100%;
  height:2px;
  pointer-events:none;
  transform-origin:0 50%;
  transform:scaleX(var(--rk-scroll));
  background:linear-gradient(90deg,var(--rk-cyan),var(--rk-blue) 42%,var(--rk-violet) 76%,var(--rk-pink));
  box-shadow:0 0 18px rgba(67,202,255,.42);
  transition:transform .08s linear;
}

/* ---------- navigation: soft liquid-glass compression ---------- */
nav.rk-motion-nav{
  --rk-nav-alpha:.58;
  isolation:isolate;
  transition:padding .52s var(--rk-spring),background .45s ease,border-color .45s ease,box-shadow .45s ease,transform .45s var(--rk-spring)!important;
}
nav.rk-motion-nav::before{
  content:'';
  position:absolute;
  inset:0;
  z-index:-2;
  pointer-events:none;
  background:linear-gradient(110deg,rgba(255,255,255,.045),transparent 34%,rgba(79,200,255,.045) 62%,transparent 84%);
  background-size:220% 100%;
  animation:rkNavGlass 10s ease-in-out infinite;
}
nav.rk-motion-nav.rk-nav-condensed{
  padding-top:.62rem!important;
  padding-bottom:.62rem!important;
  background:color-mix(in srgb,var(--bg,#05070d) 72%,transparent)!important;
  border-bottom-color:color-mix(in srgb,var(--line,rgba(120,180,220,.14)) 110%,transparent)!important;
  box-shadow:0 14px 40px rgba(4,10,24,.12),inset 0 1px rgba(255,255,255,.035);
  backdrop-filter:blur(24px) saturate(1.25)!important;
  -webkit-backdrop-filter:blur(24px) saturate(1.25)!important;
}
@keyframes rkNavGlass{0%,55%{background-position:130% 0}100%{background-position:-80% 0}}
.rk-nav-pill{
  position:absolute;
  z-index:-1;
  left:0;
  top:0;
  width:0;
  height:0;
  border:1px solid rgba(109,196,255,.13);
  border-radius:12px;
  background:linear-gradient(145deg,rgba(85,205,255,.105),rgba(120,97,255,.07));
  box-shadow:inset 0 1px rgba(255,255,255,.12),0 8px 24px rgba(35,109,194,.055);
  opacity:0;
  transform:translate3d(0,0,0);
  transition:transform .48s var(--rk-spring),width .48s var(--rk-spring),height .48s var(--rk-spring),opacity .22s ease;
  pointer-events:none;
}
.rk-nav-pill.is-on{opacity:1}

/* ---------- cinematic heading reveal ---------- */
.rk-page-heading,
.rk-section-heading{
  position:relative;
  transform-origin:50% 100%;
}
.rk-page-heading{
  --rk-head-y:44px;
  opacity:0;
  transform:translate3d(0,var(--rk-head-y),0) scale(.94);
  filter:blur(14px);
  transition:opacity .95s .08s var(--rk-soft),transform 1.15s .08s var(--rk-spring),filter .9s .08s ease;
}
html.rk-ready .rk-page-heading{
  opacity:1;
  transform:translate3d(0,0,0) scale(1);
  filter:blur(0);
}
.rk-section-heading{
  background-image:linear-gradient(100deg,currentColor 0%,currentColor 36%,var(--rk-cyan) 52%,var(--rk-violet) 68%,currentColor 84%);
  background-size:260% 100%;
  background-position:110% 0;
  -webkit-background-clip:text;
  background-clip:text;
  transition:background-position 1.35s var(--rk-spring),filter .7s ease;
}
.rk-section-heading.rk-in{
  background-position:0 0;
  filter:drop-shadow(0 10px 28px rgba(57,161,255,.08));
}

/* ---------- progressive scroll reveal ---------- */
.rk-reveal{
  --rk-delay:0ms;
  opacity:0;
  filter:blur(13px);
  transform:translate3d(0,44px,0) scale(.975);
  transition:
    opacity .82s var(--rk-delay) var(--rk-soft),
    filter .9s var(--rk-delay) ease,
    transform 1.02s var(--rk-delay) var(--rk-spring);
  will-change:transform,opacity,filter;
}
.rk-reveal.rk-in{
  opacity:1;
  filter:blur(0);
  transform:translate3d(0,0,0) scale(1);
}
.rk-reveal.rk-reveal-left{transform:translate3d(-46px,10px,0) scale(.985)}
.rk-reveal.rk-reveal-right{transform:translate3d(46px,10px,0) scale(.985)}
.rk-reveal.rk-reveal-left.rk-in,
.rk-reveal.rk-reveal-right.rk-in{transform:translate3d(0,0,0) scale(1)}

/* ---------- card system: depth, pointer light, edge sweep ---------- */
.rk-motion-card{
  --rk-rx:0deg;
  --rk-ry:0deg;
  --rk-lift:0px;
  --rk-card-x:50%;
  --rk-card-y:30%;
  position:relative!important;
  isolation:isolate;
  transform:perspective(1100px) rotateX(var(--rk-rx)) rotateY(var(--rk-ry)) translate3d(0,var(--rk-lift),0);
  transform-style:preserve-3d;
  transition:transform .7s var(--rk-spring),box-shadow .55s ease,border-color .45s ease,filter .5s ease!important;
  will-change:transform;
}
.rk-motion-card::before{
  content:'';
  position:absolute;
  inset:0;
  z-index:8;
  border-radius:inherit;
  pointer-events:none;
  opacity:0;
  background:
    radial-gradient(circle at var(--rk-card-x) var(--rk-card-y),rgba(255,255,255,.17),transparent 23%),
    radial-gradient(circle at var(--rk-card-x) var(--rk-card-y),rgba(66,207,255,.12),transparent 39%);
  mix-blend-mode:screen;
  transition:opacity .38s ease;
}
.rk-motion-card::after{
  content:'';
  position:absolute;
  inset:-1px;
  z-index:9;
  border-radius:inherit;
  padding:1px;
  pointer-events:none;
  opacity:.16;
  background:linear-gradient(125deg,transparent 16%,rgba(83,214,255,.54) 38%,rgba(137,107,255,.46) 52%,transparent 76%);
  background-size:230% 100%;
  background-position:130% 0;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  transition:opacity .4s ease,background-position .85s var(--rk-spring);
}
@media(hover:hover) and (pointer:fine){
  .rk-motion-card:hover{
    --rk-lift:-8px;
    box-shadow:0 28px 64px rgba(6,16,35,.2),0 7px 20px rgba(45,135,220,.07)!important;
    filter:saturate(1.025);
  }
  .rk-motion-card:hover::before{opacity:1}
  .rk-motion-card:hover::after{opacity:.72;background-position:-60% 0}
}
html[data-theme="light"] .rk-motion-card::before{
  mix-blend-mode:multiply;
  background:radial-gradient(circle at var(--rk-card-x) var(--rk-card-y),rgba(45,165,221,.09),transparent 35%);
}

/* Images feel like they sit one layer below the glass. */
.rk-motion-card img:not(.camera-meta img),
.rk-motion-card video{
  transition:transform 1.05s var(--rk-spring),filter .65s ease!important;
}
@media(hover:hover) and (pointer:fine){
  .rk-motion-card:hover img:not(.camera-meta img),
  .rk-motion-card:hover video{
    transform:scale(1.028);
  }
}

/* ---------- buttons: magnetic + light sweep ---------- */
.rk-magnet{
  --rk-btn-x:0px;
  --rk-btn-y:0px;
  translate:var(--rk-btn-x) var(--rk-btn-y);
  position:relative!important;
  overflow:hidden;
  transition:translate .55s var(--rk-spring),transform .45s var(--rk-spring),box-shadow .45s ease!important;
}
.rk-magnet::after{
  content:'';
  position:absolute;
  inset:-60% -30%;
  pointer-events:none;
  background:linear-gradient(110deg,transparent 32%,rgba(255,255,255,.32) 48%,transparent 64%);
  transform:translateX(-70%) rotate(6deg);
  transition:transform .82s var(--rk-spring);
}
@media(hover:hover) and (pointer:fine){
  .rk-magnet:hover{transform:scale(1.035)}
  .rk-magnet:hover::after{transform:translateX(70%) rotate(6deg)}
}

/* ---------- section media parallax ---------- */
.rk-parallax-media{
  --rk-py:0px;
  translate:0 var(--rk-py);
  transition:translate .1s linear;
  will-change:translate;
}

/* ---------- portfolio panel switching ---------- */
.portfolio-panel.rk-panel-enter:not([hidden]){
  animation:rkPanelEnter .88s var(--rk-spring) both;
}
@keyframes rkPanelEnter{
  0%{opacity:0;transform:translate3d(0,34px,0) scale(.985);filter:blur(10px)}
  65%{opacity:1;transform:translate3d(0,-3px,0) scale(1.004);filter:blur(0)}
  100%{opacity:1;transform:none;filter:blur(0)}
}
.portfolio-switch.rk-motion-card{
  transform:perspective(1400px) rotateX(calc(var(--rk-rx) * .48)) rotateY(calc(var(--rk-ry) * .48)) translate3d(0,var(--rk-lift),0)!important;
}

/* ---------- gear gets a product-stage feel ---------- */
#gear-panel .gear-card.rk-motion-card.is-current{
  box-shadow:0 30px 70px rgba(2,10,26,.32),0 0 34px rgba(72,169,255,.08)!important;
}
#gear-panel .gear-product img{
  filter:drop-shadow(0 24px 24px rgba(0,0,0,.32));
  transition:transform 1s var(--rk-spring),filter .6s ease!important;
}
#gear-panel .gear-card:hover .gear-product img{
  transform:translate3d(0,-7px,30px) scale(1.045)!important;
  filter:drop-shadow(0 34px 31px rgba(0,0,0,.42));
}

/* ---------- photography: keep the custom hairline, add quiet depth ---------- */
#photography-panel .album-folder.rk-motion-card{
  transform:perspective(1200px) rotateX(calc(var(--rk-rx) * .55)) rotateY(calc(var(--rk-ry) * .55)) translate3d(0,var(--rk-lift),0)!important;
}
#photography-panel .gal-item{
  transition:transform .72s var(--rk-spring),box-shadow .52s ease,filter .5s ease!important;
}

/* ---------- footer / CTA land gently ---------- */
.cta-strip.rk-in,
.cta-section.rk-in,
.contact-cta.rk-in{
  box-shadow:0 34px 86px rgba(35,95,165,.09);
}

/* ---------- page leave ---------- */
body.rk-page-leave{
  opacity:.72;
  transform:scale(.995);
  filter:blur(2px);
  transition:opacity .24s ease,transform .3s var(--rk-soft),filter .24s ease;
}

@media(max-width:760px){
  .rk-motion-spotlight{display:none}
  .rk-motion-card{transform:none!important}
  .rk-motion-card:hover{transform:none!important}
  .rk-reveal{transform:translate3d(0,24px,0) scale(.99);filter:blur(7px)}
  .rk-page-heading{--rk-head-y:24px;filter:blur(8px)}
  nav.rk-motion-nav.rk-nav-condensed{backdrop-filter:blur(18px) saturate(1.12)!important}
}

@media(prefers-reduced-motion:reduce){
  html.rk-motion-v3{scroll-behavior:auto}
  .rk-motion-spotlight,.rk-scroll-progress,.rk-nav-pill{display:none!important}
  .rk-page-heading,.rk-reveal,.rk-section-heading,.rk-motion-card,.rk-magnet,.rk-parallax-media,
  .portfolio-panel.rk-panel-enter:not([hidden]){
    animation:none!important;
    transition:none!important;
    opacity:1!important;
    filter:none!important;
    transform:none!important;
    translate:none!important;
  }
}
`;
    document.head.appendChild(style);
  }

  function qsa(selector, scope) {
    try { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
    catch (e) { return []; }
  }

  function addAmbient() {
    if (!document.querySelector('.rk-motion-spotlight')) {
      var spot = document.createElement('div');
      spot.className = 'rk-motion-spotlight';
      spot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(spot);
    }
    if (!document.querySelector('.rk-scroll-progress')) {
      var progress = document.createElement('div');
      progress.className = 'rk-scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
    }
  }

  function classifyHeadings() {
    var pageHeading = document.querySelector(
      '.hero-name,.page-title,.portfolio-title,.portfolio-heading-row h1,.about-hero h1,.skills-hero h1,.experience-hero h1,.youtube-title,.blog-title,main h1'
    );
    if (pageHeading) pageHeading.classList.add('rk-page-heading');

    qsa('.sec-title,.section-title,.panel-intro h2,.gear-heading h2,.gal-set-head h3,.cta-strip h2,.cta-section h2,.about-section h2,.skills-section h2,main section > h2').forEach(function (h) {
      h.classList.add('rk-section-heading');
    });
  }

  function classifyCards() {
    var selector = [
      '.card','.skill-card','.exp-card','.experience-card','.timeline-item','.blog-card','.youtube-card','.yt-card',
      '.project-card','.portfolio-card','.portfolio-tab','.portfolio-switch','.album-folder','.gear-card','.reel-card','.tiktok-card',
      '.about-card','.stat-card','.cert-card','.contact-card','.work-card'
    ].join(',');

    qsa(selector).forEach(function (card) {
      if (card.closest('.lb,.tiktok-modal,.reel-modal')) return;
      card.classList.add('rk-motion-card');
    });
  }

  function setupReveals() {
    var selector = [
      '[data-anim]','.reveal','.reveal-stagger','.rk-section-heading',
      '.card','.skill-card','.exp-card','.experience-card','.timeline-item','.blog-card','.youtube-card','.yt-card',
      '.project-card','.album-folder','.gear-card','.about-card','.stat-card','.cert-card','.contact-card',
      '.cta-strip','.cta-section','.contact-cta'
    ].join(',');

    var seen = [];
    qsa(selector).forEach(function (el) {
      if (seen.indexOf(el) !== -1 || el.classList.contains('rk-page-heading') || el.closest('.lb,.tiktok-modal,.reel-modal')) return;
      seen.push(el);
      el.classList.add('rk-reveal');
      var parent = el.parentElement;
      if (parent) {
        var siblings = qsa(':scope > .rk-reveal', parent);
        var idx = siblings.indexOf(el);
        if (idx < 0) idx = Array.prototype.indexOf.call(parent.children, el);
        el.style.setProperty('--rk-delay', Math.min(Math.max(idx, 0), 6) * 68 + 'ms');
      }
    });

    if (reduce || !('IntersectionObserver' in window)) {
      seen.forEach(function (el) { el.classList.add('rk-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('rk-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    seen.forEach(function (el) { io.observe(el); });
  }

  function setupNav() {
    var nav = document.querySelector('nav');
    if (!nav) return null;
    nav.classList.add('rk-motion-nav');

    var pill = document.createElement('span');
    pill.className = 'rk-nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.appendChild(pill);

    var links = qsa('.nav-links a', nav).filter(function (a) { return !a.closest('.nav-submenu'); });
    if (!links.length) return nav;

    var active = links.find(function (a) {
      var href = a.getAttribute('href') || '';
      if (a.classList.contains('active') || a.getAttribute('aria-current') === 'page') return true;
      if (!href || href.charAt(0) === '#') return false;
      var current = location.pathname.split('/').pop() || 'index.html';
      var target = href.split('#')[0].split('/').pop() || 'index.html';
      return current === target;
    }) || null;

    function place(link) {
      if (!link || coarse || reduce) {
        pill.classList.remove('is-on');
        return;
      }
      var nr = nav.getBoundingClientRect();
      var lr = link.getBoundingClientRect();
      pill.style.width = lr.width + 18 + 'px';
      pill.style.height = lr.height + 10 + 'px';
      pill.style.transform = 'translate3d(' + (lr.left - nr.left - 9) + 'px,' + (lr.top - nr.top - 5) + 'px,0)';
      pill.classList.add('is-on');
    }

    links.forEach(function (link) {
      link.addEventListener('pointerenter', function () { place(link); }, { passive: true });
      link.addEventListener('focus', function () { place(link); });
    });
    nav.addEventListener('pointerleave', function () { place(active); }, { passive: true });
    window.addEventListener('resize', function () { place(active); }, { passive: true });
    window.setTimeout(function () { place(active); }, 80);
    return nav;
  }

  function setupMagnets() {
    var buttons = qsa('a.btn,button:not(.nav-toggle):not(.lb-nav):not(.lb-x),[data-magnet],[data-magnetic],.portfolio-tab');
    buttons.forEach(function (btn) {
      if (btn.closest('.lb,.tiktok-modal,.reel-modal') || btn.classList.contains('gear-prev') || btn.classList.contains('gear-next')) return;
      btn.classList.add('rk-magnet');
      if (reduce || coarse) return;
      btn.addEventListener('pointermove', function (event) {
        var r = btn.getBoundingClientRect();
        var x = (event.clientX - r.left - r.width / 2) * .16;
        var y = (event.clientY - r.top - r.height / 2) * .22;
        btn.style.setProperty('--rk-btn-x', x.toFixed(2) + 'px');
        btn.style.setProperty('--rk-btn-y', y.toFixed(2) + 'px');
      }, { passive: true });
      btn.addEventListener('pointerleave', function () {
        btn.style.setProperty('--rk-btn-x', '0px');
        btn.style.setProperty('--rk-btn-y', '0px');
      }, { passive: true });
    });
  }

  function setupCardPointer() {
    if (reduce || coarse) return;
    var cards = qsa('.rk-motion-card');
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var px = Math.max(0, Math.min(1, (event.clientX - r.left) / r.width));
        var py = Math.max(0, Math.min(1, (event.clientY - r.top) / r.height));
        card.style.setProperty('--rk-card-x', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--rk-card-y', (py * 100).toFixed(1) + '%');
        if (!card.matches('.card[data-glow]')) {
          card.style.setProperty('--rk-rx', ((.5 - py) * 4.8).toFixed(2) + 'deg');
          card.style.setProperty('--rk-ry', ((px - .5) * 6.2).toFixed(2) + 'deg');
        }
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rk-card-x', '50%');
        card.style.setProperty('--rk-card-y', '30%');
        card.style.setProperty('--rk-rx', '0deg');
        card.style.setProperty('--rk-ry', '0deg');
      }, { passive: true });
    });
  }

  function setupParallax() {
    var targets = [];
    [
      '.hero-visual','.profile-stack','.profile-visual','.about-visual','.hero-media','.page-visual',
      '.portfolio-heading-row','.gear-heading','.youtube-hero-media','.blog-hero-media'
    ].forEach(function (selector) {
      qsa(selector).forEach(function (el) {
        if (targets.indexOf(el) === -1 && !el.closest('.lb,.modal')) {
          targets.push(el);
          el.classList.add('rk-parallax-media');
        }
      });
    });
    return targets;
  }

  function setupPortfolioPanelMotion() {
    var switcher = document.querySelector('.portfolio-switch');
    if (!switcher) return;
    var panels = qsa('.portfolio-panel');
    function animateActive() {
      panels.forEach(function (panel) {
        if (panel.hidden || !panel.classList.contains('is-active')) return;
        panel.classList.remove('rk-panel-enter');
        void panel.offsetWidth;
        panel.classList.add('rk-panel-enter');
      });
    }
    var observer = new MutationObserver(function () { animateActive(); });
    panels.forEach(function (panel) { observer.observe(panel, { attributes: true, attributeFilter: ['hidden','class'] }); });
    qsa('.portfolio-tab').forEach(function (tab) { tab.addEventListener('click', animateActive); });
    animateActive();
  }

  function setupPageLeave() {
    qsa('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        var href = link.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#' || link.target || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;
        try {
          var u = new URL(link.href, location.href);
          if (u.origin !== location.origin) return;
        } catch (e) { return; }
        document.body.classList.add('rk-page-leave');
      });
    });
  }

  ready(function () {
    injectStyles();
    root.classList.add('rk-motion-v3');
    addAmbient();
    classifyHeadings();
    classifyCards();
    setupReveals();
    var nav = setupNav();
    setupMagnets();
    setupCardPointer();
    var parallax = setupParallax();
    setupPortfolioPanelMotion();
    setupPageLeave();

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('rk-ready'); });
    });

    if (reduce) {
      root.classList.add('rk-ready');
      qsa('.rk-reveal').forEach(function (el) { el.classList.add('rk-in'); });
      return;
    }

    var targetX = window.innerWidth * .5;
    var targetY = window.innerHeight * .28;
    var spotX = targetX;
    var spotY = targetY;
    var scrollY = window.scrollY || 0;
    var scrollDirty = true;
    var pointerDirty = false;
    var raf = 0;

    function update() {
      raf = 0;
      if (pointerDirty && !coarse) {
        spotX += (targetX - spotX) * .16;
        spotY += (targetY - spotY) * .16;
        document.body.style.setProperty('--rk-spot-x', spotX.toFixed(1) + 'px');
        document.body.style.setProperty('--rk-spot-y', spotY.toFixed(1) + 'px');
        if (Math.abs(targetX - spotX) > .5 || Math.abs(targetY - spotY) > .5) requestTick();
        else pointerDirty = false;
      }

      if (scrollDirty) {
        scrollDirty = false;
        var doc = document.documentElement;
        var max = Math.max(1, doc.scrollHeight - window.innerHeight);
        var progress = Math.max(0, Math.min(1, scrollY / max));
        document.body.style.setProperty('--rk-scroll', progress.toFixed(4));
        if (nav) nav.classList.toggle('rk-nav-condensed', scrollY > 28);

        var vh = window.innerHeight || 800;
        parallax.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < -120 || r.top > vh + 120) return;
          var center = r.top + r.height * .5;
          var normalized = (center - vh * .5) / vh;
          var strength = el.matches('.portfolio-heading-row,.gear-heading') ? 13 : 24;
          var offset = Math.max(-strength, Math.min(strength, -normalized * strength));
          el.style.setProperty('--rk-py', offset.toFixed(1) + 'px');
        });
      }
    }

    function requestTick() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    window.addEventListener('pointermove', function (event) {
      if (coarse) return;
      targetX = event.clientX;
      targetY = event.clientY;
      pointerDirty = true;
      requestTick();
    }, { passive: true });

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      scrollDirty = true;
      requestTick();
    }, { passive: true });

    window.addEventListener('resize', function () {
      scrollDirty = true;
      requestTick();
    }, { passive: true });

    requestTick();
  });
})();
