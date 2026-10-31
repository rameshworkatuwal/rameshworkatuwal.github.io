(function () {
  'use strict';
  var section = document.getElementById('countdown');
  if (!section) return;
  var nodes = section.querySelectorAll('[data-countdown-unit]');
  var scene = section.querySelector('.countdown-scene');
  var target = Date.parse('2027-10-01T00:00:00+04:00');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var timer;
  var start = Date.parse('2026-10-01T00:00:00+04:00');
  var progress = section.querySelector('.countdown-progress');
  function tick() {
    var seconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
    var values = [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60];
    var elapsed = Math.max(0, Math.min(1, (Date.now() - start) / (target - start)));
    scene.style.setProperty('--cd-progress', (elapsed * 100).toFixed(3) + '%');
    if (progress) progress.setAttribute('aria-valuenow', (elapsed * 100).toFixed(1));
    var levels = [elapsed, 1 - (seconds % 86400) / 86400, 1 - (seconds % 3600) / 3600, 1 - (seconds % 60) / 60];
    nodes.forEach(function (node, i) {
      node.parentElement.style.setProperty('--cd-fill', (levels[i] * 100).toFixed(2) + '%');
      var value = i ? String(values[i]).padStart(2, '0') : String(values[i]);
      if (node.textContent === value) return;
      var first = node.textContent === '—';
      node.textContent = value;
      if (!first && !reduced.matches && node.animate) {
        node.getAnimations().forEach(function (animation) { animation.cancel(); });
        node.animate([{transform:'translateZ(18px) rotateX(-65deg)',opacity:.35},{transform:'translateZ(18px) rotateX(0deg)',opacity:1}],{duration:450,easing:'cubic-bezier(.2,.8,.2,1)'});
      }
    });
    if (!seconds && timer) { clearInterval(timer); timer = null; }
  }
  function resume() {
    if (timer) clearInterval(timer);
    timer = null;
    if (document.hidden) return;
    tick();
    if (Date.now() < target) timer = setInterval(tick, 1000);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      section.classList.toggle('motion-paused', !entries[0].isIntersecting);
    }, {threshold:0}).observe(section);
  }
  document.addEventListener('visibilitychange', function () {
    section.classList.toggle('motion-paused', document.hidden);
  });
  resume();
  document.addEventListener('visibilitychange', resume);
  scene.addEventListener('pointermove', function (event) {
    if (reduced.matches || event.pointerType !== 'mouse') return;
    var rect = scene.getBoundingClientRect();
    scene.style.setProperty('--cd-glow-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
    scene.style.setProperty('--cd-glow-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
    scene.style.setProperty('--cd-rx', ((.5 - (event.clientY - rect.top) / rect.height) * 5) + 'deg');
    scene.style.setProperty('--cd-ry', (((event.clientX - rect.left) / rect.width - .5) * 6) + 'deg');
  });
  scene.addEventListener('pointerleave', function () {
    scene.style.setProperty('--cd-rx', '0deg');
    scene.style.setProperty('--cd-ry', '0deg');
  });
})();
