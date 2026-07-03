/* Subtle UI sound effects — synthesized (no audio files needed).
   Plays soft blips on hover/click of nav links, buttons, tabs.
   Includes a floating mute toggle; preference saved in localStorage. */
(function () {
  var KEY = 'rk_sfx_muted';
  var muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) {}

  var ctx = null;
  function ensureCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ctx && ctx.state === 'suspended') { ctx.resume(); }
    return ctx;
  }

  function blip(freq, dur, vol, type) {
    if (muted) return;
    var c = ensureCtx(); if (!c) return;
    var t = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.82, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  var hover = function () { blip(1250, 0.06, 0.03, 'sine'); };
  var click = function () { blip(560, 0.12, 0.06, 'triangle'); setTimeout(function(){ blip(880, 0.09, 0.04, 'sine'); }, 42); };

  function wire() {
    var sel = '.nav-links a, .btn, .soc, .cm-tab, [data-sound]';
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.__sfx) return; el.__sfx = 1;
      el.addEventListener('mouseenter', hover);
      el.addEventListener('click', click);
    });
  }

  function makeToggle() {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Toggle sound');
    b.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:9998;width:42px;height:42px;border-radius:50%;' +
      'border:1px solid rgba(120,180,220,0.28);background:rgba(10,15,28,0.75);backdrop-filter:blur(10px);' +
      'color:#38e1ff;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 6px 20px rgba(0,0,0,.4);transition:transform .25s,border-color .25s;';
    b.onmouseenter = function(){ b.style.transform='scale(1.08)'; b.style.borderColor='#38e1ff'; };
    b.onmouseleave = function(){ b.style.transform='scale(1)'; b.style.borderColor='rgba(120,180,220,0.28)'; };
    function icon() {
      b.innerHTML = muted
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
    }
    icon();
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      muted = !muted;
      try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (er) {}
      icon();
      if (!muted) { ensureCtx(); blip(880, 0.1, 0.05, 'sine'); }
    });
    document.body.appendChild(b);
  }

  function init() { wire(); makeToggle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
