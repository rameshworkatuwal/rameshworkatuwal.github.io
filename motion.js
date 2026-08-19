/* ============================================================
   RITESH KATUWAL — MOTION V4 PERFORMANCE
   Smooth site-wide motion without pointer-follow spotlights, blur-heavy
   reveals, per-card mouse tracking or continuous parallax loops.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function qsa(selector, scope) {
    try { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
    catch (e) { return []; }
  }

  function injectStyles() {
    if (document.getElementById('rk-motion-v4-style')) return;
    var style = document.createElement('style');
    style.id = 'rk-motion-v4-style';
    style.textContent = `
:root{
  --rk-spring:cubic-bezier(.16,1,.3,1);
  --rk-soft:cubic-bezier(.22,.74,.22,1);
  --rk-cyan:#42d9ff;
  --rk-blue:#338dff;
  --rk-violet:#8a72ff;
}
html.rk-motion-v4{scroll-behavior:smooth}

/* Navigation: keep the glass look, remove the expensive animated layer. */
nav.rk-motion-nav{
  transition:padding .42s var(--rk-spring),background .35s ease,border-color .35s ease,box-shadow .35s ease!important;
}
nav.rk-motion-nav.rk-nav-condensed{
  padding-top:.66rem!important;
  padding-bottom:.66rem!important;
  background:rgba(5,7,13,.82)!important;
  border-bottom-color:rgba(120,180,220,.16)!important;
  box-shadow:0 10px 28px rgba(3,9,20,.13)!important;
  backdrop-filter:blur(14px) saturate(1.08)!important;
  -webkit-backdrop-filter:blur(14px) saturate(1.08)!important;
}
html[data-theme="light"] nav.rk-motion-nav.rk-nav-condensed{
  background:rgba(249,251,254,.94)!important;
  border-bottom-color:rgba(80,130,175,.14)!important;
  box-shadow:0 10px 28px rgba(40,72,110,.07)!important;
}

/* One cheap progress bar. */
.rk-scroll-progress{
  position:fixed;top:0;left:0;z-index:10000;width:100%;height:2px;pointer-events:none;
  transform-origin:0 50%;transform:scaleX(0);
  background:linear-gradient(90deg,var(--rk-cyan),var(--rk-blue) 48%,var(--rk-violet));
  box-shadow:0 0 10px rgba(67,202,255,.28);
  will-change:transform;
}

/* Entry motion: transform + opacity only. No blur filters. */
.rk-page-heading{
  opacity:0;
  transform:translate3d(0,24px,0) scale(.985);
  transition:opacity .62s .04s ease,transform .78s .04s var(--rk-spring);
}
html.rk-ready .rk-page-heading{opacity:1;transform:none}
.rk-reveal{
  --rk-delay:0ms;
  opacity:0;
  transform:translate3d(0,22px,0);
  transition:opacity .56s var(--rk-delay) ease,transform .7s var(--rk-delay) var(--rk-spring);
}
.rk-reveal.rk-in{opacity:1;transform:none}
.rk-section-heading{
  transition:transform .55s var(--rk-spring),opacity .5s ease;
}

/* Cards: no per-card JS tracking. GPU-friendly hover only. */
.rk-motion-card{
  position:relative!important;
  transform:translateZ(0);
  backface-visibility:hidden;
  transition:transform .42s var(--rk-spring),box-shadow .38s ease,border-color .32s ease!important;
}
.rk-motion-card img:not(.camera-meta img),.rk-motion-card video{
  transition:transform .55s var(--rk-spring)!important;
}
@media(hover:hover) and (pointer:fine){
  .rk-motion-card:hover{transform:translate3d(0,-5px,0)!important}
  .rk-motion-card:hover img:not(.camera-meta img),.rk-motion-card:hover video{transform:scale(1.018)}
}

/* Buttons: retain a tiny lift but remove magnetic pointer tracking. */
.rk-magnet{
  transition:transform .34s var(--rk-spring),box-shadow .34s ease!important;
}
@media(hover:hover) and (pointer:fine){.rk-magnet:hover{transform:translate3d(0,-2px,0) scale(1.015)}}

/* Portfolio panel switch. */
.portfolio-panel.rk-panel-enter:not([hidden]){animation:rkPanelEnter .48s var(--rk-spring) both}
@keyframes rkPanelEnter{
  from{opacity:0;transform:translate3d(0,16px,0)}
  to{opacity:1;transform:none}
}

/* Photography must stay especially cheap: no inherited 3D card transforms. */
.portfolio-page #photography-panel .album-folder.rk-motion-card,
.portfolio-page #photography-panel .gal-item.rk-motion-card{
  transform:translateZ(0)!important;
}
@media(hover:hover) and (pointer:fine){
  .portfolio-page #photography-panel .album-folder.rk-motion-card:hover{transform:translate3d(0,-4px,0)!important}
}

/* Quiet page leave. */
body.rk-page-leave{opacity:.88;transition:opacity .16s ease}

@media(max-width:760px){
  .rk-reveal{transform:translate3d(0,14px,0)}
  nav.rk-motion-nav.rk-nav-condensed{backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}
}
@media(prefers-reduced-motion:reduce){
  html.rk-motion-v4{scroll-behavior:auto}
  .rk-scroll-progress{display:none!important}
  .rk-page-heading,.rk-reveal,.rk-motion-card,.rk-magnet,.portfolio-panel.rk-panel-enter:not([hidden]){
    animation:none!important;transition:none!important;opacity:1!important;transform:none!important
  }
}
`;
    document.head.appendChild(style);
  }

  function classifyHeadings() {
    var pageHeading = document.querySelector('.hero-name,.page-title,.portfolio-title,.portfolio-heading-row h1,.about-hero h1,.skills-hero h1,.experience-hero h1,.youtube-title,.blog-title,main h1');
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
        var idx = Array.prototype.indexOf.call(parent.children, el);
        el.style.setProperty('--rk-delay', Math.min(Math.max(idx, 0), 5) * 42 + 'ms');
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
    }, { threshold: 0.04, rootMargin: '0px 0px -3% 0px' });
    seen.forEach(function (el) { io.observe(el); });
  }

  function setupPortfolioPanelMotion() {
    var panels = qsa('.portfolio-panel');
    if (!panels.length) return;
    function animateActive() {
      panels.forEach(function (panel) {
        if (panel.hidden || !panel.classList.contains('is-active')) return;
        panel.classList.remove('rk-panel-enter');
        void panel.offsetWidth;
        panel.classList.add('rk-panel-enter');
      });
    }
    qsa('.portfolio-tab').forEach(function (tab) { tab.addEventListener('click', animateActive); });
  }

  function setupButtons() {
    qsa('a.btn,button:not(.nav-toggle):not(.lb-nav):not(.lb-x),[data-magnet],[data-magnetic]').forEach(function (button) {
      if (button.closest('.lb,.tiktok-modal,.reel-modal')) return;
      button.classList.add('rk-magnet');
    });
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
    root.classList.remove('rk-motion-v3');
    root.classList.add('rk-motion-v4');
    classifyHeadings();
    classifyCards();
    setupReveals();
    setupButtons();
    setupPortfolioPanelMotion();
    setupPageLeave();

    var nav = document.querySelector('nav');
    if (nav) nav.classList.add('rk-motion-nav');

    var progress = document.querySelector('.progress');
    var ownProgress = false;
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'rk-scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
      ownProgress = true;
    }

    requestAnimationFrame(function () { root.classList.add('rk-ready'); });
    if (reduce) return;

    var ticking = false;
    function updateScroll() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var p = Math.max(0, Math.min(1, y / max));
      if (ownProgress) progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      else progress.style.width = (p * 100).toFixed(2) + '%';
      if (nav) nav.classList.toggle('rk-nav-condensed', y > 28);
    }
    function requestScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', requestScroll, { passive: true });
    updateScroll();
  });
})();
