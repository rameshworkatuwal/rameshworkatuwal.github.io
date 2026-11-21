/**
 * Apple Keynote Sleek Cinematic Chronometer Engine
 * Target: October 1, 2027 00:00:00 GST (Dubai, UTC+4)
 * Journey Start: August 2, 2026
 */
(function () {
  'use strict';

  var root = document.getElementById('countdown-app');
  if (!root) return;

  var target = Date.parse('2027-10-01T00:00:00+04:00');
  var start = Date.parse('2026-08-02T00:00:00+04:00');
  var totalSpan = target - start;
  var introStart = 0;

  var scene = root.querySelector('.countdown-scene');
  var daysEl = root.querySelector('[data-unit="days"]');
  var hoursEl = root.querySelector('[data-unit="hours"]');
  var minsEl = root.querySelector('[data-unit="mins"]');
  var secsEl = root.querySelector('[data-unit="secs"]');
  var msEl = root.querySelector('[data-unit="ms"]');

  var progressBar = root.querySelector('.countdown-progress-bar');
  var progressVal = root.querySelector('.countdown-progress-val');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var lastSec = -1;
  var lastMin = -1;
  var lastHour = -1;
  var lastDay = -1;
  var rafId = null;

  // Spring tick animation for unit changes
  function animateTick(el) {
    if (reduced.matches || !el || !el.animate) return;
    try {
      if (el.getAnimations) {
        el.getAnimations().forEach(function (anim) { anim.cancel(); });
      }
      el.animate([
        { transform: 'translateZ(18px) translateY(-8px) scale(0.96)', opacity: 0.5, filter: 'blur(2px)' },
        { transform: 'translateZ(18px) translateY(0) scale(1)', opacity: 1, filter: 'blur(0)' }
      ], {
        duration: 360,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      });
    } catch (e) {}
  }

  function update() {
    var now = Date.now();
    var diff = Math.max(0, target - now);

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '0';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      if (msEl) msEl.textContent = '000';
      if (progressVal) progressVal.textContent = '100.0000%';
      if (progressBar) progressBar.style.width = '100%';
      return;
    }

    var totalSecs = Math.floor(diff / 1000);
    var days = Math.floor(totalSecs / 86400);
    var hours = Math.floor((totalSecs % 86400) / 3600);
    var mins = Math.floor((totalSecs % 3600) / 60);
    var secs = totalSecs % 60;
    var ms = diff % 1000;

    // Milliseconds (ultra-fast, non-jitter tabular digits)
    if (msEl) {
      msEl.textContent = String(ms).padStart(3, '0');
    }

    // Seconds
    if (secs !== lastSec) {
      lastSec = secs;
      if (secsEl) {
        secsEl.textContent = String(secs).padStart(2, '0');
        animateTick(secsEl);
      }
      if (secsEl && secsEl.parentElement) {
        var secFill = ((60 - secs) / 60) * 100;
        secsEl.parentElement.style.setProperty('--cd-fill', secFill.toFixed(1) + '%');
      }
    }

    // Minutes
    if (mins !== lastMin) {
      lastMin = mins;
      if (minsEl) {
        minsEl.textContent = String(mins).padStart(2, '0');
        animateTick(minsEl);
      }
      if (minsEl && minsEl.parentElement) {
        var minFill = ((60 - mins) / 60) * 100;
        minsEl.parentElement.style.setProperty('--cd-fill', minFill.toFixed(1) + '%');
      }
    }

    // Hours
    if (hours !== lastHour) {
      lastHour = hours;
      if (hoursEl) {
        hoursEl.textContent = String(hours).padStart(2, '0');
        animateTick(hoursEl);
      }
      if (hoursEl && hoursEl.parentElement) {
        var hourFill = ((24 - hours) / 24) * 100;
        hoursEl.parentElement.style.setProperty('--cd-fill', hourFill.toFixed(1) + '%');
      }
    }

    // Days
    if (days !== lastDay) {
      lastDay = days;
      if (daysEl) {
        daysEl.textContent = String(days);
        animateTick(daysEl);
      }
      if (daysEl && daysEl.parentElement) {
        var dayFill = Math.min(100, Math.max(0, (days / 365) * 100));
        daysEl.parentElement.style.setProperty('--cd-fill', dayFill.toFixed(1) + '%');
      }
    }

    // Progress percentage — animates up from 0 on every load, then stays live.
    var elapsed = Math.max(0, Math.min(1, (now - start) / totalSpan));
    var nowT = (window.performance && performance.now) ? performance.now() : Date.now();
    if (!introStart) introStart = nowT;
    var it = Math.min(1, (nowT - introStart) / 1600);
    var intro = 1 - Math.pow(1 - it, 3); // easeOutCubic
    var shown = elapsed * intro;
    var percent = (shown * 100).toFixed(4);
    if (progressVal) {
      progressVal.textContent = percent + '%';
    }
    if (scene) {
      scene.style.setProperty('--cd-progress', percent + '%');
    }

    rafId = requestAnimationFrame(update);
  }

  function startLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(update);
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Handle visibility changes (stop loop in background tab to save battery)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  // Apple-grade Smooth Inertial Parallax on Scene
  if (scene) {
    var targetRx = 0;
    var targetRy = 0;
    var currentRx = 0;
    var currentRy = 0;
    var targetGlowX = 50;
    var targetGlowY = 50;
    var currentGlowX = 50;
    var currentGlowY = 50;
    var isHovering = false;
    var tiltRaf = null;

    function renderTilt() {
      // Smooth linear interpolation (lerp)
      currentRx += (targetRx - currentRx) * 0.12;
      currentRy += (targetRy - currentRy) * 0.12;
      currentGlowX += (targetGlowX - currentGlowX) * 0.15;
      currentGlowY += (targetGlowY - currentGlowY) * 0.15;

      scene.style.setProperty('--cd-rx', currentRx.toFixed(2) + 'deg');
      scene.style.setProperty('--cd-ry', currentRy.toFixed(2) + 'deg');
      scene.style.setProperty('--cd-glow-x', currentGlowX.toFixed(1) + '%');
      scene.style.setProperty('--cd-glow-y', currentGlowY.toFixed(1) + '%');

      if (isHovering || Math.abs(currentRx) > 0.05 || Math.abs(currentRy) > 0.05) {
        tiltRaf = requestAnimationFrame(renderTilt);
      } else {
        scene.style.setProperty('--cd-rx', '0deg');
        scene.style.setProperty('--cd-ry', '0deg');
        tiltRaf = null;
      }
    }

    scene.addEventListener('pointermove', function (e) {
      if (reduced.matches || e.pointerType !== 'mouse') return;
      var rect = scene.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;

      targetGlowX = x * 100;
      targetGlowY = y * 100;
      targetRx = (0.5 - y) * 8.5; // Max 4.25deg tilt
      targetRy = (x - 0.5) * 9.5; // Max 4.75deg tilt

      isHovering = true;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(renderTilt);
    });

    scene.addEventListener('pointerleave', function () {
      targetRx = 0;
      targetRy = 0;
      targetGlowX = 50;
      targetGlowY = 50;
      isHovering = false;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(renderTilt);
    });
  }

  // Share button click with copy feedback
  var shareBtn = root.querySelector('#countdown-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          var orig = shareBtn.innerHTML;
          shareBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Link Copied!';
          shareBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          setTimeout(function () {
            shareBtn.innerHTML = orig;
            shareBtn.style.background = '';
          }, 2200);
        });
      } else {
        alert('Milestone URL: ' + url);
      }
    });
  }

  // Kick off the chronometer
  startLoop();
})();
