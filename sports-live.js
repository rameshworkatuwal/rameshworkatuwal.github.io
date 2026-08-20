/* ============================================================
   PREMIUM HOME CARDS + LIVE SPORTS ENGINE
   Home: GPU-friendly card motion, animated edges, icon/chip choreography.
   Sports: dedicated sports.html live dashboard, in-place score refresh.
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     HOME — WHAT I DO / SERVICE CARDS
     ========================================================== */
  function initHomeCards() {
    var home = document.querySelector('.hero');
    var cardsWrap = document.querySelector('.section .cards');
    if (!home || !cardsWrap || cardsWrap.dataset.rkPremium === '1') return;
    cardsWrap.dataset.rkPremium = '1';

    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    if (!document.getElementById('rk-home-card-premium-style')) {
      var style = document.createElement('style');
      style.id = 'rk-home-card-premium-style';
      style.textContent = `
/* HOME PREMIUM SERVICE CARDS */
.section .cards{
  position:relative;
  isolation:isolate;
  perspective:1300px;
}
.section .cards::before{
  content:'';
  position:absolute;
  z-index:-2;
  inset:-9% -7%;
  pointer-events:none;
  background:
    radial-gradient(circle at 14% 12%,rgba(55,219,255,.12),transparent 27%),
    radial-gradient(circle at 88% 30%,rgba(139,108,255,.11),transparent 28%),
    radial-gradient(circle at 48% 92%,rgba(0,189,255,.075),transparent 32%);
  opacity:.85;
  transform:translate3d(0,0,0);
  animation:rkCardsAtmosphere 12s ease-in-out infinite alternate;
}
@keyframes rkCardsAtmosphere{
  0%{transform:translate3d(-1.2%,1%,0) scale(.985)}
  100%{transform:translate3d(1.4%,-1.2%,0) scale(1.02)}
}
.section .cards .card{
  --rk-a:#38e1ff;
  --rk-b:#7b78ff;
  --rk-c:rgba(56,225,255,.14);
  isolation:isolate;
  min-height:248px;
  transform-origin:50% 70%;
  backface-visibility:hidden;
  -webkit-font-smoothing:antialiased;
  box-shadow:0 18px 46px rgba(9,24,42,.075),inset 0 1px 0 rgba(255,255,255,.08);
  transition:
    transform .48s cubic-bezier(.16,1,.3,1),
    box-shadow .48s cubic-bezier(.16,1,.3,1),
    border-color .35s ease,
    background .35s ease;
}
.section .cards .card:nth-child(2){--rk-a:#7b78ff;--rk-b:#43d9ff;--rk-c:rgba(123,120,255,.14)}
.section .cards .card:nth-child(3){--rk-a:#25d9b8;--rk-b:#37b8ff;--rk-c:rgba(37,217,184,.13)}
.section .cards .card:nth-child(4){--rk-a:#9d74ff;--rk-b:#ff69b4;--rk-c:rgba(157,116,255,.13)}
.section .cards .card:hover{
  border-color:rgba(76,205,255,.22);
  box-shadow:
    0 26px 65px rgba(8,30,54,.15),
    0 0 0 1px rgba(255,255,255,.04) inset,
    0 0 46px var(--rk-c);
}
.section .cards .card::after{
  width:420px;
  height:420px;
  background:radial-gradient(circle,var(--rk-c) 0%,rgba(56,225,255,.055) 28%,transparent 67%);
  mix-blend-mode:normal;
}
.rk-card-edge,
.rk-card-sheen,
.rk-card-noise{
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
}
.rk-card-edge{
  z-index:0;
  padding:1px;
  opacity:.35;
  background:linear-gradient(115deg,transparent 3%,var(--rk-a) 23%,transparent 41%,var(--rk-b) 67%,transparent 86%);
  background-size:230% 230%;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  animation:rkEdgeTravel 7.5s linear infinite;
  transition:opacity .35s ease;
}
@keyframes rkEdgeTravel{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
.section .cards .card:hover .rk-card-edge{opacity:.95}
.rk-card-sheen{
  z-index:1;
  inset:-1px;
  opacity:0;
  background:linear-gradient(105deg,transparent 31%,rgba(255,255,255,.32) 46%,rgba(255,255,255,.08) 51%,transparent 66%);
  transform:translate3d(-72%,0,0) skewX(-12deg);
  transition:opacity .2s ease,transform .85s cubic-bezier(.16,1,.3,1);
}
.section .cards .card:hover .rk-card-sheen{
  opacity:.55;
  transform:translate3d(72%,0,0) skewX(-12deg);
}
.rk-card-noise{
  z-index:0;
  opacity:.28;
  background:
    linear-gradient(rgba(100,185,230,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(100,185,230,.035) 1px,transparent 1px);
  background-size:28px 28px;
  -webkit-mask-image:radial-gradient(circle at var(--mx,50%) var(--my,50%),#000 0%,transparent 72%);
  mask-image:radial-gradient(circle at var(--mx,50%) var(--my,50%),#000 0%,transparent 72%);
  transform:translateZ(0);
}
.section .cards .card > :not(.rk-card-edge):not(.rk-card-sheen):not(.rk-card-noise){
  position:relative;
  z-index:3;
}
.section .cards .card-ico{
  position:relative;
  overflow:visible;
  transform:translate3d(0,0,28px);
  box-shadow:0 12px 28px rgba(44,170,230,.08),inset 0 1px 0 rgba(255,255,255,.3);
  transition:
    transform .55s cubic-bezier(.16,1,.3,1),
    box-shadow .45s ease,
    border-color .35s ease,
    background .35s ease;
}
.section .cards .card-ico::before{
  content:'';
  position:absolute;
  inset:-11px;
  border-radius:20px;
  border:1px solid color-mix(in srgb,var(--rk-a) 32%,transparent);
  opacity:0;
  transform:scale(.72) rotate(-8deg);
  transition:opacity .38s ease,transform .58s cubic-bezier(.16,1,.3,1);
}
.section .cards .card-ico::after{
  content:'';
  position:absolute;
  width:6px;height:6px;
  top:-6px;right:-6px;
  border-radius:50%;
  background:var(--rk-a);
  box-shadow:0 0 16px var(--rk-a);
  opacity:0;
  transform:scale(.3);
  transition:opacity .3s ease,transform .45s cubic-bezier(.16,1,.3,1);
}
.section .cards .card:hover .card-ico{
  transform:translate3d(0,-5px,34px) rotate(-2deg) scale(1.055);
  border-color:color-mix(in srgb,var(--rk-a) 48%,transparent);
  background:color-mix(in srgb,var(--rk-a) 11%,transparent);
  box-shadow:0 18px 35px var(--rk-c),inset 0 1px 0 rgba(255,255,255,.42);
}
.section .cards .card:hover .card-ico::before{opacity:.72;transform:scale(1) rotate(7deg)}
.section .cards .card:hover .card-ico::after{opacity:1;transform:scale(1)}
.section .cards .card-ico svg{
  position:relative;
  z-index:2;
  stroke:var(--rk-a);
  filter:drop-shadow(0 0 0 transparent);
  transition:transform .55s cubic-bezier(.16,1,.3,1),filter .35s ease,stroke .35s ease;
}
.section .cards .card:hover .card-ico svg{
  transform:scale(1.08) rotate(2deg);
  filter:drop-shadow(0 4px 8px var(--rk-c));
}
.section .cards .card h3{
  transform:translate3d(0,0,20px);
  transition:transform .5s cubic-bezier(.16,1,.3,1),color .3s ease;
}
.section .cards .card:hover h3{
  transform:translate3d(4px,-2px,26px);
  background:linear-gradient(95deg,var(--text) 12%,var(--rk-a) 68%,var(--rk-b));
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}
.section .cards .chips{transform:translate3d(0,0,16px)}
.section .cards .chip{
  position:relative;
  overflow:hidden;
  transition:
    transform .42s cubic-bezier(.16,1,.3,1),
    border-color .3s ease,
    background .3s ease,
    box-shadow .35s ease,
    color .3s ease;
}
.section .cards .chip::after{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.44) 48%,transparent 72%);
  transform:translateX(-150%);
  transition:transform .68s cubic-bezier(.16,1,.3,1);
}
.section .cards .card:hover .chip{
  transform:translateY(-2px);
  border-color:color-mix(in srgb,var(--rk-a) 23%,transparent);
  background:color-mix(in srgb,var(--rk-a) 7%,rgba(255,255,255,.035));
  box-shadow:0 7px 18px rgba(19,87,125,.055);
}
.section .cards .card:hover .chip:nth-child(2){transition-delay:.045s}
.section .cards .card:hover .chip:nth-child(3){transition-delay:.09s}
.section .cards .card:hover .chip:nth-child(4){transition-delay:.135s}
.section .cards .card:hover .chip::after{transform:translateX(150%)}
.section .cards .card.is-rk-enter .card-ico{animation:rkIconSettle .75s cubic-bezier(.16,1,.3,1) both}
.section .cards .card.is-rk-enter h3{animation:rkTextSettle .7s cubic-bezier(.16,1,.3,1) .05s both}
.section .cards .card.is-rk-enter .chip{animation:rkChipSettle .58s cubic-bezier(.16,1,.3,1) both}
.section .cards .card.is-rk-enter .chip:nth-child(2){animation-delay:.08s}
.section .cards .card.is-rk-enter .chip:nth-child(3){animation-delay:.14s}
.section .cards .card.is-rk-enter .chip:nth-child(4){animation-delay:.2s}
@keyframes rkIconSettle{0%{opacity:.2;transform:translate3d(-10px,15px,28px) scale(.86) rotate(-8deg)}100%{opacity:1;transform:translate3d(0,0,28px) scale(1) rotate(0)}}
@keyframes rkTextSettle{0%{opacity:0;transform:translate3d(0,13px,20px)}100%{opacity:1;transform:translate3d(0,0,20px)}}
@keyframes rkChipSettle{0%{opacity:0;transform:translateY(9px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
html[data-theme="light"] .section .cards .card{
  box-shadow:0 18px 45px rgba(69,100,137,.09),inset 0 1px 0 rgba(255,255,255,.9);
}
html[data-theme="light"] .section .cards .card:hover{
  box-shadow:0 30px 70px rgba(64,99,140,.14),0 0 38px var(--rk-c);
}
html[data-theme="light"] .section .cards .rk-card-noise{opacity:.2}
html[data-theme="light"] .section .cards .rk-card-sheen{mix-blend-mode:soft-light}
@media(max-width:920px){
  .section .cards .card{min-height:220px}
  .section .cards::before{inset:-4% -3%}
}
@media(hover:none){
  .section .cards .rk-card-edge{opacity:.58}
  .section .cards .card-ico::before{opacity:.22;transform:scale(.92) rotate(5deg)}
}
@media(prefers-reduced-motion:reduce){
  .section .cards::before,.rk-card-edge{animation:none!important}
  .section .cards .card,.section .cards .card-ico,.section .cards .chip,.section .cards .card h3{transition-duration:.01ms!important}
  .section .cards .card.is-rk-enter .card-ico,.section .cards .card.is-rk-enter h3,.section .cards .card.is-rk-enter .chip{animation:none!important}
  .rk-card-sheen{display:none}
}
`;
      document.head.appendChild(style);
    }

    var cards = cardsWrap.querySelectorAll('.card');
    cards.forEach(function (card, index) {
      if (!card.querySelector('.rk-card-edge')) {
        var edge = document.createElement('span');
        edge.className = 'rk-card-edge';
        edge.setAttribute('aria-hidden', 'true');
        var sheen = document.createElement('span');
        sheen.className = 'rk-card-sheen';
        sheen.setAttribute('aria-hidden', 'true');
        var noise = document.createElement('span');
        noise.className = 'rk-card-noise';
        noise.setAttribute('aria-hidden', 'true');
        card.insertBefore(noise, card.firstChild);
        card.insertBefore(sheen, card.firstChild);
        card.insertBefore(edge, card.firstChild);
      }
      card.style.setProperty('--rk-delay', (index * 75) + 'ms');
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          setTimeout(function () { card.classList.add('is-rk-enter'); }, Number(card.style.getPropertyValue('--rk-delay').replace('ms','')) || 0);
          io.unobserve(card);
        });
      }, { threshold:0.18 });
      cards.forEach(function (card) { io.observe(card); });
    } else {
      cards.forEach(function (card) { card.classList.add('is-rk-enter'); });
    }

    // Existing home script already owns the 3D transform. We only update the
    // light position, throttled to one DOM write per animation frame.
    if (!reduce && window.matchMedia && window.matchMedia('(hover:hover)').matches) {
      cards.forEach(function (card) {
        var frame = 0;
        var nextX = '50%', nextY = '50%';
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          nextX = (e.clientX - r.left) + 'px';
          nextY = (e.clientY - r.top) + 'px';
          if (frame) return;
          frame = requestAnimationFrame(function () {
            card.style.setProperty('--mx', nextX);
            card.style.setProperty('--my', nextY);
            frame = 0;
          });
        }, { passive:true });
      });
    }
  }

  initHomeCards();

  /* ==========================================================
     SPORTS — dedicated sports.html dashboard
     ========================================================== */
  var root = document.getElementById('rkSportsPage');
  if (!root) return;

  var API = 'https://www.thesportsdb.com/api/v1/json/123/eventsday.php';
  var POLL_LIVE = 3000;
  var POLL_IDLE = 30000;
  var MAX_BACKOFF = 120000;
  var pollTimer = null;
  var tickTimer = null;
  var inFlight = false;
  var failures = 0;
  var activeSport = 'All';
  var events = [];
  var lastScores = Object.create(null);
  var lastFilteredIds = '';
  var initializedScores = false;

  var ICONS = {
    Soccer:'⚽',Football:'⚽',Basketball:'🏀',Cricket:'🏏',Tennis:'🎾',Motorsport:'🏎️',Baseball:'⚾',
    'Ice Hockey':'🏒','American Football':'🏈',Rugby:'🏉',Golf:'⛳',Cycling:'🚴',Volleyball:'🏐',
    Handball:'🤾',Boxing:'🥊','Mixed Martial Arts':'🥋',Snooker:'🎱',Darts:'🎯','Field Hockey':'🏑',
    Athletics:'🏃',Swimming:'🏊',Badminton:'🏸','Table Tennis':'🏓',Esports:'🎮'
  };

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function eventId(e) {
    return String(e.idEvent || [e.strSport,e.strEvent,e.strHomeTeam,e.strAwayTeam,e.strTimestamp,e.strTime].join('|'));
  }
  function sportIcon(s) { return ICONS[s] || '🏆'; }
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }
  function parseStart(e) {
    if (e.strTimestamp) {
      var t = Date.parse(e.strTimestamp);
      if (!isNaN(t)) return t;
    }
    var date = e.dateEvent || today();
    var time = String(e.strTime || '00:00:00').slice(0,8);
    var parsed = Date.parse(date + 'T' + time + 'Z');
    return isNaN(parsed) ? 0 : parsed;
  }
  function stateOf(e) {
    var s = String(e.strStatus || '').trim().toLowerCase();
    if (/finished|final|^ft$|ended|complete|completed|after extra|aet|penalties/.test(s)) return 'done';
    if (/live|in progress|playing|underway|half|quarter|period|inning|set|^1h$|^2h$|^ht$/.test(s)) return 'live';
    var hs = num(e.intHomeScore), as = num(e.intAwayScore);
    var start = parseStart(e);
    var now = Date.now();
    // When provider status is sparse, a scored event that recently started is
    // more likely live than upcoming. Do not guess beyond a normal match window.
    if ((hs !== null || as !== null) && start && now >= start && now - start < 4 * 60 * 60 * 1000) return 'live';
    if (start && now > start + 6 * 60 * 60 * 1000) return 'done';
    return 'upcoming';
  }
  function normalize(e) {
    e = e || {};
    e.__id = eventId(e);
    e.__start = parseStart(e);
    e.__state = stateOf(e);
    return e;
  }
  function dedupe(list) {
    var seen = Object.create(null);
    return list.filter(function (e) {
      var id = eventId(e);
      if (seen[id]) return false;
      seen[id] = 1;
      return true;
    });
  }
  function sortEvents(a,b) {
    var rank = {live:0,upcoming:1,done:2};
    var d = rank[a.__state] - rank[b.__state];
    if (d) return d;
    return a.__state === 'done' ? (b.__start||0)-(a.__start||0) : (a.__start||0)-(b.__start||0);
  }
  function niceTime(e) {
    if (!e.__start) return String(e.strTime || 'Today').slice(0,5);
    try { return new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(new Date(e.__start)); }
    catch (err) { return String(e.strTime || 'Today').slice(0,5); }
  }
  function initials(name) {
    var p = String(name || '?').trim().split(/\s+/).filter(Boolean);
    return ((p[0]&&p[0][0]) || '?') + ((p.length>1&&p[p.length-1][0]) || '');
  }
  function logo(url,name) {
    return url ? '<img src="'+esc(url)+'" alt="" loading="lazy" decoding="async">' : '<span>'+esc(initials(name).toUpperCase())+'</span>';
  }
  function scoreText(v) { return v === null || v === undefined || v === '' ? '—' : String(v); }
  function league(e) { return e.strLeague || e.strLeagueAlternate || e.strSeason || 'Today'; }

  function statusMarkup(e) {
    if (e.__state === 'live') return '<span class="rk-live-pip"></span><span class="sp-live-clock" data-id="'+esc(e.__id)+'">'+esc(liveLabel(e))+'</span>';
    if (e.__state === 'done') return 'FINAL';
    return esc(niceTime(e));
  }

  function liveLabel(e) {
    var raw = String(e.strStatus || '').trim();
    if (raw && raw.toLowerCase() !== 'live' && raw.toLowerCase() !== 'in progress') return raw;
    if ((e.strSport === 'Soccer' || e.strSport === 'Football') && e.__start) {
      var elapsed = Math.max(0, Math.floor((Date.now() - e.__start) / 1000));
      var mins = Math.min(120, Math.floor(elapsed / 60));
      var secs = elapsed % 60;
      return mins + ':' + String(secs).padStart(2,'0');
    }
    return 'LIVE';
  }

  function card(e) {
    var sport = e.strSport || 'Sport';
    var home = e.strHomeTeam || '';
    var away = e.strAwayTeam || '';
    var hasTeams = !!(home || away);
    var body;
    if (hasTeams) {
      body = '<div class="sp-team"><span class="sp-logo">'+logo(e.strHomeTeamBadge,home)+'</span><b title="'+esc(home)+'">'+esc(home||'Home')+'</b><strong data-score="home">'+esc(scoreText(e.intHomeScore))+'</strong></div>' +
             '<div class="sp-team"><span class="sp-logo">'+logo(e.strAwayTeamBadge,away)+'</span><b title="'+esc(away)+'">'+esc(away||'Away')+'</b><strong data-score="away">'+esc(scoreText(e.intAwayScore))+'</strong></div>';
    } else {
      body = '<div class="sp-event"><span>'+esc(sportIcon(sport))+'</span><b>'+esc(e.strEvent || e.strFilename || sport)+'</b></div>';
    }
    return '<article class="sp-card sp-'+e.__state+'" data-event-id="'+esc(e.__id)+'">' +
      '<div class="sp-card-top"><span>'+esc(sportIcon(sport)+' '+sport)+'</span><span class="sp-status">'+statusMarkup(e)+'</span></div>' +
      '<div class="sp-league" title="'+esc(league(e))+'">'+esc(league(e))+'</div>' +
      '<div class="sp-match">'+body+'</div>' +
    '</article>';
  }

  function filteredEvents() {
    return activeSport === 'All' ? events : events.filter(function (e) { return e.strSport === activeSport; });
  }

  function renderFilters() {
    var host = root.querySelector('.sp-filters');
    if (!host) return;
    var sports = [];
    var seen = Object.create(null);
    events.forEach(function (e) {
      var s = e.strSport || 'Sport';
      if (!seen[s]) { seen[s] = 1; sports.push(s); }
    });
    sports.sort();
    var names = ['All'].concat(sports);
    host.innerHTML = names.map(function (s) {
      var label = s === 'All' ? 'All Sports' : sportIcon(s) + ' ' + s;
      return '<button class="sp-filter'+(activeSport===s?' is-active':'')+'" type="button" data-sport="'+esc(s)+'">'+esc(label)+'</button>';
    }).join('');
  }

  function patchOrRender() {
    var grid = root.querySelector('.sp-grid');
    var empty = root.querySelector('.sp-empty');
    var count = root.querySelector('.sp-count');
    if (!grid) return;
    var list = filteredEvents();
    if (count) count.textContent = list.length + (list.length === 1 ? ' event' : ' events');
    if (!list.length) {
      grid.innerHTML = '';
      lastFilteredIds = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    var ids = list.map(function (e) { return e.__id; }).join('~');

    if (ids !== lastFilteredIds) {
      grid.innerHTML = list.map(card).join('');
      lastFilteredIds = ids;
      return;
    }

    // Same event set: patch only changing scores/status instead of rebuilding
    // the page. This is the fast path used by 3-second live polling.
    list.forEach(function (e) {
      var node = grid.querySelector('[data-event-id="'+cssEscape(e.__id)+'"]');
      if (!node) return;
      node.classList.remove('sp-live','sp-upcoming','sp-done');
      node.classList.add('sp-'+e.__state);
      var status = node.querySelector('.sp-status');
      if (status) status.innerHTML = statusMarkup(e);
      var hs = node.querySelector('[data-score="home"]');
      var as = node.querySelector('[data-score="away"]');
      if (hs) updateScoreNode(hs, scoreText(e.intHomeScore));
      if (as) updateScoreNode(as, scoreText(e.intAwayScore));
    });
  }

  function cssEscape(v) {
    if (window.CSS && CSS.escape) return CSS.escape(String(v));
    return String(v).replace(/(["\\])/g,'\\$1');
  }
  function updateScoreNode(node, value) {
    if (node.textContent === value) return;
    node.textContent = value;
    node.animate([
      {transform:'scale(1)',filter:'brightness(1)'},
      {transform:'scale(1.34)',filter:'brightness(1.8)'},
      {transform:'scale(1)',filter:'brightness(1)'}
    ],{duration:540,easing:'cubic-bezier(.16,1,.3,1)'});
  }

  function rememberAndDetectGoals(list) {
    var goal = null;
    list.forEach(function (e) {
      var key = e.__id;
      var hs = num(e.intHomeScore), as = num(e.intAwayScore);
      var previous = lastScores[key];
      if (initializedScores && e.__state === 'live' && previous) {
        if (hs !== null && previous.h !== null && hs > previous.h) goal = { team:e.strHomeTeam || 'Home',score:scoreText(hs)+' – '+scoreText(as),event:e };
        else if (as !== null && previous.a !== null && as > previous.a) goal = { team:e.strAwayTeam || 'Away',score:scoreText(hs)+' – '+scoreText(as),event:e };
      }
      lastScores[key] = {h:hs,a:as};
    });
    initializedScores = true;
    if (goal && !document.hidden) showGoal(goal);
  }

  function ensureGoalOverlay() {
    var el = document.querySelector('.goal-burst');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'goal-burst';
    var sparks = '';
    for (var i=0;i<16;i++) sparks += '<i style="--i:'+i+'"></i>';
    el.innerHTML = '<div class="goal-rings"></div><div class="goal-sparks">'+sparks+'</div><div class="goal-copy"><small>LIVE UPDATE</small><strong>GOAL!</strong><b class="goal-team"></b><span class="goal-score"></span></div>';
    document.body.appendChild(el);
    return el;
  }

  var goalHideTimer = null;
  function showGoal(info) {
    if (info.event.strSport !== 'Soccer' && info.event.strSport !== 'Football') return;
    var overlay = ensureGoalOverlay();
    overlay.querySelector('.goal-team').textContent = info.team;
    overlay.querySelector('.goal-score').textContent = info.score;
    overlay.classList.remove('on');
    void overlay.offsetWidth;
    overlay.classList.add('on');
    clearTimeout(goalHideTimer);
    goalHideTimer = setTimeout(function () { overlay.classList.remove('on'); }, 1900);
  }

  function setUpdated(ok) {
    var el = root.querySelector('.sp-updated');
    if (!el) return;
    var t = new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());
    el.textContent = ok ? 'Updated · '+t : 'Reconnecting · '+t;
  }

  function fetchEvents() {
    var url = API + '?d=' + encodeURIComponent(today());
    return fetch(url,{cache:'no-store',mode:'cors'}).then(function (r) {
      if (!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    }).then(function (json) {
      return ((json && json.events) || []).map(normalize);
    });
  }

  function scheduleNext() {
    clearTimeout(pollTimer);
    if (document.hidden) return;
    var hasLive = events.some(function (e) { return e.__state === 'live'; });
    var wait = hasLive ? POLL_LIVE : POLL_IDLE;
    if (failures) wait = Math.min(MAX_BACKOFF, Math.max(wait, Math.pow(2,Math.min(failures,6))*3000));
    pollTimer = setTimeout(refresh, wait);
  }

  function refresh() {
    if (inFlight || document.hidden) { scheduleNext(); return; }
    inFlight = true;
    root.classList.add('is-refreshing');
    fetchEvents().then(function (list) {
      failures = 0;
      events = dedupe(list).sort(sortEvents);
      rememberAndDetectGoals(events);
      renderFilters();
      patchOrRender();
      setUpdated(true);
      root.classList.remove('feed-error');
    }).catch(function () {
      failures++;
      setUpdated(false);
      root.classList.add('feed-error');
      if (!events.length) {
        var empty = root.querySelector('.sp-empty');
        if (empty) { empty.hidden = false; empty.textContent = 'Live sports feed is temporarily unavailable. Reconnecting automatically…'; }
      }
    }).finally(function () {
      inFlight = false;
      root.classList.remove('is-refreshing');
      scheduleNext();
    });
  }

  function tickLiveClocks() {
    if (document.hidden) return;
    root.querySelectorAll('.sp-live-clock').forEach(function (node) {
      var id = node.getAttribute('data-id');
      var e = events.find(function (x) { return x.__id === id; });
      if (e && e.__state === 'live') node.textContent = liveLabel(e);
    });
  }

  root.addEventListener('click', function (e) {
    var filter = e.target.closest('.sp-filter');
    if (filter) {
      activeSport = filter.getAttribute('data-sport') || 'All';
      lastFilteredIds = '';
      renderFilters();
      patchOrRender();
      return;
    }
    if (e.target.closest('.sp-refresh')) {
      clearTimeout(pollTimer);
      failures = 0;
      refresh();
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimeout(pollTimer);
      return;
    }
    tickLiveClocks();
    refresh();
  });

  tickTimer = setInterval(tickLiveClocks,1000);
  refresh();
})();
