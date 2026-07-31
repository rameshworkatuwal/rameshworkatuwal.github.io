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
