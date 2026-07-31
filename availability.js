/* ============================================================
   AVAILABILITY AUTO-SWITCH

   Every "arriving in Dubai on 1 Aug 2026" line on the site flips by
   itself to the UAE availability wording the moment 1 August 2026
   begins in Nepal — nothing to edit by hand on the day.

   Mark any element with both attributes and it is handled:
     data-avail-before="...text shown until the date..."
     data-avail-after="...text shown from the date onward..."

   Extras:
     data-avail-at="2026-08-03"     own cutoff date (default 1 Aug 2026)
     data-avail-only="before"       element is shown only before the date
     data-avail-only="after"        element is shown only from the date on

   Works on <meta> too (writes the content attribute instead of text).

   Cutoffs are midnight Nepal time (UTC+05:45) on the given date. Using an
   absolute UTC instant means the switch happens at the same real-world
   moment for every visitor, whatever timezone their device is set to.
   ============================================================ */
(function () {
  var DEFAULT_SWITCH = Date.UTC(2026, 6, 31, 18, 15, 0); // 1 Aug 2026, 00:00 NPT

  // "2026-08-03" -> the UTC instant of midnight Nepal time that day.
  function cutoffFor(el) {
    var attr = el && el.getAttribute && el.getAttribute('data-avail-at');
    if (!attr) return DEFAULT_SWITCH;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(attr);
    if (!m) return DEFAULT_SWITCH;
    // Nepal is UTC+05:45, so local midnight is 18:15 UTC the previous day.
    return Date.UTC(+m[1], +m[2] - 1, +m[3], 0, 0, 0) - (5 * 60 + 45) * 60 * 1000;
  }

  function isAfter(el) {
    return Date.now() >= cutoffFor(el);
  }

  function apply(animate) {
    var nodes = document.querySelectorAll('[data-avail-before], [data-avail-only]');
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        var after = isAfter(el);

        // show/hide-only elements
        var only = el.getAttribute('data-avail-only');
        if (only) {
          var show = (only === 'after') ? after : !after;
          if (el.hidden === show) el.hidden = !show;
          if (!el.hasAttribute('data-avail-before')) return;
        }

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

  // The soonest cutoff still ahead of us, so the page can flip itself
  // exactly on time even if it's left open.
  function nextCutoff() {
    var nodes = document.querySelectorAll('[data-avail-before], [data-avail-only]');
    var now = Date.now(), soonest = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var at = cutoffFor(nodes[i]);
      if (at > now && at < soonest) soonest = at;
    }
    return soonest;
  }

  function check(animate) {
    apply(animate);
    return nextCutoff() === Infinity;
  }

  function schedule() {
    if (check(true)) return;                       // every cutoff has passed
    var ms = nextCutoff() - Date.now();
    // Cap the wait: browsers throttle long timers in background tabs, and
    // setTimeout overflows past ~24.8 days. Re-checking hourly is plenty.
    window.setTimeout(schedule, Math.max(1000, Math.min(ms + 500, 3600000)));
  }

  function start() {
    apply(false);   // no animation on first paint
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
