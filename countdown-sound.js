/**
 * Countdown — clock tick sound.
 * A real clock-style tick/tock plays on each change of the seconds digit.
 * Browsers block audio until a user gesture, so sound starts only after the
 * user presses the toggle. Synthesized with the Web Audio API (no files).
 */
(function () {
  'use strict';

  var btn = document.getElementById('cd-sound');
  var secsEl = document.querySelector('[data-unit="secs"]');
  if (!btn) return;

  var ctx = null;
  var enabled = false;
  var flip = false;
  var lastSec = null;

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { ctx = new AC(); } catch (e) { ctx = null; } }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // One short, dry clock click.
  function tick(freq) {
    if (!ctx) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = freq;
    filt.Q.value = 7;
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.45, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  function render() {
    btn.classList.toggle('on', enabled);
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    var label = btn.querySelector('span');
    if (label) label.textContent = enabled ? 'Tick sound on' : 'Tick sound off';
  }

  btn.addEventListener('click', function () {
    enabled = !enabled;
    if (enabled) { ensureCtx(); tick(2000); } // instant feedback on enable
    render();
  });

  // Fire exactly once per real second change (guard against same-value writes).
  if (secsEl && window.MutationObserver) {
    new MutationObserver(function () {
      var v = secsEl.textContent;
      if (v === lastSec) return;
      lastSec = v;
      if (!enabled || !ctx) return;
      flip = !flip;
      tick(flip ? 2000 : 1500); // tick / tock
    }).observe(secsEl, { childList: true, characterData: true, subtree: true });
  }
})();
