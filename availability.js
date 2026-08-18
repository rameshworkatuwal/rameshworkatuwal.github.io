/* ============================================================
   AVAILABILITY + WORK STATUS AUTO-SWITCH
   ============================================================ */
(function () {
  var DEFAULT_SWITCH = Date.UTC(2026, 6, 31, 18, 15, 0); // 1 Aug 2026, 00:00 NPT
  var LOTUS_SWITCH = Date.UTC(2026, 7, 31, 20, 0, 0);     // 1 Sep 2026, 00:00 Dubai (UTC+4)

  function cutoffFor(el) {
    var attr = el && el.getAttribute && el.getAttribute('data-avail-at');
    if (!attr) return DEFAULT_SWITCH;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(attr);
    if (!m) return DEFAULT_SWITCH;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], 0, 0, 0) - (5 * 60 + 45) * 60 * 1000;
  }

  function isAfter(el) {
    return Date.now() >= cutoffFor(el);
  }

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
/* Home: remove old availability pill and make CTA text white */
body:has(.hero-name) .hero .eyebrow{display:none!important}
body:has(.hero-name) .cta-strip p[data-avail-before]{display:none!important}
body:has(.hero-name) .btn-primary{color:#fff!important;text-shadow:0 1px 10px rgba(0,0,0,.18)}

/* Compact Lotus work badge */
.lotus-work-card{
  --rx:0deg;--ry:0deg;
  position:relative;display:flex;align-items:center;gap:.8rem;width:max-content;max-width:min(100%,430px);
  margin:0 0 1.25rem;padding:.62rem .85rem .62rem .68rem;border:1px solid rgba(69,157,219,.25);
  border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025));
  box-shadow:0 14px 34px rgba(4,15,30,.24),inset 0 1px 0 rgba(255,255,255,.16);
  backdrop-filter:blur(14px);transform:perspective(800px) rotateX(var(--rx)) rotateY(var(--ry));
  transform-style:preserve-3d;transition:transform .2s ease,box-shadow .3s ease,border-color .3s ease;
  overflow:hidden;isolation:isolate;
}
.lotus-work-card::before{content:'';position:absolute;inset:-45%;z-index:-1;background:conic-gradient(from 180deg,transparent,rgba(56,225,255,.12),transparent 28%,rgba(139,108,255,.13),transparent 58%);animation:lotusHalo 8s linear infinite}
.lotus-work-card:hover{border-color:rgba(72,185,247,.48);box-shadow:0 20px 46px rgba(4,15,30,.34),0 0 28px rgba(48,160,235,.1),inset 0 1px 0 rgba(255,255,255,.2)}
@keyframes lotusHalo{to{transform:rotate(360deg)}}
.lotus-logo-shell{position:relative;display:grid;place-items:center;flex:0 0 64px;width:64px;height:48px;padding:5px;border-radius:11px;background:linear-gradient(145deg,#fff,#eaf1f7);box-shadow:0 9px 20px rgba(5,25,50,.24),inset 0 1px 0 #fff;transform:translateZ(28px)}
.lotus-logo-shell img{display:block;max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 2px 2px rgba(0,0,0,.06))}
.lotus-work-copy{display:flex;min-width:0;flex-direction:column;gap:.1rem;transform:translateZ(18px)}
.lotus-work-kicker{font:700 .6rem/1 'Space Grotesk',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#61d9ff}
.lotus-work-status{font:800 clamp(.84rem,1.4vw,1rem)/1.25 'Bricolage Grotesque',sans-serif;color:var(--text,#eaf4fb)}
.lotus-work-role{font-size:.68rem;line-height:1.3;color:var(--muted,#8095ad)}
html[data-theme="light"] .lotus-work-card{background:linear-gradient(145deg,rgba(255,255,255,.94),rgba(238,246,253,.78));box-shadow:0 14px 32px rgba(43,74,110,.12);border-color:rgba(55,135,196,.2)}
html[data-theme="light"] .lotus-work-status{color:#102234}

/* Experience: current/future Lotus role */
.lotus-exp-card{position:relative;overflow:hidden;border-color:rgba(44,146,211,.28)!important;background:linear-gradient(145deg,rgba(28,116,177,.09),rgba(255,255,255,.025))!important;box-shadow:0 16px 38px rgba(6,26,48,.16)!important}
.lotus-exp-card::after{content:'';position:absolute;inset:auto -8% -54% auto;width:230px;height:230px;border-radius:50%;background:radial-gradient(circle,rgba(35,149,217,.18),transparent 68%);pointer-events:none}
.lotus-exp-brand{display:flex;align-items:center;gap:.7rem;margin:0 0 .75rem;width:max-content;max-width:100%}
.lotus-exp-logo{display:grid;place-items:center;width:74px;height:50px;padding:5px;border-radius:11px;background:#fff;box-shadow:0 9px 20px rgba(11,39,66,.15);transform:perspective(500px) rotateY(-8deg) rotateX(4deg);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.lotus-exp-card:hover .lotus-exp-logo{transform:perspective(500px) rotateY(0) rotateX(0) translateY(-3px) scale(1.03)}
.lotus-exp-logo img{width:100%;height:100%;object-fit:contain}
.lotus-exp-brand-text{display:flex;flex-direction:column;gap:.08rem}
.lotus-exp-brand-text b{font-family:'Bricolage Grotesque',sans-serif;font-size:.82rem;color:var(--text)}
.lotus-exp-brand-text small{font-size:.64rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}

/* Portfolio video editing: remove awkward empty side space */
.portfolio-page #video-editing-panel{width:100%}
.portfolio-page #video-editing-panel .edit-reel-grid{
  width:100%!important;max-width:none!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;
  gap:clamp(.8rem,1.5vw,1.15rem)!important;margin-right:0!important;
}
.portfolio-page #video-editing-panel .reel-card{width:100%}
.portfolio-page .tiktok-showcase{width:100%;max-width:none;margin-left:0;margin-right:0}
.portfolio-page .tiktok-card-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:1rem!important}
.portfolio-page .tiktok-card{width:100%;min-width:0}
.portfolio-page .tiktok-card-media{width:100%}

/* Gear: remove the two obvious white image boxes */
#gear-panel .gear-eosr .gear-product img,
#gear-panel .gear-a6600 .gear-product img{
  padding:0!important;
  background:transparent!important;
  border-radius:0!important;
  box-shadow:none!important;
}
#gear-panel .gear-eosr .gear-product img{max-width:91%!important;max-height:87%!important}
#gear-panel .gear-a6600 .gear-product img{max-width:92%!important;max-height:91%!important}

@media(max-width:980px){
  .portfolio-page #video-editing-panel .edit-reel-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  .portfolio-page .tiktok-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}
@media(max-width:600px){
  .portfolio-page #video-editing-panel .edit-reel-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .portfolio-page .tiktok-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .lotus-work-card{width:100%}.lotus-logo-shell{flex-basis:58px;width:58px;height:44px}
}
@media(prefers-reduced-motion:reduce){.lotus-work-card::before{animation:none}.lotus-work-card{transform:none!important}}
`;
    document.head.appendChild(style);
  }

  function lotusState() {
    return Date.now() >= LOTUS_SWITCH;
  }

  function addHomeLotusCard() {
    var heroLeft = document.querySelector('.hero .hero-left');
    if (!heroLeft || document.querySelector('.lotus-work-card')) return;
    var card = document.createElement('div');
    card.className = 'lotus-work-card';
    card.innerHTML = '<span class="lotus-logo-shell"><img src="lotus-logo.svg" alt="Lotus Educational Institute"></span>' +
      '<span class="lotus-work-copy"><span class="lotus-work-kicker">Current career update</span>' +
      '<strong class="lotus-work-status"></strong><span class="lotus-work-role">Social Media Content Creator · Dubai</span></span>';

    var name = heroLeft.querySelector('.hero-name');
    if (name) heroLeft.insertBefore(card, name); else heroLeft.insertBefore(card, heroLeft.firstChild);

    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--rx', ((0.5 - py) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * 7).toFixed(2) + 'deg');
      }, {passive:true});
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');
      });
    }
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
    var statusText = after ? 'Working at Lotus Educational Institute' : 'Starting Sep 1 at Lotus Educational Institute';
    var periodText = after ? 'Sep 2026 – Present' : 'Starts Sep 1, 2026';
    var companyText = after ? 'Lotus Educational Institute · Dubai, UAE · Full-time' : 'Joining Lotus Educational Institute · Dubai, UAE · Full-time';
    [ [status,statusText], [period,periodText], [company,companyText] ].forEach(function(pair){
      if (!pair[0] || pair[0].textContent === pair[1]) return;
      if (!animate) { pair[0].textContent = pair[1]; return; }
      pair[0].classList.add('avail-swapping');
      window.setTimeout(function(){pair[0].textContent=pair[1];pair[0].classList.remove('avail-swapping');},300);
    });
  }

  /* Removes bright, edge-connected white/gray backgrounds while keeping
     enclosed silver camera details intact. Local JPG/PNG assets are safe to
     process; remote images simply fall back if their CDN blocks canvas CORS. */
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
        var width = probe.naturalWidth;
        var height = probe.naturalHeight;
        if (!width || !height) throw new Error('empty image');

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d', {willReadFrequently:true});
        ctx.drawImage(probe, 0, 0);
        var pixels = ctx.getImageData(0, 0, width, height);
        var data = pixels.data;
        var total = width * height;
        var seen = new Uint8Array(total);
        var queue = new Int32Array(total);
        var head = 0;
        var tail = 0;

        function isBrightNeutral(index) {
          var p = index * 4;
          var r = data[p], g = data[p + 1], b = data[p + 2];
          var max = Math.max(r,g,b), min = Math.min(r,g,b);
          var avg = (r + g + b) / 3;
          return avg > 178 && (max - min) < 38;
        }

        function push(index) {
          if (index < 0 || index >= total || seen[index] || !isBrightNeutral(index)) return;
          seen[index] = 1;
          queue[tail++] = index;
        }

        var x, y;
        for (x = 0; x < width; x++) {
          push(x);
          push((height - 1) * width + x);
        }
        for (y = 0; y < height; y++) {
          push(y * width);
          push(y * width + width - 1);
        }

        while (head < tail) {
          var index = queue[head++];
          data[index * 4 + 3] = 0;
          x = index % width;
          y = (index / width) | 0;
          if (x > 0) push(index - 1);
          if (x + 1 < width) push(index + 1);
          if (y > 0) push(index - width);
          if (y + 1 < height) push(index + width);
        }

        ctx.putImageData(pixels, 0, 0);
        img.src = canvas.toDataURL('image/png');
        img.setAttribute('data-rk-gear-clean', 'true');
      } catch (error) {
        img.setAttribute('data-rk-gear-clean', 'failed');
      }
    };

    probe.onerror = function () {
      img.setAttribute('data-rk-gear-clean', 'failed');
    };
    probe.src = source;
  }

  function fixGearImageBackgrounds() {
    var panel = document.getElementById('gear-panel');
    if (!panel) return;

    var a6600 = panel.querySelector('img[src*="sony-a6600"]');
    if (a6600) {
      var a6600Card = a6600.closest('.gear-card');
      if (a6600Card) a6600Card.classList.add('gear-a6600');
      cleanGearBackground(a6600);
    }

    var eos = panel.querySelector('.gear-eosr img');
    if (eos) {
      /* Canon's old URL explicitly requested a white background. Ask for PNG
         without that white-background parameter, then clean only if needed. */
      eos.src = 'https://i1.adis.ws/i/canon/3075C003_EOS-R_01?fmt=png&qlt=90&w=940';
      eos.removeAttribute('data-rk-gear-clean');
      cleanGearBackground(eos);
    }
  }

  function init() {
    applyAvailability(false);
    injectSitePolish();
    addHomeLotusCard();
    addExperienceLotusCard();
    updateLotusText(false);
    fixGearImageBackgrounds();
    schedule();
  }

  function schedule() {
    var next = nextCutoff();
    if (next === Infinity) return;
    var ms = next - Date.now();
    window.setTimeout(function () {
      applyAvailability(true);
      updateLotusText(true);
      schedule();
    }, Math.max(1000, Math.min(ms + 500, 3600000)));
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      applyAvailability(true);
      updateLotusText(true);
      fixGearImageBackgrounds();
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
