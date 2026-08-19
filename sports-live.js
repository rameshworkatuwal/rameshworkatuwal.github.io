/* ============================================================
   HOME — SPORTS LIVE / TODAY
   Static-GitHub-Pages friendly sports rail powered by TheSportsDB v1.
   The free API supplies today's schedule/results; cards refresh in place.
   ============================================================ */
(function () {
  'use strict';

  if (!document.querySelector('.hero') || document.getElementById('rkSportsLive')) return;

  var API = 'https://www.thesportsdb.com/api/v1/json/123/eventsday.php';
  var SPORTS = [
    ['Soccer', 'Football', '⚽'],
    ['Basketball', 'Basketball', '🏀'],
    ['Cricket', 'Cricket', '🏏'],
    ['Tennis', 'Tennis', '🎾'],
    ['Motorsport', 'Motorsport', '🏎️'],
    ['Baseball', 'Baseball', '⚾'],
    ['Ice Hockey', 'Ice Hockey', '🏒'],
    ['American Football', 'American Football', '🏈'],
    ['Rugby', 'Rugby', '🏉']
  ];
  var REFRESH_MS = 5 * 60 * 1000;
  var CACHE_KEY = 'rk_sports_today_v1';
  var allEvents = [];
  var activeSport = 'All';

  function localDate() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function sportMeta(name) {
    for (var i = 0; i < SPORTS.length; i++) if (SPORTS[i][0] === name) return SPORTS[i];
    return [name || 'Sport', name || 'Sport', '🏆'];
  }

  function parseStart(event) {
    if (event.strTimestamp) {
      var ts = Date.parse(event.strTimestamp);
      if (!isNaN(ts)) return ts;
    }
    var date = event.dateEvent || localDate();
    var time = (event.strTime || '00:00:00').slice(0, 8);
    var utc = Date.parse(date + 'T' + time + 'Z');
    return isNaN(utc) ? 0 : utc;
  }

  function stateOf(event) {
    var status = String(event.strStatus || '').toLowerCase();
    if (/live|in progress|1h|2h|half|quarter|inning|period|set|playing|underway/.test(status)) return 'live';
    if (/finished|final|ft|after extra|aet|ended|complete|completed/.test(status)) return 'done';
    return 'upcoming';
  }

  function score(event, side) {
    var value = side === 'home' ? event.intHomeScore : event.intAwayScore;
    return value == null || value === '' ? '—' : value;
  }

  function niceTime(event) {
    var start = parseStart(event);
    if (!start) return event.strTime ? event.strTime.slice(0, 5) : 'Today';
    try {
      return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(start));
    } catch (e) {
      return event.strTime ? event.strTime.slice(0, 5) : 'Today';
    }
  }

  function shortLeague(event) {
    return event.strLeague || event.strLeagueAlternate || event.strSeason || 'Today';
  }

  function initials(name) {
    var p = String(name || '?').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '?';
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }

  function teamLogo(url, name) {
    if (url) return '<img src="' + esc(url) + '" alt="" loading="lazy" decoding="async">';
    return '<span>' + esc(initials(name)) + '</span>';
  }

  function normalize(event, sportName) {
    event = event || {};
    if (!event.strSport) event.strSport = sportName;
    event.__state = stateOf(event);
    event.__start = parseStart(event);
    return event;
  }

  function dedupe(events) {
    var seen = Object.create(null);
    return events.filter(function (event) {
      var key = event.idEvent || [event.strSport, event.strEvent, event.strHomeTeam, event.strAwayTeam, event.strTime].join('|');
      if (seen[key]) return false;
      seen[key] = 1;
      return true;
    });
  }

  function eventSort(a, b) {
    var rank = { live: 0, upcoming: 1, done: 2 };
    var r = rank[a.__state] - rank[b.__state];
    if (r) return r;
    if (a.__state === 'done') return (b.__start || 0) - (a.__start || 0);
    return (a.__start || 0) - (b.__start || 0);
  }

  function card(event) {
    var meta = sportMeta(event.strSport);
    var state = event.__state;
    var home = event.strHomeTeam || '';
    var away = event.strAwayTeam || '';
    var eventName = event.strEvent || event.strFilename || meta[1];
    var teamMode = !!(home || away);
    var badge = state === 'live' ? '<span class="rk-sports-live-dot"></span>LIVE' : (state === 'done' ? 'FINAL' : niceTime(event));
    var body;

    if (teamMode) {
      body =
        '<div class="rk-sports-team"><span class="rk-sports-logo">' + teamLogo(event.strHomeTeamBadge, home) + '</span><b>' + esc(home || 'Home') + '</b><strong>' + esc(score(event, 'home')) + '</strong></div>' +
        '<div class="rk-sports-team"><span class="rk-sports-logo">' + teamLogo(event.strAwayTeamBadge, away) + '</span><b>' + esc(away || 'Away') + '</b><strong>' + esc(score(event, 'away')) + '</strong></div>';
    } else {
      body = '<div class="rk-sports-event-name"><span>' + esc(meta[2]) + '</span><b>' + esc(eventName) + '</b></div>';
    }

    return '<article class="rk-sports-card rk-sports-' + state + '" data-sport="' + esc(event.strSport || '') + '">' +
      '<div class="rk-sports-card-top"><span class="rk-sports-sport">' + esc(meta[2] + ' ' + meta[1]) + '</span><span class="rk-sports-status">' + badge + '</span></div>' +
      '<div class="rk-sports-league" title="' + esc(shortLeague(event)) + '">' + esc(shortLeague(event)) + '</div>' +
      '<div class="rk-sports-match">' + body + '</div>' +
    '</article>';
  }

  function render() {
    var rail = document.querySelector('#rkSportsLive .rk-sports-rail');
    var empty = document.querySelector('#rkSportsLive .rk-sports-empty');
    var count = document.querySelector('#rkSportsLive .rk-sports-count');
    if (!rail) return;

    var filtered = activeSport === 'All' ? allEvents : allEvents.filter(function (event) { return event.strSport === activeSport; });
    filtered = filtered.slice(0, 24);
    count.textContent = filtered.length ? filtered.length + ' matches' : 'No matches';

    if (!filtered.length) {
      rail.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    rail.innerHTML = filtered.map(card).join('');
  }

  function setUpdated(fromCache) {
    var label = document.querySelector('#rkSportsLive .rk-sports-updated');
    if (!label) return;
    var time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
    label.textContent = (fromCache ? 'Cached · ' : 'Updated · ') + time;
  }

  function readCache() {
    try {
      var cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!cache || cache.date !== localDate() || !Array.isArray(cache.events)) return null;
      return cache;
    } catch (e) { return null; }
  }

  function writeCache(events) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ date: localDate(), at: Date.now(), events: events })); }
    catch (e) {}
  }

  function fetchSport(sport) {
    var url = API + '?d=' + encodeURIComponent(localDate()) + '&s=' + encodeURIComponent(sport);
    return fetch(url, { cache: 'no-store', mode: 'cors' })
      .then(function (response) { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
      .then(function (json) { return (json && json.events || []).map(function (event) { return normalize(event, sport); }); })
      .catch(function () { return []; });
  }

  function refresh(force) {
    var cached = readCache();
    if (!force && cached && Date.now() - cached.at < REFRESH_MS) {
      allEvents = dedupe(cached.events.map(function (event) { return normalize(event, event.strSport); })).sort(eventSort);
      render();
      setUpdated(true);
      return Promise.resolve();
    }

    var refreshBtn = document.querySelector('#rkSportsLive .rk-sports-refresh');
    if (refreshBtn) refreshBtn.classList.add('is-loading');

    return Promise.all(SPORTS.map(function (meta) { return fetchSport(meta[0]); }))
      .then(function (groups) {
        var merged = [];
        groups.forEach(function (group) { merged = merged.concat(group); });
        if (merged.length) {
          allEvents = dedupe(merged).sort(eventSort);
          writeCache(allEvents);
          render();
          setUpdated(false);
        } else if (cached) {
          allEvents = dedupe(cached.events.map(function (event) { return normalize(event, event.strSport); })).sort(eventSort);
          render();
          setUpdated(true);
        } else {
          render();
          var empty = document.querySelector('#rkSportsLive .rk-sports-empty');
          if (empty) empty.textContent = 'Live sports feed is temporarily unavailable.';
        }
      })
      .finally(function () { if (refreshBtn) refreshBtn.classList.remove('is-loading'); });
  }

  function injectStyle() {
    if (document.getElementById('rk-sports-live-style')) return;
    var style = document.createElement('style');
    style.id = 'rk-sports-live-style';
    style.textContent = `
#rkSportsLive{
  position:relative;z-index:3;width:min(94%,1280px);margin:0 auto clamp(3.2rem,7vw,6.2rem);padding:clamp(1.1rem,2.4vw,1.65rem);
  overflow:hidden;border:1px solid rgba(117,180,225,.16);border-radius:26px;
  background:radial-gradient(circle at 8% -30%,rgba(39,203,255,.16),transparent 32%),radial-gradient(circle at 90% 0,rgba(132,92,255,.15),transparent 33%),linear-gradient(145deg,rgba(10,18,31,.91),rgba(5,9,17,.86));
  box-shadow:0 28px 80px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.07);backdrop-filter:blur(22px);isolation:isolate;
}
#rkSportsLive::before{content:'';position:absolute;inset:-70% -15%;z-index:-1;background:conic-gradient(from 90deg,transparent,rgba(50,219,255,.11),transparent 28%,rgba(123,91,255,.13),transparent 57%,rgba(255,79,137,.08),transparent 82%);animation:rkSportsAura 14s linear infinite;filter:blur(40px)}
@keyframes rkSportsAura{to{transform:rotate(360deg)}}
.rk-sports-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1rem}
.rk-sports-kicker{display:flex;align-items:center;gap:.48rem;margin:0 0 .3rem;color:#70ddff;font:700 .64rem/1.1 'Space Grotesk',sans-serif;letter-spacing:.15em;text-transform:uppercase}
.rk-sports-kicker i{width:7px;height:7px;border-radius:50%;background:#ff4967;box-shadow:0 0 0 0 rgba(255,73,103,.6);animation:rkSportsPulse 1.7s infinite}
@keyframes rkSportsPulse{70%{box-shadow:0 0 0 9px rgba(255,73,103,0)}}
.rk-sports-title{margin:0;font:800 clamp(1.65rem,3.1vw,2.75rem)/.98 'Bricolage Grotesque',sans-serif;letter-spacing:-.045em;color:#f4f9ff}
.rk-sports-title span{background:linear-gradient(95deg,#69e8ff,#72a9ff 52%,#a88dff);-webkit-background-clip:text;background-clip:text;color:transparent}
.rk-sports-meta{display:flex;align-items:center;gap:.62rem;flex:0 0 auto;color:#879bad;font-size:.68rem}
.rk-sports-count{padding:.34rem .58rem;border:1px solid rgba(120,174,214,.15);border-radius:999px;background:rgba(255,255,255,.035)}
.rk-sports-refresh{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(120,174,214,.17);border-radius:50%;background:rgba(255,255,255,.045);color:#91dfff;cursor:pointer;transition:transform .3s,background .3s}
.rk-sports-refresh:hover{transform:rotate(22deg) scale(1.06);background:rgba(72,181,255,.12)}
.rk-sports-refresh.is-loading{animation:rkSportsSpin .8s linear infinite}
@keyframes rkSportsSpin{to{transform:rotate(360deg)}}
.rk-sports-filters{display:flex;gap:.5rem;overflow-x:auto;padding:.15rem 0 .72rem;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.rk-sports-filters::-webkit-scrollbar{display:none}
.rk-sports-filter{flex:0 0 auto;border:1px solid rgba(120,174,214,.15);border-radius:999px;background:rgba(255,255,255,.035);color:#8499ae;padding:.47rem .72rem;font:600 .69rem/1 'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .34s cubic-bezier(.16,1,.3,1)}
.rk-sports-filter:hover{color:#e8f6ff;border-color:rgba(91,205,255,.3);transform:translateY(-2px)}
.rk-sports-filter.is-active{color:#07121d;background:linear-gradient(110deg,#6ce4ff,#6e9fff);border-color:transparent;box-shadow:0 8px 22px rgba(58,166,235,.22)}
.rk-sports-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(235px,285px);gap:.72rem;overflow-x:auto;overscroll-behavior-inline:contain;scroll-snap-type:inline proximity;padding:.15rem .05rem .48rem;scrollbar-width:thin;scrollbar-color:rgba(91,197,255,.35) transparent}
.rk-sports-card{position:relative;scroll-snap-align:start;min-height:178px;padding:.88rem;border:1px solid rgba(132,176,213,.13);border-radius:18px;background:linear-gradient(150deg,rgba(255,255,255,.062),rgba(255,255,255,.018));box-shadow:0 12px 28px rgba(0,0,0,.18),inset 0 1px rgba(255,255,255,.055);overflow:hidden;transition:transform .48s cubic-bezier(.16,1,.3,1),border-color .35s,box-shadow .4s}
.rk-sports-card::after{content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(120deg,transparent 22%,rgba(84,217,255,.6),rgba(133,104,255,.48),transparent 76%);background-size:230% 100%;background-position:140% 0;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.14;pointer-events:none;transition:background-position .75s cubic-bezier(.16,1,.3,1),opacity .35s}
.rk-sports-card:hover{transform:translateY(-7px) scale(1.012);border-color:rgba(83,201,255,.27);box-shadow:0 22px 44px rgba(0,0,0,.28),0 0 25px rgba(51,157,235,.07)}
.rk-sports-card:hover::after{opacity:.7;background-position:-50% 0}
.rk-sports-live{border-color:rgba(255,75,103,.29);box-shadow:0 15px 38px rgba(255,49,84,.065),inset 0 1px rgba(255,255,255,.06)}
.rk-sports-card-top{display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin-bottom:.45rem}
.rk-sports-sport{color:#9eb0c3;font:600 .61rem/1 'Space Grotesk',sans-serif;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-sports-status{display:inline-flex;align-items:center;gap:.35rem;color:#b9c8d7;font:700 .57rem/1 'Space Grotesk',sans-serif;letter-spacing:.06em;white-space:nowrap}
.rk-sports-live .rk-sports-status{color:#ff7189}
.rk-sports-live-dot{width:6px;height:6px;border-radius:50%;background:#ff4967;box-shadow:0 0 12px rgba(255,73,103,.9);animation:rkSportsBlink 1.2s ease-in-out infinite alternate}
@keyframes rkSportsBlink{to{opacity:.28;transform:scale(.72)}}
.rk-sports-league{margin-bottom:.76rem;color:#647b92;font:500 .62rem/1.2 'Plus Jakarta Sans',sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-sports-match{display:grid;gap:.48rem}
.rk-sports-team{display:grid;grid-template-columns:31px minmax(0,1fr) auto;align-items:center;gap:.5rem;min-width:0}
.rk-sports-logo{display:grid;place-items:center;width:31px;height:31px;border-radius:10px;background:rgba(255,255,255,.055);border:1px solid rgba(135,179,214,.11);overflow:hidden;color:#86a1b9;font:700 .55rem/1 'Space Grotesk',sans-serif}
.rk-sports-logo img{width:78%;height:78%;object-fit:contain;filter:drop-shadow(0 3px 4px rgba(0,0,0,.2))}
.rk-sports-team b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8f2fb;font:650 .78rem/1.25 'Plus Jakarta Sans',sans-serif}
.rk-sports-team strong{color:#f8fbff;font:800 1rem/1 'Space Grotesk',sans-serif}
.rk-sports-event-name{display:flex;align-items:center;gap:.7rem;min-height:67px;color:#e8f3fb}.rk-sports-event-name>span{font-size:1.5rem}.rk-sports-event-name b{font:700 .84rem/1.3 'Plus Jakarta Sans',sans-serif}
.rk-sports-empty{margin:.7rem 0 .15rem;padding:1.05rem;border:1px dashed rgba(130,180,216,.16);border-radius:16px;color:#7890a6;text-align:center;font-size:.75rem}
.rk-sports-source{margin:.62rem .1rem 0;color:#5f7488;font-size:.58rem;text-align:right}.rk-sports-source a{color:#72bfe8}
html[data-theme="light"] #rkSportsLive{background:radial-gradient(circle at 8% -30%,rgba(65,194,235,.11),transparent 32%),radial-gradient(circle at 90% 0,rgba(126,97,240,.09),transparent 33%),linear-gradient(145deg,rgba(255,255,255,.96),rgba(244,249,254,.9));border-color:rgba(76,143,194,.16);box-shadow:0 24px 68px rgba(57,82,112,.11),inset 0 1px #fff}
html[data-theme="light"] .rk-sports-title{color:#102234}html[data-theme="light"] .rk-sports-card{background:linear-gradient(150deg,rgba(255,255,255,.98),rgba(239,247,253,.84));border-color:rgba(83,143,188,.14);box-shadow:0 10px 28px rgba(46,72,104,.08),inset 0 1px #fff}
html[data-theme="light"] .rk-sports-team b,html[data-theme="light"] .rk-sports-event-name{color:#162c40}html[data-theme="light"] .rk-sports-team strong{color:#102234}html[data-theme="light"] .rk-sports-logo{background:#f2f7fb}html[data-theme="light"] .rk-sports-filter{background:rgba(255,255,255,.8);color:#60758a}
@media(max-width:720px){#rkSportsLive{width:92%;padding:1rem;border-radius:21px}.rk-sports-head{align-items:flex-start}.rk-sports-meta{flex-wrap:wrap;justify-content:flex-end}.rk-sports-updated{display:none}.rk-sports-rail{grid-auto-columns:minmax(225px,82vw)}}
@media(prefers-reduced-motion:reduce){#rkSportsLive::before,.rk-sports-live-dot,.rk-sports-kicker i{animation:none!important}.rk-sports-card{transition:none!important}}
`;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    var hero = document.querySelector('.hero');
    if (!hero || document.getElementById('rkSportsLive')) return;

    var section = document.createElement('section');
    section.id = 'rkSportsLive';
    section.setAttribute('aria-label', 'Live and today sports');
    var filters = '<button class="rk-sports-filter is-active" type="button" data-sport="All">All</button>' + SPORTS.map(function (s) {
      return '<button class="rk-sports-filter" type="button" data-sport="' + esc(s[0]) + '">' + esc(s[2] + ' ' + s[1]) + '</button>';
    }).join('');

    section.innerHTML =
      '<div class="rk-sports-head"><div><p class="rk-sports-kicker"><i></i>Sports pulse</p><h2 class="rk-sports-title">Live &amp; <span>Today</span></h2></div>' +
      '<div class="rk-sports-meta"><span class="rk-sports-updated">Loading…</span><span class="rk-sports-count">—</span><button class="rk-sports-refresh" type="button" aria-label="Refresh sports">↻</button></div></div>' +
      '<div class="rk-sports-filters" aria-label="Filter sports">' + filters + '</div>' +
      '<div class="rk-sports-rail" aria-live="polite"></div>' +
      '<p class="rk-sports-empty" hidden>No matches found for this sport today.</p>' +
      '<p class="rk-sports-source">Schedule/results data: <a href="https://www.thesportsdb.com/" target="_blank" rel="noopener noreferrer">TheSportsDB</a></p>';

    hero.insertAdjacentElement('afterend', section);

    section.addEventListener('click', function (event) {
      var filter = event.target.closest('.rk-sports-filter');
      if (filter) {
        activeSport = filter.getAttribute('data-sport') || 'All';
        section.querySelectorAll('.rk-sports-filter').forEach(function (button) { button.classList.toggle('is-active', button === filter); });
        render();
        return;
      }
      if (event.target.closest('.rk-sports-refresh')) refresh(true);
    });
  }

  injectStyle();
  injectMarkup();

  var cached = readCache();
  if (cached) {
    allEvents = dedupe(cached.events.map(function (event) { return normalize(event, event.strSport); })).sort(eventSort);
    render();
    setUpdated(true);
  }
  refresh(false);
  window.setInterval(function () { refresh(true); }, REFRESH_MS);
})();
