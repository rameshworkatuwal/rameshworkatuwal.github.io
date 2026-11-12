/**
 * Precision Chronometer & Countdown Engine
 * Target: October 1, 2027 00:00:00 GST (Dubai, UTC+4)
 */
(function () {
  'use strict';

  var root = document.getElementById('countdown-app');
  if (!root) return;

  var target = Date.parse('2027-10-01T00:00:00+04:00');
  var start = Date.parse('2026-10-01T00:00:00+04:00'); // Baseline 1-year journey tracker
  var totalSpan = target - start;

  var scene = root.querySelector('.countdown-scene');
  var daysEl = root.querySelector('[data-unit="days"]');
  var hoursEl = root.querySelector('[data-unit="hours"]');
  var minsEl = root.querySelector('[data-unit="mins"]');
  var secsEl = root.querySelector('[data-unit="secs"]');
  var msEl = root.querySelector('[data-unit="ms"]');

  var progressBar = root.querySelector('.countdown-progress-bar');
  var progressVal = root.querySelector('.countdown-progress-val');

  var telWeeks = root.querySelector('[data-tel="weeks"]');
  var telHours = root.querySelector('[data-tel="hours"]');
  var telSecs = root.querySelector('[data-tel="secs"]');
  var telLocal = root.querySelector('[data-tel="local"]');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var lastSec = -1;
  var lastMin = -1;
  var lastHour = -1;
  var lastDay = -1;
  var rafId = null;

  // Animate a number changing smoothly with a micro spring effect
  function animateTick(el) {
    if (reduced.matches || !el || !el.animate) return;
    try {
      if (el.getAnimations) {
        el.getAnimations().forEach(function (anim) { anim.cancel(); });
      }
      el.animate([
        { transform: 'translateY(-10px) scale(0.96)', opacity: 0.45, filter: 'blur(2px)' },
        { transform: 'translateY(0) scale(1)', opacity: 1, filter: 'blur(0)' }
      ], {
        duration: 340,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      });
    } catch (e) {}
  }

  function formatCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

    // Mathematical breakdowns
    var totalSecs = Math.floor(diff / 1000);
    var days = Math.floor(totalSecs / 86400);
    var hours = Math.floor((totalSecs % 86400) / 3600);
    var mins = Math.floor((totalSecs % 3600) / 60);
    var secs = totalSecs % 60;
    var ms = diff % 1000;

    // Milliseconds: high-precision 3-digit update
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
      // Fill levels for liquid visualization
      if (secsEl && secsEl.parentElement) {
        var secFill = ((60 - secs) / 60) * 100;
        secsEl.parentElement.style.setProperty('--cd-fill', secFill.toFixed(1) + '%');
      }
      // Telemetry updates
      if (telSecs) telSecs.textContent = formatCommas(totalSecs) + ' s';
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
      if (telHours) {
        var totalHours = Math.floor(diff / (1000 * 60 * 60));
        telHours.textContent = formatCommas(totalHours) + ' hrs';
      }
      if (telWeeks) {
        var weeks = (diff / (1000 * 60 * 60 * 24 * 7)).toFixed(1);
        telWeeks.textContent = weeks + ' wks';
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

    // Continuous Progress tracking with fractional precision
    var elapsed = Math.max(0, Math.min(1, (now - start) / totalSpan));
    var percent = (elapsed * 100).toFixed(4);
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

  // Local visitor time display in telemetry
  function updateLocalTime() {
    if (!telLocal) return;
    try {
      var d = new Date();
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      var timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      telLocal.textContent = timeStr + ' (' + tz.split('/').pop().replace('_', ' ') + ')';
    } catch (e) {
      telLocal.textContent = 'Live Synced';
    }
  }
  updateLocalTime();
  setInterval(updateLocalTime, 1000);

  // Interactive 3D Cursor Parallax on Scene
  if (scene) {
    scene.addEventListener('pointermove', function (e) {
      if (reduced.matches || e.pointerType !== 'mouse') return;
      var rect = scene.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      scene.style.setProperty('--cd-glow-x', (x * 100).toFixed(1) + '%');
      scene.style.setProperty('--cd-glow-y', (y * 100).toFixed(1) + '%');
      scene.style.setProperty('--cd-rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
      scene.style.setProperty('--cd-ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
    });

    scene.addEventListener('pointerleave', function () {
      scene.style.setProperty('--cd-rx', '0deg');
      scene.style.setProperty('--cd-ry', '0deg');
      scene.style.setProperty('--cd-glow-x', '50%');
      scene.style.setProperty('--cd-glow-y', '50%');
    });
  }

  // Share button click
  var shareBtn = root.querySelector('#countdown-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          var orig = shareBtn.innerHTML;
          shareBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Link Copied!';
          setTimeout(function () { shareBtn.innerHTML = orig; }, 2200);
        });
      } else {
        alert('URL: ' + url);
      }
    });
  }

  // Kick off the loop
  startLoop();
})();
