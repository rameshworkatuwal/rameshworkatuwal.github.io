/* Live YouTube stats — works on a static site.
   Priority: official Data API (if you add a key) -> keyless estimators.
   Always fails gracefully (never throws, never breaks the page). */
(function () {
  function fmt(n) {
    if (n == null || isNaN(n)) return '—';
    n = +n;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString();
  }

  async function j(url) {
    var r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('bad');
    return r.json();
  }

  // returns {subs, views, videos, src} best-effort, or null
  async function load(channelId, apiKey) {
    // 1) Official YouTube Data API (exact) — only if a key is provided
    if (apiKey) {
      try {
        var d = await j('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + channelId + '&key=' + apiKey);
        var s = d.items && d.items[0] && d.items[0].statistics;
        if (s) return { subs: +s.subscriberCount, views: +s.viewCount, videos: +s.videoCount, src: 'api' };
      } catch (e) {}
    }
    // 2) mixerno estimator (keyless) — subs, views, videos
    try {
      var m = await j('https://backend.mixerno.space/api/youtube/estv3/' + channelId);
      if (m && m.counts && m.counts.length) {
        var subs = m.counts[0] ? +m.counts[0].value : null;
        var views = m.counts[1] ? +m.counts[1].value : null;
        var videos = m.counts[2] ? +m.counts[2].value : null;
        if (subs != null && !isNaN(subs)) return { subs: subs, views: views, videos: videos, src: 'mixerno' };
      }
    } catch (e) {}
    // 3) socialcounts estimator (keyless) — subs (and sometimes views)
    try {
      var c = await j('https://api.socialcounts.org/youtube-live-subscriber-count/' + channelId);
      var sub = c.est_sub != null ? +c.est_sub : (c.apiEstSub != null ? +c.apiEstSub : null);
      if (sub != null && !isNaN(sub)) return { subs: sub, views: (c.est_view != null ? +c.est_view : null), videos: null, src: 'socialcounts' };
    } catch (e) {}
    return null;
  }

  window.YTLive = { fmt: fmt, load: load };
})();
