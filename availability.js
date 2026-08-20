/* ============================================================
   AVAILABILITY + WORK STATUS AUTO-SWITCH
   ============================================================ */
(function () {
  var DEFAULT_SWITCH = Date.UTC(2026, 6, 31, 18, 15, 0); // 1 Aug 2026, 00:00 NPT
  var LOTUS_SWITCH = Date.UTC(2026, 7, 31, 20, 0, 0);     // 1 Sep 2026, 00:00 Dubai (UTC+4)
  var gearCleanupQueued = false;
  var gearCleanupDone = false;

  function cutoffFor(el) {
    var attr = el && el.getAttribute && el.getAttribute('data-avail-at');
    if (!attr) return DEFAULT_SWITCH;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(attr);
    if (!m) return DEFAULT_SWITCH;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], 0, 0, 0) - (5 * 60 + 45) * 60 * 1000;
  }

  function isAfter(el) { return Date.now() >= cutoffFor(el); }

  function applyAvailability(animate) {
    var nodes = document.querySelectorAll('[data-avail-before], [data-avail-only]');
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        var after = isAfter(el);
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
        el.classList.add('avail-swapping');
        window.setTimeout(function () {
          el.textContent = next;
          el.classList.remove('avail-swapping');
        }, 300);
      })(nodes[i]);
    }
  }

  function nextCutoff() {
    var nodes = document.querySelectorAll('[data-avail-before], [data-avail-only]');
    var now = Date.now(), soonest = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var at = cutoffFor(nodes[i]);
      if (at > now && at < soonest) soonest = at;
    }
    if (LOTUS_SWITCH > now && LOTUS_SWITCH < soonest) soonest = LOTUS_SWITCH;
    return soonest;
  }

  function injectSitePolish() {
    if (document.getElementById('rk-lotus-layout-polish')) return;
    var style = document.createElement('style');
    style.id = 'rk-lotus-layout-polish';
    style.textContent = `
body:has(.hero-name) .hero .eyebrow{display:none!important}
body:has(.hero-name) .cta-strip p[data-avail-before]{display:none!important}
body:has(.hero-name) .btn-primary{color:#fff!important;text-shadow:0 1px 10px rgba(0,0,0,.18)}

/* ── Lotus career signal — compact, dimensional, GPU-friendly ── */
.lotus-work-card{
  --lotus-x:50%;--lotus-y:50%;--lotus-rx:0deg;--lotus-ry:0deg;
  position:relative;isolation:isolate;display:grid;grid-template-columns:78px minmax(0,1fr) auto;align-items:center;
  gap:1rem;width:min(100%,575px);max-width:100%;margin:0 0 1.45rem;padding:.86rem 1rem .86rem .86rem;
  border:1px solid rgba(91,194,244,.24);border-radius:24px;overflow:hidden;transform-style:preserve-3d;
  background:
    radial-gradient(440px circle at var(--lotus-x) var(--lotus-y),rgba(61,213,255,.11),transparent 56%),
    linear-gradient(135deg,rgba(255,255,255,.095),rgba(255,255,255,.025) 52%,rgba(117,98,255,.055));
  box-shadow:0 18px 46px rgba(3,15,30,.24),inset 0 1px 0 rgba(255,255,255,.15);
  -webkit-backdrop-filter:blur(14px) saturate(1.12);backdrop-filter:blur(14px) saturate(1.12);
  transform:perspective(1000px) rotateX(var(--lotus-rx)) rotateY(var(--lotus-ry)) translate3d(0,0,0);
  transition:transform .42s cubic-bezier(.16,1,.3,1),border-color .35s ease,box-shadow .35s ease,background .35s ease;
  will-change:transform;
}
.lotus-work-card::before{
  content:'';position:absolute;inset:0;z-index:-1;padding:1px;border-radius:inherit;pointer-events:none;
  background:linear-gradient(115deg,transparent 6%,#52ddff 24%,transparent 43%,#8c72ff 66%,transparent 84%);
  background-size:230% 230%;opacity:.42;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
  animation:lotusEdgeRun 7.5s linear infinite;
}
.lotus-work-card::after{
  content:'';position:absolute;inset:-45% -15%;z-index:-2;pointer-events:none;
  background:radial-gradient(circle at 20% 35%,rgba(49,216,255,.18),transparent 30%),radial-gradient(circle at 82% 62%,rgba(139,108,255,.16),transparent 34%);
  transform:translate3d(-2%,1%,0);animation:lotusAuraDrift 8s ease-in-out infinite alternate;
}
.lotus-work-card:hover{border-color:rgba(91,211,255,.48);box-shadow:0 28px 70px rgba(4,19,38,.28),0 0 42px rgba(55,183,238,.11),inset 0 1px 0 rgba(255,255,255,.22)}
@keyframes lotusEdgeRun{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes lotusAuraDrift{to{transform:translate3d(3%,-2%,0) scale(1.035)}}

.lotus-card-sheen{position:absolute;inset:-1px;z-index:1;border-radius:inherit;pointer-events:none;overflow:hidden}
.lotus-card-sheen::before{content:'';position:absolute;top:-35%;bottom:-35%;left:-38%;width:28%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transform:skewX(-18deg);opacity:0}
.lotus-work-card:hover .lotus-card-sheen::before{animation:lotusSheen .92s cubic-bezier(.16,1,.3,1)}
@keyframes lotusSheen{0%{left:-38%;opacity:0}18%{opacity:.7}100%{left:120%;opacity:0}}

.lotus-logo-shell{
  position:relative;z-index:3;display:grid;place-items:center;flex:0 0 auto;width:78px;height:64px;padding:8px;border-radius:18px;
  background:linear-gradient(145deg,#ffffff,#edf4f9 74%,#dce9f2);border:1px solid rgba(255,255,255,.8);
  box-shadow:0 16px 30px rgba(5,25,50,.24),0 3px 8px rgba(5,25,50,.14),inset 0 1px 0 #fff;
  transform:translateZ(32px) rotateY(-7deg) rotateX(3deg);
  transition:transform .55s cubic-bezier(.16,1,.3,1),box-shadow .45s ease;
}
.lotus-logo-shell::before{content:'';position:absolute;inset:-8px;border:1px solid rgba(68,211,255,.25);border-radius:23px;opacity:.45;transform:scale(.88) rotate(-4deg);transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .35s ease}
.lotus-logo-shell::after{content:'';position:absolute;width:7px;height:7px;right:-3px;top:10px;border-radius:50%;background:#56e4ff;box-shadow:0 0 16px rgba(86,228,255,.8);animation:lotusDotPulse 2.2s ease-in-out infinite}
.lotus-logo-shell img{display:block;max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(6,40,70,.1));transition:transform .55s cubic-bezier(.16,1,.3,1)}
.lotus-work-card:hover .lotus-logo-shell{transform:translateZ(38px) rotateY(2deg) rotateX(-1deg) translateY(-3px);box-shadow:0 22px 38px rgba(5,25,50,.28),0 4px 10px rgba(5,25,50,.16),inset 0 1px 0 #fff}
.lotus-work-card:hover .lotus-logo-shell::before{opacity:.8;transform:scale(1) rotate(6deg)}
.lotus-work-card:hover .lotus-logo-shell img{transform:scale(1.035)}
@keyframes lotusDotPulse{0%,100%{transform:scale(.75);opacity:.6}50%{transform:scale(1.15);opacity:1}}

.lotus-work-copy{position:relative;z-index:3;display:flex;min-width:0;flex-direction:column;gap:.18rem;transform:translateZ(22px)}
.lotus-work-kicker{display:flex;align-items:center;gap:.42rem;font:800 .58rem/1 'Space Grotesk',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#54d8ff}
.lotus-work-kicker::before{content:'';width:20px;height:1px;background:linear-gradient(90deg,#4ddcff,rgba(77,220,255,.08));box-shadow:0 0 8px rgba(77,220,255,.4)}
.lotus-work-status{font:850 clamp(.98rem,1.7vw,1.18rem)/1.12 'Bricolage Grotesque',sans-serif;letter-spacing:-.025em;color:var(--text,#eaf4fb);text-wrap:balance;transition:opacity .3s ease,transform .3s ease}
.lotus-work-role-row{display:flex;align-items:center;gap:.44rem;flex-wrap:wrap;margin-top:.12rem}
.lotus-work-role,.lotus-work-location{display:inline-flex;align-items:center;gap:.32rem;width:max-content;max-width:100%;font-size:.62rem;line-height:1.1;color:var(--muted,#8095ad)}
.lotus-work-role{padding:.28rem .48rem;border:1px solid rgba(100,170,215,.16);border-radius:999px;background:rgba(255,255,255,.025)}
.lotus-work-location::before{content:'';width:5px;height:5px;border-radius:50%;background:#42d8ff;box-shadow:0 0 10px rgba(66,216,255,.55)}

.lotus-work-orb{position:relative;z-index:3;display:grid;place-items:center;align-self:center;width:54px;height:54px;border-radius:18px;border:1px solid rgba(111,184,227,.22);background:linear-gradient(145deg,rgba(8,21,39,.72),rgba(29,48,78,.58));box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 10px 22px rgba(4,15,30,.18);transform:translateZ(26px);overflow:hidden}
.lotus-work-orb::before{content:'';position:absolute;inset:-45%;background:conic-gradient(from 0deg,transparent 0 25%,rgba(74,214,255,.28),transparent 48% 72%,rgba(140,112,255,.25),transparent);animation:lotusOrbSpin 8s linear infinite}
.lotus-work-orb-inner{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;width:44px;height:44px;border-radius:14px;background:rgba(6,15,28,.82);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.lotus-work-date-label{font:800 .43rem/1 'Space Grotesk',sans-serif;letter-spacing:.16em;color:#62ddff}
.lotus-work-date-value{margin-top:.16rem;font:850 .75rem/1 'Bricolage Grotesque',sans-serif;color:#f4fbff}
@keyframes lotusOrbSpin{to{transform:rotate(360deg)}}

.lotus-work-card.is-entering{animation:lotusCardEnter .75s cubic-bezier(.16,1,.3,1) both}
.lotus-work-card.is-entering .lotus-logo-shell{animation:lotusLogoEnter .9s cubic-bezier(.16,1,.3,1) .06s both}
.lotus-work-card.is-entering .lotus-work-copy{animation:lotusCopyEnter .78s cubic-bezier(.16,1,.3,1) .1s both}
.lotus-work-card.is-entering .lotus-work-orb{animation:lotusOrbEnter .82s cubic-bezier(.16,1,.3,1) .14s both}
@keyframes lotusCardEnter{from{opacity:0;transform:perspective(1000px) translate3d(0,18px,0) scale(.975)}to{opacity:1;transform:perspective(1000px) translate3d(0,0,0) scale(1)}}
@keyframes lotusLogoEnter{from{opacity:0;transform:translateZ(32px) translateX(-14px) rotateY(-16deg) scale(.86)}to{opacity:1;transform:translateZ(32px) rotateY(-7deg) rotateX(3deg) scale(1)}}
@keyframes lotusCopyEnter{from{opacity:0;transform:translate3d(0,10px,22px)}to{opacity:1;transform:translate3d(0,0,22px)}}
@keyframes lotusOrbEnter{from{opacity:0;transform:translate3d(12px,0,26px) scale(.82) rotate(12deg)}to{opacity:1;transform:translate3d(0,0,26px) scale(1) rotate(0)}}

html[data-theme="light"] .lotus-work-card{background:radial-gradient(440px circle at var(--lotus-x) var(--lotus-y),rgba(54,198,246,.10),transparent 56%),linear-gradient(135deg,rgba(255,255,255,.98),rgba(242,248,253,.92) 52%,rgba(238,235,255,.75));box-shadow:0 18px 46px rgba(50,85,120,.11),inset 0 1px 0 #fff;border-color:rgba(71,154,210,.22)}
html[data-theme="light"] .lotus-work-status{color:#102234}
html[data-theme="light"] .lotus-work-role{background:rgba(235,245,252,.78);border-color:rgba(73,141,188,.15)}
html[data-theme="light"] .lotus-work-orb{background:linear-gradient(145deg,#eaf7ff,#e9e8ff);box-shadow:inset 0 1px 0 #fff,0 10px 22px rgba(55,90,130,.12)}
html[data-theme="light"] .lotus-work-orb-inner{background:rgba(250,253,255,.88);box-shadow:inset 0 0 0 1px rgba(48,112,155,.08)}
html[data-theme="light"] .lotus-work-date-value{color:#14304a}

.lotus-exp-card{position:relative;overflow:hidden;border-color:rgba(44,146,211,.28)!important;background:linear-gradient(145deg,rgba(28,116,177,.09),rgba(255,255,255,.025))!important;box-shadow:0 16px 38px rgba(6,26,48,.14)!important}.lotus-exp-card::after{content:'';position:absolute;inset:auto -8% -54% auto;width:230px;height:230px;border-radius:50%;background:radial-gradient(circle,rgba(35,149,217,.14),transparent 68%);pointer-events:none}.lotus-exp-brand{display:flex;align-items:center;gap:.7rem;margin:0 0 .75rem;width:max-content;max-width:100%}.lotus-exp-logo{display:grid;place-items:center;width:74px;height:50px;padding:5px;border-radius:11px;background:#fff;box-shadow:0 9px 20px rgba(11,39,66,.15);transition:transform .3s ease}.lotus-exp-card:hover .lotus-exp-logo{transform:translateY(-2px) scale(1.02)}.lotus-exp-logo img{width:100%;height:100%;object-fit:contain}.lotus-exp-brand-text{display:flex;flex-direction:column;gap:.08rem}.lotus-exp-brand-text b{font-family:'Bricolage Grotesque',sans-serif;font-size:.82rem;color:var(--text)}.lotus-exp-brand-text small{font-size:.64rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
.portfolio-page #video-editing-panel{width:100%}.portfolio-page #video-editing-panel .edit-reel-grid{width:100%!important;max-width:none!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:clamp(.8rem,1.5vw,1.15rem)!important;margin-right:0!important}.portfolio-page #video-editing-panel .reel-card{width:100%}.portfolio-page .tiktok-showcase{width:100%;max-width:none;margin-left:0;margin-right:0}.portfolio-page .tiktok-card-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:1rem!important}.portfolio-page .tiktok-card{width:100%;min-width:0}.portfolio-page .tiktok-card-media{width:100%}
#gear-panel .gear-eosr .gear-product img,#gear-panel .gear-a6600 .gear-product img{padding:0!important;background:transparent!important;border-radius:0!important;box-shadow:none!important}#gear-panel .gear-eosr .gear-product img{max-width:91%!important;max-height:87%!important}#gear-panel .gear-a6600 .gear-product img{max-width:92%!important;max-height:91%!important}
@media(max-width:980px){.portfolio-page #video-editing-panel .edit-reel-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.portfolio-page .tiktok-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:680px){.lotus-work-card{grid-template-columns:66px minmax(0,1fr) auto;width:100%;gap:.78rem;padding:.75rem}.lotus-logo-shell{width:66px;height:54px;border-radius:15px}.lotus-work-orb{width:48px;height:48px;border-radius:15px}.lotus-work-orb-inner{width:39px;height:39px}.lotus-work-status{font-size:.95rem}.lotus-work-role-row{gap:.34rem}.portfolio-page #video-editing-panel .edit-reel-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.portfolio-page .tiktok-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:460px){.lotus-work-card{grid-template-columns:58px minmax(0,1fr);border-radius:20px}.lotus-logo-shell{width:58px;height:48px}.lotus-work-orb{display:none}.lotus-work-role{font-size:.58rem}.lotus-work-location{font-size:.58rem}}
@media(prefers-reduced-motion:reduce){.lotus-work-card,.lotus-logo-shell,.lotus-work-copy,.lotus-work-orb{animation:none!important;transform:none!important;transition:none!important}.lotus-work-card::before,.lotus-work-card::after,.lotus-logo-shell::after,.lotus-work-orb::before{animation:none!important}.lotus-card-sheen{display:none}}
`;
    document.head.appendChild(style);
  }

  function lotusState() { return Date.now() >= LOTUS_SWITCH; }

  function bindHomeLotusMotion(card) {
    if (!card || card.getAttribute('data-lotus-motion') === '1') return;
    card.setAttribute('data-lotus-motion', '1');
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    requestAnimationFrame(function () {
      card.classList.add('is-entering');
      window.setTimeout(function () { card.classList.remove('is-entering'); }, 1100);
    });

    if (reduce || !window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var frame = 0, px = 0, py = 0;
    card.addEventListener('pointermove', function (e) {
      var rect = card.getBoundingClientRect();
      px = (e.clientX - rect.left) / rect.width;
      py = (e.clientY - rect.top) / rect.height;
      if (frame) return;
      frame = requestAnimationFrame(function () {
        var x = Math.max(0, Math.min(1, px));
        var y = Math.max(0, Math.min(1, py));
        card.style.setProperty('--lotus-x', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--lotus-y', (y * 100).toFixed(1) + '%');
        card.style.setProperty('--lotus-ry', ((x - .5) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--lotus-rx', ((.5 - y) * 4).toFixed(2) + 'deg');
        frame = 0;
      });
    }, { passive:true });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--lotus-x','50%');
      card.style.setProperty('--lotus-y','50%');
      card.style.setProperty('--lotus-rx','0deg');
      card.style.setProperty('--lotus-ry','0deg');
    });
  }

  function addHomeLotusCard() {
    var heroLeft = document.querySelector('.hero .hero-left');
    if (!heroLeft || document.querySelector('.lotus-work-card')) return;
    var card = document.createElement('div');
    card.className = 'lotus-work-card';
    card.innerHTML = '<span class="lotus-card-sheen" aria-hidden="true"></span>' +
      '<span class="lotus-logo-shell"><img src="lotus-logo.svg" alt="Lotus Educational Institute"></span>' +
      '<span class="lotus-work-copy"><span class="lotus-work-kicker">Career update</span>' +
      '<strong class="lotus-work-status"></strong>' +
      '<span class="lotus-work-role-row"><span class="lotus-work-role">Social Media Content Creator</span><span class="lotus-work-location">Dubai, UAE</span></span></span>' +
      '<span class="lotus-work-orb" aria-hidden="true"><span class="lotus-work-orb-inner"><span class="lotus-work-date-label"></span><span class="lotus-work-date-value"></span></span></span>';
    var name = heroLeft.querySelector('.hero-name');
    if (name) heroLeft.insertBefore(card, name); else heroLeft.insertBefore(card, heroLeft.firstChild);
    bindHomeLotusMotion(card);
  }

  function addExperienceLotusCard() {
    var timeline = document.querySelector('.experience-page .timeline');
    if (!timeline || timeline.querySelector('.lotus-exp-card')) return;
    var item = document.createElement('div');
    item.className = 'timeline-item reveal visible';
    item.innerHTML = '<div class="timeline-dot"></div><div class="exp-card lotus-exp-card" data-glow data-lift>' +
      '<div class="lotus-exp-brand"><span class="lotus-exp-logo"><img src="lotus-logo.svg" alt="Lotus Educational Institute"></span>' +
      '<span class="lotus-exp-brand-text"><b>Lotus Educational Institute</b><small>Dubai, UAE · Full-time</small></span></div>' +
      '<div class="exp-header"><span class="job-title">Social Media Content Creator</span><span class="job-period lotus-job-period"></span></div>' +
      '<div class="job-company lotus-job-company"></div>' +
      '<ul class="job-points"><li>Create short-form social media content, campaign creatives, and platform-ready video assets for the institute.</li><li>Plan and produce content that supports student engagement, brand visibility, and educational marketing.</li></ul></div>';
    timeline.insertBefore(item, timeline.firstChild);
  }

  function updateLotusText(animate) {
    var after = lotusState();
    var status = document.querySelector('.lotus-work-status');
    var period = document.querySelector('.lotus-job-period');
    var company = document.querySelector('.lotus-job-company');
    var dateLabel = document.querySelector('.lotus-work-date-label');
    var dateValue = document.querySelector('.lotus-work-date-value');
    var kicker = document.querySelector('.lotus-work-kicker');
    var statusText = after ? 'Working at Lotus Educational Institute' : 'Starting Sep 1 at Lotus Educational Institute';
    var periodText = after ? 'Sep 2026 – Present' : 'Starts Sep 1, 2026';
    var companyText = after ? 'Lotus Educational Institute · Dubai, UAE · Full-time' : 'Joining Lotus Educational Institute · Dubai, UAE · Full-time';
    var dateLabelText = after ? 'STATUS' : 'START';
    var dateValueText = after ? 'NOW' : 'SEP 01';
    var kickerText = after ? 'Current role' : 'Career update';
    [[status,statusText],[period,periodText],[company,companyText],[dateLabel,dateLabelText],[dateValue,dateValueText],[kicker,kickerText]].forEach(function (pair) {
      if (!pair[0] || pair[0].textContent === pair[1]) return;
      if (!animate) { pair[0].textContent = pair[1]; return; }
      pair[0].classList.add('avail-swapping');
      window.setTimeout(function () { pair[0].textContent = pair[1]; pair[0].classList.remove('avail-swapping'); }, 300);
    });
  }

  function cleanGearBackground(img) {
    if (!img || img.getAttribute('data-rk-gear-clean')) return;
    img.setAttribute('data-rk-gear-clean', 'pending');
    var source = img.getAttribute('src');
    if (!source) return;
    var probe = new Image();
    if (/^https?:\/\//i.test(source)) probe.crossOrigin = 'anonymous';
    probe.decoding = 'async';
    probe.onload = function () {
      try {
        var width = probe.naturalWidth, height = probe.naturalHeight;
        if (!width || !height) throw new Error('empty image');

        /* Downscale before pixel processing. The result is only used inside a
           small gear card, so processing multi-megapixel originals wastes CPU
           and can freeze the portfolio page on reload. */
        var maxSide = 720;
        var scale = Math.min(1, maxSide / Math.max(width, height));
        var w = Math.max(1, Math.round(width * scale));
        var h = Math.max(1, Math.round(height * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(probe, 0, 0, w, h);
        var pixels = ctx.getImageData(0, 0, w, h), data = pixels.data;
        var total = w * h, seen = new Uint8Array(total), queue = new Int32Array(total);
        var head = 0, tail = 0;
        function isBrightNeutral(index) {
          var p = index * 4, r = data[p], g = data[p + 1], b = data[p + 2];
          var max = Math.max(r, g, b), min = Math.min(r, g, b), avg = (r + g + b) / 3;
          return avg > 178 && (max - min) < 38;
        }
        function push(index) {
          if (index < 0 || index >= total || seen[index] || !isBrightNeutral(index)) return;
          seen[index] = 1; queue[tail++] = index;
        }
        var x, y;
        for (x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
        for (y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
        while (head < tail) {
          var index = queue[head++]; data[index * 4 + 3] = 0;
          x = index % w; y = (index / w) | 0;
          if (x > 0) push(index - 1); if (x + 1 < w) push(index + 1);
          if (y > 0) push(index - w); if (y + 1 < h) push(index + w);
        }
        ctx.putImageData(pixels, 0, 0);
        img.src = canvas.toDataURL('image/png');
        img.setAttribute('data-rk-gear-clean', 'true');
      } catch (error) { img.setAttribute('data-rk-gear-clean', 'failed'); }
    };
    probe.onerror = function () { img.setAttribute('data-rk-gear-clean', 'failed'); };
    probe.src = source;
  }

  function fixGearImageBackgrounds() {
    if (gearCleanupDone) return;
    var panel = document.getElementById('gear-panel');
    if (!panel) return;
    gearCleanupDone = true;
    var a6600 = panel.querySelector('img[src*="sony-a6600"]');
    if (a6600) { var a6600Card = a6600.closest('.gear-card'); if (a6600Card) a6600Card.classList.add('gear-a6600'); cleanGearBackground(a6600); }
    var eos = panel.querySelector('.gear-eosr img');
    if (eos) {
      eos.src = 'https://i1.adis.ws/i/canon/3075C003_EOS-R_01?fmt=png&qlt=88&w=720';
      eos.removeAttribute('data-rk-gear-clean');
      cleanGearBackground(eos);
    }
  }

  function queueGearCleanup() {
    if (gearCleanupQueued || gearCleanupDone || !document.getElementById('gear-panel')) return;
    gearCleanupQueued = true;
    var run = function () { gearCleanupQueued = false; fixGearImageBackgrounds(); };
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1800 });
    else window.setTimeout(run, 350);
  }

  function bindGearCleanup() {
    var tab = document.getElementById('gear-tab');
    if (tab) tab.addEventListener('click', queueGearCleanup, { once: true });
    if (location.hash === '#gear' || location.hash === '#gear-panel') queueGearCleanup();
  }

  function init() {
    applyAvailability(false);
    injectSitePolish();
    addHomeLotusCard();
    addExperienceLotusCard();
    updateLotusText(false);
    bindGearCleanup();
    schedule();
  }

  function schedule() {
    var next = nextCutoff();
    if (next === Infinity) return;
    var ms = next - Date.now();
    window.setTimeout(function () { applyAvailability(true); updateLotusText(true); schedule(); }, Math.max(1000, Math.min(ms + 500, 3600000)));
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { applyAvailability(true); updateLotusText(true); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();