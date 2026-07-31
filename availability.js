/* ============================================================
   AVAILABILITY AUTO-SWITCH

   Every "arriving in Dubai on 1 Aug 2026" line on the site flips by
   itself to the UAE availability wording the moment 1 August 2026
   begins in Nepal — nothing to edit by hand on the day.

   Mark any element with both attributes and it is handled:
     data-avail-before="...text shown until the date..."
     data-avail-after="...text shown from the date onward..."

   Works on <meta> too (writes the content attribute instead of text).

   The cutoff is midnight Nepal time (UTC+05:45), which is
   31 July 2026 at 18:15 UTC. Using an absolute UTC instant means the
   switch happens at the same real-world moment for every visitor,
   whatever timezone their device is set to.
   ============================================================ */
(function () {
  var SWITCH_AT = Date.UTC(2026, 6, 31, 18, 15, 0); // month 6 = July

  function isAfter() {
    return Date.now() >= SWITCH_AT;
  }

  function apply(after, animate) {
    var nodes = document.querySelectorAll('[data-avail-before]');
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        var next = el.getAttribute(after ? 'data-avail-after' : 'data-avail-before');
        if (next === null) return;

        if (el.tagName === 'META') {
          if (el.getAttribute('content') !== next) el.setAttribute('content', next);
          return;
        }
        if (el.textContent === next) return;

        if (!animate) { el.textContent = next; return; }
        // Only when the page happens to be open across the boundary:
        // fade the old wording out, swap, fade the new one in.
        el.classList.add('avail-swapping');
        window.setTimeout(function () {
          el.textContent = next;
          el.classList.remove('avail-swapping');
        }, 300);
      })(nodes[i]);
    }
  }

  function check(animate) {
    var after = isAfter();
    apply(after, animate && after);
    return after;
  }

  function schedule() {
    if (check(true)) return;                       // already switched, nothing left to do
    var ms = SWITCH_AT - Date.now();
    // Cap the wait: browsers throttle long timers in background tabs, and
    // setTimeout overflows past ~24.8 days. Re-checking hourly is plenty.
    window.setTimeout(schedule, Math.min(ms + 500, 3600000));
  }

  function start() {
    check(false);   // no animation on first paint
    schedule();
  }

  // A backgrounded tab's timers get throttled, so re-check on wake-up too.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) check(true);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
