/**
 * Countdown — clock tick sound + "days tracked" counter.
 * Sound is ON by default and starts automatically on the first user gesture
 * (browsers block audio until then). A small fixed button mutes/unmutes it.
 * Tick/tock synthesized with the Web Audio API (no files).
 */
(function () {
  'use strict';

  var START = Date.parse('2026-08-02T00:00:00+04:00');
  var btn = document.getElementById('cd-sound');
  var secsEl = document.querySelector('[data-unit="secs"]');
  var daysEl = document.getElementById('cd-trackdays');

  // ---------- days tracked ----------
  function updDays() {
    if (!daysEl) return;
    var d = Math.floor((Date.now() - START) / 86400000);
    if (d < 0) d = 0;
    daysEl.textContent = d.toLocaleString('en-US') + (d === 1 ? ' day' : ' days');
  }
  updDays();

  // ---------- tick sound ----------
  var ctx = null, enabled = true, flip = false, lastSec = null, started = false;

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { ctx = new AC(); } catch (e) { ctx = null; } }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function tick(freq) {
    if (!ctx) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = freq; filt.Q.value = 7;
    osc.type = 'triangle'; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.06);
  }

  function render() {
    if (!btn) return;
    btn.classList.toggle('on', enabled);
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }

  // Auto-start audio on the first real user gesture anywhere on the page.
  var GESTURES = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  function firstGesture() {
    if (started) return;
    started = true;
    ensureCtx();
    GESTURES.forEach(function (ev) { window.removeEventListener(ev, firstGesture, true); });
  }
  GESTURES.forEach(function (ev) {
    window.addEventListener(ev, firstGesture, { capture: true, passive: true });
  });

  if (btn) {
    render();
    btn.addEventListener('click', function () {
      enabled = !enabled;
      if (enabled) { started = true; ensureCtx(); tick(2000); }
      render();
    });
  }

  // One tick per real second change; also refresh the day counter.
  if (secsEl && window.MutationObserver) {
    new MutationObserver(function () {
      var v = secsEl.textContent;
      if (v === lastSec) return;
      lastSec = v;
      updDays();
      if (!enabled || !ctx) return;
      flip = !flip;
      tick(flip ? 2000 : 1500);
    }).observe(secsEl, { childList: true, characterData: true, subtree: true });
  }
})();
