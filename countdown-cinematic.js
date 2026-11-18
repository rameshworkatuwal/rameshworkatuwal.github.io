/**
 * Countdown — cinematic entrance motion (homepage-cohesive)
 * GSAP timeline: header reveal, scene fade-in, staggered tile pop, card slide-up.
 * Touches only opacity/transform/filter and clears them after, so the live
 * chronometer (countdown.js) and the 3D parallax keep working untouched.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    // No JS / no GSAP / reduced-motion → content is already visible at rest.
    if (reduce || !window.gsap) return;

    var gsap = window.gsap;
    if (window.ScrollTrigger) {
      try { gsap.registerPlugin(window.ScrollTrigger); } catch (e) {}
    }

    var head  = document.querySelector('.cd-head');
    var scene = document.querySelector('.countdown-scene');
    var tiles = gsap.utils.toArray('.countdown-tile');
    var prog  = document.querySelector('.countdown-progress-section');
    var card  = document.querySelector('.countdown-action-card');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (head) {
      var eb = head.querySelector('.cd-eyebrow');
      var hl = head.querySelector('.cd-headline');
      var sb = head.querySelector('.cd-sub');
      if (eb) tl.from(eb, { y: 18, opacity: 0, duration: 0.6, clearProps: 'all' }, 0);
      if (hl) tl.from(hl, { y: 28, opacity: 0, duration: 0.85, clearProps: 'all' }, 0.08);
      if (sb) tl.from(sb, { y: 16, opacity: 0, duration: 0.6, clearProps: 'all' }, 0.26);
    }

    // Scene: fade + lift + subtle scale, then clear transform so the CSS
    // var-driven parallax (transform: rotateX(var(--cd-rx))...) resumes.
    if (scene) {
      tl.from(scene, {
        y: 44, opacity: 0, scale: 0.975,
        duration: 0.9, clearProps: 'transform,opacity'
      }, 0.2);
    }

    // Tiles: staggered pop-in from blur. clearProps so CSS hover transforms work.
    if (tiles.length) {
      tl.from(tiles, {
        y: 32, opacity: 0, scale: 0.9, filter: 'blur(7px)',
        duration: 0.7, stagger: 0.09, clearProps: 'all'
      }, '-=0.5');
    }

    if (prog) tl.from(prog, { y: 22, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.3');
    if (card) tl.from(card, { y: 30, opacity: 0, duration: 0.7, clearProps: 'all' }, '-=0.4');
  });
})();
