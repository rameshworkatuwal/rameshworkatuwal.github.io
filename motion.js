/* ============================================================
   MOTION — fallback driver for the [data-anim] animation kit.

   Modern browsers (Chrome/Edge 115+, Firefox 132+, Safari 18+ —
   roughly 90% of visitors) run every entrance animation natively on
   the compositor via CSS `animation-timeline: view()`. No JavaScript
   is involved there at all, so scrolling stays perfectly smooth.

   This file only exists for the remaining browsers: it watches the
   same elements with an IntersectionObserver and adds `.anim-in`,
   which the CSS uses as its fallback trigger.

   It also powers the two effects CSS genuinely cannot do on its own:
   pointer-following card glow and magnetic buttons — both throttled
   to one update per animation frame.
   ============================================================ */
(function () {
  'use strict';

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var nativeScrollTimeline = false;
  try { nativeScrollTimeline = CSS.supports('animation-timeline', 'view()'); } catch (e) {}

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var items = document.querySelectorAll('[data-anim]');

    /* ---- entrance animations (only when CSS can't do it itself) ---- */
    if (reduced) {
      // Show everything immediately, animate nothing.
      for (var i = 0; i < items.length; i++) items[i].classList.add('anim-in');
    } else if (!nativeScrollTimeline && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('anim-in');
          io.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      for (var j = 0; j < items.length; j++) io.observe(items[j]);
    } else if (!nativeScrollTimeline) {
      for (var k = 0; k < items.length; k++) items[k].classList.add('anim-in');
    }

    if (reduced) return;

    /* ---- pointer-follow glow on cards ---- */
    var glowCards = document.querySelectorAll('[data-glow]');
    if (glowCards.length) {
      var glowQueued = false, glowPending = [];
      var onGlow = function (e) {
        var card = e.currentTarget;
        var r = card.getBoundingClientRect();
        glowPending.push([card, e.clientX - r.left, e.clientY - r.top]);
        if (glowQueued) return;
        glowQueued = true;
        requestAnimationFrame(function () {
          glowQueued = false;
          var batch = glowPending;
          glowPending = [];
          batch.forEach(function (p) {
            p[0].style.setProperty('--mx', p[1] + 'px');
            p[0].style.setProperty('--my', p[2] + 'px');
          });
        });
      };
      for (var g = 0; g < glowCards.length; g++) {
        glowCards[g].addEventListener('pointermove', onGlow, { passive: true });
      }
    }

    /* ---- magnetic buttons ---- */
    var magnets = document.querySelectorAll('[data-magnet]');
    for (var m = 0; m < magnets.length; m++) {
      (function (btn) {
        var frame = null;
        btn.addEventListener('pointermove', function (e) {
          if (frame) return;
          frame = requestAnimationFrame(function () {
            frame = null;
            var r = btn.getBoundingClientRect();
            btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22) +
                                  'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
          });
        }, { passive: true });
        btn.addEventListener('pointerleave', function () {
          btn.style.transform = '';
        });
      })(magnets[m]);
    }

    /* ---- 3D tilt ---- */
    var tilts = document.querySelectorAll('[data-tilt]');
    for (var t = 0; t < tilts.length; t++) {
      (function (card) {
        var frame = null;
        card.addEventListener('pointermove', function (e) {
          if (frame) return;
          frame = requestAnimationFrame(function () {
            frame = null;
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width;
            var py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--rx', ((0.5 - py) * 7).toFixed(2) + 'deg');
            card.style.setProperty('--ry', ((px - 0.5) * 9).toFixed(2) + 'deg');
          });
        }, { passive: true });
        card.addEventListener('pointerleave', function () {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      })(tilts[t]);
    }
  });
})();

/* ============================================================
   PORTFOLIO CINEMATIC MOTION — stronger, but compositor-friendly.
   The portfolio page gets a larger category rail, dimensional pointer
   tilt, animated aurora, staggered entrance, floating category icons,
   energetic hover states and click-burst particles.
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var page = document.querySelector('.portfolio-page');
    var switcher = page && page.querySelector('.portfolio-switch');
    if (!page || !switcher) return;

    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    if (!document.getElementById('portfolio-cinematic-motion-20260818')) {
      var style = document.createElement('style');
      style.id = 'portfolio-cinematic-motion-20260818';
      style.textContent = `
/* slightly larger, better balanced category rail */
.portfolio-page .portfolio-switch{
  --ps-rx:0deg;
  --ps-ry:0deg;
  --ps-mx:50%;
  --ps-my:50%;
  width:min(100%,1080px);
  max-width:1080px;
  padding:10px;
  border-radius:27px;
  transform:perspective(1300px) rotateX(var(--ps-rx)) rotateY(var(--ps-ry)) translateZ(0);
  transform-style:preserve-3d;
  will-change:transform;
  transition:transform .22s ease-out,border-color .35s,box-shadow .4s;
  box-shadow:0 24px 58px rgba(13,26,48,.14),0 8px 26px rgba(74,117,255,.08),inset 0 1px 0 rgba(255,255,255,.16);
}
.portfolio-page .portfolio-switch:hover{
  border-color:rgba(97,180,245,.28);
  box-shadow:0 34px 78px rgba(13,26,48,.2),0 15px 44px rgba(73,116,255,.15),inset 0 1px 0 rgba(255,255,255,.24);
}
.portfolio-page .portfolio-switch::before{
  inset:-65%;
  opacity:.7!important;
  filter:blur(45px)!important;
  background:
    radial-gradient(circle at 16% 42%,rgba(24,219,255,.42),transparent 27%),
    radial-gradient(circle at 47% 58%,rgba(255,58,129,.3),transparent 28%),
    radial-gradient(circle at 82% 38%,rgba(113,79,255,.42),transparent 29%),
    radial-gradient(circle at var(--ps-mx) var(--ps-my),rgba(255,255,255,.2),transparent 18%)!important;
  animation:portfolioAuroraHeavy 7.5s ease-in-out infinite alternate!important;
}
.portfolio-page .portfolio-switch::after{
  content:'';
  position:absolute;
  inset:0;
  z-index:-1;
  border-radius:inherit;
  pointer-events:none;
  background:
    linear-gradient(110deg,transparent 16%,rgba(255,255,255,.13) 31%,transparent 46%),
    radial-gradient(circle at var(--ps-mx) var(--ps-my),rgba(89,205,255,.18),transparent 23%);
  background-size:240% 100%,100% 100%;
  background-position:150% 0,0 0;
  animation:portfolioGlassSweep 5.8s ease-in-out infinite;
  mix-blend-mode:screen;
}
@keyframes portfolioAuroraHeavy{
  0%{transform:translate3d(-3%,2%,0) scale(1) rotate(-2deg)}
  50%{transform:translate3d(4%,-4%,0) scale(1.13) rotate(3deg)}
  100%{transform:translate3d(-1%,4%,0) scale(1.07) rotate(-1deg)}
}
@keyframes portfolioGlassSweep{
  0%,55%{background-position:150% 0,0 0;opacity:.42}
  82%{opacity:.8}
  100%{background-position:-70% 0,0 0;opacity:.42}
}

.portfolio-page .portfolio-switch-glider{
  top:10px;
  bottom:10px;
  left:10px;
  width:calc(25% - 7.5px);
  border-radius:19px;
  box-shadow:0 16px 34px -8px rgba(64,113,255,.48),0 0 30px color-mix(in srgb,var(--g1) 30%,transparent),inset 0 1px 0 rgba(255,255,255,.42);
}
.portfolio-page .portfolio-switch-glider::after{
  background:linear-gradient(180deg,rgba(255,255,255,.32),transparent 56%);
}

.portfolio-page .portfolio-tab{
  min-height:82px;
  gap:.82rem;
  padding:.8rem .9rem;
  border-radius:19px;
  transform-style:preserve-3d;
  transition:transform .32s cubic-bezier(.2,.8,.2,1),color .3s,filter .3s;
}
.portfolio-page .portfolio-tab strong{
  font-size:clamp(.98rem,1.25vw,1.12rem);
  font-weight:750;
  text-shadow:0 2px 18px rgba(50,90,150,.08);
}
.portfolio-page .portfolio-tab-icon{
  flex:0 0 54px;
  width:54px;
  height:54px;
  border-radius:16px;
  box-shadow:0 13px 30px -9px color-mix(in srgb,var(--i2) 72%,transparent),inset 0 1px 0 rgba(255,255,255,.48);
  animation:portfolioIconFloat 3.8s ease-in-out infinite alternate;
  animation-delay:calc(var(--motion-index,0) * -.47s);
  will-change:translate,rotate,filter;
}
.portfolio-page .portfolio-tab-icon svg{width:24px;height:24px}
.portfolio-page .portfolio-play-icon svg{width:20px;height:20px}
.portfolio-page .portfolio-tab:nth-of-type(2) .portfolio-tab-icon{--motion-index:1}
.portfolio-page .portfolio-tab:nth-of-type(3) .portfolio-tab-icon{--motion-index:2}
.portfolio-page .portfolio-tab:nth-of-type(4) .portfolio-tab-icon{--motion-index:3}
.portfolio-page .portfolio-tab:nth-of-type(5) .portfolio-tab-icon{--motion-index:4}
@keyframes portfolioIconFloat{
  0%{translate:0 2px;rotate:-1.8deg;filter:brightness(.96) saturate(.98)}
  55%{translate:0 -5px;rotate:1.5deg;filter:brightness(1.09) saturate(1.1)}
  100%{translate:1px -2px;rotate:-.5deg;filter:brightness(1.03) saturate(1.04)}
}
.portfolio-page .portfolio-tab:hover{
  transform:translateY(-5px) scale(1.025) translateZ(22px)!important;
  filter:brightness(1.06);
}
.portfolio-page .portfolio-tab:hover .portfolio-tab-icon{
  transform:scale(1.09) rotate(-5deg)!important;
  box-shadow:0 20px 38px -8px color-mix(in srgb,var(--i2) 78%,transparent),0 0 26px color-mix(in srgb,var(--i1) 42%,transparent),inset 0 1px 0 rgba(255,255,255,.55);
}
.portfolio-page .portfolio-tab.is-active{
  transform:translateZ(28px)!important;
}
.portfolio-page .portfolio-tab.is-active strong{
  animation:portfolioActiveText 1.7s ease-in-out infinite alternate;
}
@keyframes portfolioActiveText{
  from{text-shadow:0 0 0 rgba(255,255,255,0)}
  to{text-shadow:0 0 18px rgba(255,255,255,.42),0 4px 18px rgba(10,20,50,.22)}
}

/* cinematic first-load entrance; JS removes the class after landing */
.portfolio-page.motion-intro .portfolio-heading-row h1{
  animation:portfolioTitleLand 1.05s cubic-bezier(.16,.88,.24,1.12) both;
}
.portfolio-page.motion-intro .portfolio-gradient-word{
  background-size:230% 100%;
  animation:portfolioGradientRun 2.4s ease-out both;
}
.portfolio-page.motion-intro .portfolio-switch{
  animation:portfolioRailLand 1.05s .12s cubic-bezier(.16,.86,.2,1.08) both;
}
.portfolio-page.motion-intro .portfolio-tab{
  animation:portfolioTabLand .82s cubic-bezier(.16,.9,.22,1.18) both;
  animation-delay:calc(.28s + var(--intro-index,0) * .09s);
}
.portfolio-page .portfolio-tab:nth-of-type(2){--intro-index:0}
.portfolio-page .portfolio-tab:nth-of-type(3){--intro-index:1}
.portfolio-page .portfolio-tab:nth-of-type(4){--intro-index:2}
.portfolio-page .portfolio-tab:nth-of-type(5){--intro-index:3}
.portfolio-page.motion-intro .portfolio-panel-hint{
  animation:portfolioHintLand .75s .7s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes portfolioTitleLand{
  0%{opacity:0;transform:translateY(-36px) scale(.88);filter:blur(18px)}
  55%{opacity:1;transform:translateY(8px) scale(1.035);filter:blur(0)}
  100%{opacity:1;transform:none;filter:blur(0)}
}
@keyframes portfolioGradientRun{
  0%{background-position:100% 0;filter:saturate(.7)}
  100%{background-position:0 0;filter:saturate(1.18)}
}
@keyframes portfolioRailLand{
  0%{opacity:0;transform:perspective(1300px) rotateX(18deg) scale(.82) translateY(48px);filter:blur(14px)}
  62%{opacity:1;transform:perspective(1300px) rotateX(-2deg) scale(1.025) translateY(-5px);filter:blur(0)}
  100%{opacity:1;transform:perspective(1300px) rotateX(0) scale(1) translateY(0);filter:blur(0)}
}
@keyframes portfolioTabLand{
  0%{opacity:0;translate:0 38px;scale:.78;filter:blur(9px)}
  65%{opacity:1;translate:0 -4px;scale:1.035;filter:blur(0)}
  100%{opacity:1;translate:0 0;scale:1;filter:blur(0)}
}
@keyframes portfolioHintLand{
  from{opacity:0;translate:-26px 0;filter:blur(8px)}
  to{opacity:1;translate:0 0;filter:blur(0)}
}

/* animated title even after entrance */
.portfolio-page:not(.motion-intro) .portfolio-gradient-word{
  background-size:210% 100%;
  animation:portfolioTitleFlow 5.5s ease-in-out infinite alternate;
}
@keyframes portfolioTitleFlow{
  from{background-position:0 0;filter:saturate(1)}
  to{background-position:100% 0;filter:saturate(1.25) brightness(1.08)}
}

/* stronger hint life */
.portfolio-page .portfolio-panel-hint{
  animation:portfolioHintHover 3.6s ease-in-out infinite alternate;
  box-shadow:0 10px 26px rgba(33,90,160,.07);
}
@keyframes portfolioHintHover{
  from{translate:0 0;box-shadow:0 10px 26px rgba(33,90,160,.07)}
  to{translate:0 -4px;box-shadow:0 16px 34px rgba(33,90,160,.13)}
}

/* click energy burst */
.portfolio-motion-burst{
  position:absolute;
  z-index:8;
  width:8px;
  height:8px;
  margin:-4px 0 0 -4px;
  border-radius:50%;
  pointer-events:none;
  background:linear-gradient(135deg,var(--g1),var(--g2));
  box-shadow:0 0 14px color-mix(in srgb,var(--g1) 70%,transparent);
  animation:portfolioParticleFly .72s cubic-bezier(.12,.72,.24,1) forwards;
}
@keyframes portfolioParticleFly{
  0%{opacity:1;transform:translate(0,0) scale(1)}
  70%{opacity:.9}
  100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.12)}
}
.portfolio-motion-ring{
  position:absolute;
  z-index:7;
  width:20px;
  height:20px;
  margin:-10px 0 0 -10px;
  border:2px solid color-mix(in srgb,var(--g1) 72%,white 12%);
  border-radius:50%;
  pointer-events:none;
  animation:portfolioRingBlast .72s cubic-bezier(.12,.72,.24,1) forwards;
}
@keyframes portfolioRingBlast{
  from{opacity:.95;transform:scale(.25)}
  to{opacity:0;transform:scale(7.5)}
}

html[data-theme="light"] .portfolio-page .portfolio-switch{
  box-shadow:0 24px 55px rgba(42,72,120,.12),0 8px 24px rgba(65,120,220,.08),inset 0 1px 0 rgba(255,255,255,.9);
}

@media(max-width:760px){
  .portfolio-page .portfolio-switch{width:100%;padding:7px;border-radius:20px;transform:none!important}
  .portfolio-page .portfolio-switch-glider{top:7px;bottom:7px;left:7px;width:calc(25% - 5.25px);border-radius:14px}
  .portfolio-page .portfolio-tab{min-height:78px;gap:.34rem;padding:.55rem .2rem;border-radius:14px}
  .portfolio-page .portfolio-tab strong{font-size:.72rem;line-height:1.12;text-align:center;white-space:normal}
  .portfolio-page .portfolio-tab-icon{flex-basis:38px;width:38px;height:38px;border-radius:11px}
  .portfolio-page .portfolio-tab-icon svg{width:18px;height:18px}
}

@media(prefers-reduced-motion:reduce){
  .portfolio-page .portfolio-switch,
  .portfolio-page .portfolio-switch::before,
  .portfolio-page .portfolio-switch::after,
  .portfolio-page .portfolio-tab,
  .portfolio-page .portfolio-tab-icon,
  .portfolio-page .portfolio-tab.is-active strong,
  .portfolio-page .portfolio-gradient-word,
  .portfolio-page .portfolio-panel-hint{
    animation:none!important;
    transition:none!important;
    transform:none!important;
    translate:none!important;
    rotate:none!important;
  }
  .portfolio-motion-burst,.portfolio-motion-ring{display:none!important}
}
`;
      document.head.appendChild(style);
    }

    var tabs = Array.prototype.slice.call(switcher.querySelectorAll('.portfolio-tab'));

    if (!reduce) {
      page.classList.add('motion-intro');
      window.setTimeout(function () {
        page.classList.remove('motion-intro');
      }, 1450);
    }

    /* dimensional rail tilt and pointer-follow light */
    var tiltFrame = 0;
    switcher.addEventListener('pointermove', function (event) {
      if (reduce || window.innerWidth < 761) return;
      if (tiltFrame) return;
      tiltFrame = requestAnimationFrame(function () {
        tiltFrame = 0;
        var rect = switcher.getBoundingClientRect();
        var px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        var py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        switcher.style.setProperty('--ps-rx', ((0.5 - py) * 5.5).toFixed(2) + 'deg');
        switcher.style.setProperty('--ps-ry', ((px - 0.5) * 7).toFixed(2) + 'deg');
        switcher.style.setProperty('--ps-mx', (px * 100).toFixed(1) + '%');
        switcher.style.setProperty('--ps-my', (py * 100).toFixed(1) + '%');
      });
    }, { passive: true });

    switcher.addEventListener('pointerleave', function () {
      switcher.style.setProperty('--ps-rx', '0deg');
      switcher.style.setProperty('--ps-ry', '0deg');
      switcher.style.setProperty('--ps-mx', '50%');
      switcher.style.setProperty('--ps-my', '50%');
    });

    /* mild magnetic pull on each category without breaking the existing hover scale */
    tabs.forEach(function (tab) {
      var frame = 0;
      tab.addEventListener('pointermove', function (event) {
        if (reduce || window.innerWidth < 761 || frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var rect = tab.getBoundingClientRect();
          var x = (event.clientX - rect.left - rect.width / 2) * 0.035;
          var y = (event.clientY - rect.top - rect.height / 2) * 0.055;
          tab.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
        });
      }, { passive: true });
      tab.addEventListener('pointerleave', function () {
        tab.style.translate = '';
      });

      tab.addEventListener('click', function (event) {
        if (reduce) return;
        var rect = switcher.getBoundingClientRect();
        var x = event.clientX ? event.clientX - rect.left : tab.offsetLeft + tab.offsetWidth / 2;
        var y = event.clientY ? event.clientY - rect.top : tab.offsetTop + tab.offsetHeight / 2;

        var ring = document.createElement('span');
        ring.className = 'portfolio-motion-ring';
        ring.style.left = x + 'px';
        ring.style.top = y + 'px';
        switcher.appendChild(ring);

        for (var i = 0; i < 11; i++) {
          var angle = (Math.PI * 2 * i / 11) + (Math.random() * 0.32 - 0.16);
          var distance = 44 + Math.random() * 52;
          var particle = document.createElement('span');
          particle.className = 'portfolio-motion-burst';
          particle.style.left = x + 'px';
          particle.style.top = y + 'px';
          particle.style.setProperty('--dx', (Math.cos(angle) * distance).toFixed(1) + 'px');
          particle.style.setProperty('--dy', (Math.sin(angle) * distance).toFixed(1) + 'px');
          particle.style.animationDelay = (Math.random() * 60) + 'ms';
          switcher.appendChild(particle);
          window.setTimeout((function (node) {
            return function () { if (node.parentNode) node.parentNode.removeChild(node); };
          })(particle), 900);
        }
        window.setTimeout(function () {
          if (ring.parentNode) ring.parentNode.removeChild(ring);
        }, 900);
      });
    });

    /* tiny hero parallax gives the title some depth without changing layout */
    var title = page.querySelector('.portfolio-heading-row h1');
    var titleFrame = 0;
    page.addEventListener('pointermove', function (event) {
      if (reduce || !title || window.innerWidth < 761 || titleFrame) return;
      titleFrame = requestAnimationFrame(function () {
        titleFrame = 0;
        var px = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
        var py = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
        title.style.translate = (px * 9).toFixed(1) + 'px ' + (py * 6).toFixed(1) + 'px';
      });
    }, { passive: true });

    page.addEventListener('pointerleave', function () {
      if (title) title.style.translate = '';
    });
  });
})();
