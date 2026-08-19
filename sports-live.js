/* ============================================================
   SPORTS LIVE V2 — dedicated sports.html dashboard
   - no homepage injection
   - one in-place data refresh (no page reload)
   - 3s live polling while visible, automatic backoff on API errors
   - per-second football live clock between provider refreshes
   - goal detection + lightweight full-page celebration
   - sport filters are generated from the day's actual global feed
   ============================================================ */
(function () {
  'use strict';

  var root = document.getElementById('rkSportsPage');
  if (!root) return;

  var API = 'https://www.thesportsdb.com/api/v1/json/123/eventsday.php';
  var POLL_LIVE = 3000;
  var POLL_IDLE = 30000;
  var pollTimer = null;
  var tickTimer = null;
  var inFlight = false;
  var failures = 0;
  var activeSport = 'All';
  var events = [];
  var lastScores = Object.create(null);
  var lastUpdated = 0;

  var ICONS = {
    Soccer:'⚽',Football:'⚽',Basketball:'🏀',Cricket:'🏏',Tennis:'🎾',Motorsport:'🏎️',Baseball:'⚾',
    'Ice Hockey':'🏒','American Football':'🏈',Rugby:'🏉',Golf:'⛳',Cycling:'🚴',Volleyball:'🏐',
    Handball:'🤾',Boxing:'🥊','Mixed Martial Arts':'🥋',Snooker:'🎱',Darts:'🎯','Field Hockey':'🏑',
    Athletics:'🏃',Swimming:'🏊',Badminton:'🏸','Table Tennis':'🏓',Esports:'🎮'
  };

  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function dateLocal() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function sportIcon(s) { return ICONS[s] || '🏆'; }
  function sportLabel(s) { return s === 'Soccer' ? 'Football' : (s || 'Sport'); }
  function idOf(e) { return e.idEvent || [e.strSport,e.strEvent,e.strHomeTeam,e.strAwayTeam,e.strTime].join('|'); }
  function scoreValue(v) { var n = parseInt(v,10); return isFinite(n) ? n : null; }
  function scoreText(v) { var n = scoreValue(v); return n == null ? '—' : String(n); }

  function parseStart(e) {
    if (e.strTimestamp) {
      var t = Date.parse(e.strTimestamp);
      if (!isNaN(t)) return t;
    }
    var date = e.dateEvent || dateLocal();
    var time = String(e.strTime || '00:00:00').slice(0,8);
    var t2 = Date.parse(date + 'T' + time + 'Z');
    return isNaN(t2) ? 0 : t2;
  }

  function stateOf(e) {
    var s = String(e.strStatus || '').toLowerCase();
    if (/live|in progress|1h|2h|half|quarter|inning|period|set|playing|underway|ht/.test(s)) return 'live';
    if (/finished|final|ft|aet|ended|complete|completed|result/.test(s)) return 'done';
    var hs = scoreValue(e.intHomeScore), as = scoreValue(e.intAwayScore);
    if (hs != null && as != null && parseStart(e) && Date.now() > parseStart(e) + 3*60*60*1000) return 'done';
    return 'upcoming';
  }

  function parseProgressSeconds(e) {
    var candidates = [e.strProgress,e.strStatus,e.strTimeLocal];
    for (var i=0;i<candidates.length;i++) {
      var value = String(candidates[i] || '');
      var mmss = value.match(/\b(\d{1,3})[:'](\d{1,2})\b/);
      if (mmss) return (+mmss[1] * 60) + (+mmss[2]);
      var min = value.match(/\b(\d{1,3})\s*['′m]\b/i);
      if (min) return +min[1] * 60;
    }
    if ((e.strSport === 'Soccer' || e.strSport === 'Football') && stateOf(e) === 'live') {
      var start = parseStart(e);
      if (start) return Math.max(0, Math.min(130*60, Math.floor((Date.now()-start)/1000)));
    }
    return 0;
  }

  function normalize(e) {
    e = e || {};
    e.__id = idOf(e);
    e.__state = stateOf(e);
    e.__start = parseStart(e);
    e.__baseSeconds = parseProgressSeconds(e);
    e.__syncAt = Date.now();
    return e;
  }

  function teamLogo(url, name) {
    if (url) return '<img src="' + esc(url) + '" alt="" loading="lazy" decoding="async">';
    var p = String(name || '?').trim().split(/\s+/);
    var initials = (p[0] ? p[0][0] : '?') + (p.length > 1 ? p[p.length-1][0] : '');
    return '<span>' + esc(initials.toUpperCase()) + '</span>';
  }

  function localKickoff(e) {
    if (!e.__start) return 'Today';
    try { return new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(new Date(e.__start)); }
    catch (err) { return String(e.strTime || '').slice(0,5) || 'Today'; }
  }

  function liveClockMarkup(e) {
    if (e.__state !== 'live') return e.__state === 'done' ? 'FINAL' : localKickoff(e);
    if (e.strSport === 'Soccer' || e.strSport === 'Football') {
      return '<span class="rk-live-pip"></span><span class="rk-live-clock" data-event="' + esc(e.__id) + '">LIVE</span>';
    }
    return '<span class="rk-live-pip"></span>LIVE';
  }

  function card(e) {
    var home = e.strHomeTeam || '';
    var away = e.strAwayTeam || '';
    var teamMode = !!(home || away);
    var body = '';
    if (teamMode) {
      body = '<div class="sp-team"><span class="sp-logo">' + teamLogo(e.strHomeTeamBadge,home) + '</span><b>' + esc(home || 'Home') + '</b><strong>' + scoreText(e.intHomeScore) + '</strong></div>' +
             '<div class="sp-team"><span class="sp-logo">' + teamLogo(e.strAwayTeamBadge,away) + '</span><b>' + esc(away || 'Away') + '</b><strong>' + scoreText(e.intAwayScore) + '</strong></div>';
    } else {
      body = '<div class="sp-event"><span>' + sportIcon(e.strSport) + '</span><b>' + esc(e.strEvent || e.strFilename || sportLabel(e.strSport)) + '</b></div>';
    }
    return '<article class="sp-card sp-' + e.__state + '" data-event="' + esc(e.__id) + '">' +
      '<div class="sp-card-top"><span class="sp-sport">' + sportIcon(e.strSport) + ' ' + esc(sportLabel(e.strSport)) + '</span><span class="sp-status">' + liveClockMarkup(e) + '</span></div>' +
      '<div class="sp-league">' + esc(e.strLeague || e.strLeagueAlternate || e.strSeason || 'Today') + '</div>' +
      '<div class="sp-match">' + body + '</div>' +
    '</article>';
  }

  function filtered() {
    var out = activeSport === 'All' ? events : events.filter(function (e) { return e.strSport === activeSport; });
    return out.slice(0,120);
  }

  function renderFilters() {
    var wrap = root.querySelector('.sp-filters');
    if (!wrap) return;
    var names = [];
    events.forEach(function (e) { if (e.strSport && names.indexOf(e.strSport) < 0) names.push(e.strSport); });
    names.sort();
    var all = ['All'].concat(names);
    wrap.innerHTML = all.map(function (s) {
      var label = s === 'All' ? 'All Sports' : sportIcon(s) + ' ' + sportLabel(s);
      return '<button type="button" class="sp-filter' + (activeSport===s?' is-active':'') + '" data-sport="' + esc(s) + '">' + esc(label) + '</button>';
    }).join('');
    wrap.querySelectorAll('.sp-filter').forEach(function (b) {
      b.addEventListener('click',function () { activeSport = b.getAttribute('data-sport') || 'All'; renderFilters(); renderCards(); });
    });
  }

  function renderCards() {
    var list = root.querySelector('.sp-grid');
    var empty = root.querySelector('.sp-empty');
    var count = root.querySelector('.sp-count');
    var items = filtered();
    if (count) count.textContent = items.length + (items.length === 1 ? ' event' : ' events');
    if (!items.length) {
      list.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    list.innerHTML = items.map(card).join('');
    tickLiveClocks();
  }

  function renderAll() { renderFilters(); renderCards(); }

  function eventSort(a,b) {
    var rank = {live:0,upcoming:1,done:2};
    var r = rank[a.__state]-rank[b.__state];
    if (r) return r;
    return (a.__start||0)-(b.__start||0);
  }

  function detectGoals(next) {
    next.forEach(function (e) {
      var id = e.__id;
      var h = scoreValue(e.intHomeScore), a = scoreValue(e.intAwayScore);
      var prev = lastScores[id];
      if (prev && e.__state === 'live' && (e.strSport === 'Soccer' || e.strSport === 'Football')) {
        if (h != null && prev.h != null && h > prev.h) goalBurst(e.strHomeTeam || 'Home', h, a);
        else if (a != null && prev.a != null && a > prev.a) goalBurst(e.strAwayTeam || 'Away', h, a);
      }
      lastScores[id] = {h:h,a:a};
    });
  }

  function goalBurst(team, home, away) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var old = document.querySelector('.goal-burst');
    if (old) old.remove();
    var layer = document.createElement('div');
    layer.className = 'goal-burst';
    var sparks = '';
    for (var i=0;i<16;i++) sparks += '<i style="--i:' + i + '"></i>';
    layer.innerHTML = '<div class="goal-rings"></div><div class="goal-copy"><small>⚽ LIVE UPDATE</small><strong>GOAL!</strong><b>' + esc(team) + '</b>' + (home!=null&&away!=null?'<span>' + home + ' — ' + away + '</span>':'') + '</div><div class="goal-sparks">' + sparks + '</div>';
    document.body.appendChild(layer);
    requestAnimationFrame(function () { layer.classList.add('on'); });
    setTimeout(function () { layer.classList.remove('on'); setTimeout(function(){ layer.remove(); },500); },2600);
  }

  function setUpdated() {
    var el = root.querySelector('.sp-updated');
    if (!el) return;
    var t;
    try { t = new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date()); }
    catch (e) { t = new Date().toLocaleTimeString(); }
    el.textContent = 'Updated ' + t;
  }

  function fetchDay() {
    var url = API + '?d=' + encodeURIComponent(dateLocal());
    return fetch(url,{cache:'no-store',mode:'cors'}).then(function (r) {
      if (!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    }).then(function (j) { return (j && j.events) || []; });
  }

  function refresh(force) {
    if (inFlight || document.hidden) return Promise.resolve();
    inFlight = true;
    root.classList.add('is-refreshing');
    return fetchDay().then(function (raw) {
      failures = 0;
      var next = raw.map(normalize).sort(eventSort);
      detectGoals(next);
      events = next;
      lastUpdated = Date.now();
      renderAll();
      setUpdated();
      root.classList.remove('feed-error');
    }).catch(function () {
      failures++;
      root.classList.add('feed-error');
      var msg = root.querySelector('.sp-empty');
      if (!events.length && msg) { msg.hidden = false; msg.textContent = 'Live feed is temporarily unavailable. Retrying automatically…'; }
    }).finally(function () {
      inFlight = false;
      root.classList.remove('is-refreshing');
      schedulePoll();
    });
  }

  function schedulePoll() {
    clearTimeout(pollTimer);
    var hasLive = events.some(function (e) { return e.__state === 'live'; });
    var wait = hasLive ? POLL_LIVE : POLL_IDLE;
    if (failures) wait = Math.min(60000, Math.max(10000, wait * Math.pow(2,Math.min(failures,3))));
    pollTimer = setTimeout(function () { refresh(false); }, wait);
  }

  function formatClock(total) {
    total = Math.max(0,Math.floor(total));
    var m = Math.floor(total/60), s = total%60;
    return m + ':' + String(s).padStart(2,'0');
  }

  function tickLiveClocks() {
    root.querySelectorAll('.rk-live-clock').forEach(function (node) {
      var id = node.getAttribute('data-event');
      var e = events.find(function (x) { return x.__id === id; });
      if (!e) return;
      var elapsed = e.__baseSeconds + Math.max(0,Math.floor((Date.now()-e.__syncAt)/1000));
      node.textContent = formatClock(elapsed);
    });
  }

  function init() {
    var refreshBtn = root.querySelector('.sp-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click',function(){ refresh(true); });
    tickTimer = setInterval(tickLiveClocks,1000);
    document.addEventListener('visibilitychange',function(){
      if (document.hidden) { clearTimeout(pollTimer); return; }
      tickLiveClocks();
      refresh(true);
    });
    refresh(true);
  }

  init();
})();
