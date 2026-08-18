/* Shared navigation behaviour for every page. */
(function () {
  function initNavigation() {
    var nav = document.querySelector('nav');
    var links = nav && nav.querySelector('.nav-links');
    if (!nav || !links) return;

    if (!links.id) links.id = 'site-navigation';

    var toggle = nav.querySelector('.nav-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.type = 'button';
      toggle.textContent = '☰';
      nav.insertBefore(toggle, links);
    }

    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      toggle.textContent = open ? '×' : '☰';
    });

    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        toggle.textContent = '☰';
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      toggle.textContent = '☰';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();

/* Portfolio-only polish: compact category switcher + rebuilt manual Gear rail. */
(function () {
  function initPortfolioPolish() {
    var page = document.querySelector('.portfolio-page');
    if (!page) return;

    if (!document.getElementById('portfolio-polish-20260818')) {
      var style = document.createElement('style');
      style.id = 'portfolio-polish-20260818';
      style.textContent = `
/* Compact category switcher ------------------------------------------------ */
.portfolio-page .portfolio-switch{
  max-width:920px;
  padding:7px;
  border-radius:22px;
  background:
    linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018)),
    rgba(7,12,22,.78);
  border-color:rgba(124,173,215,.16);
  box-shadow:0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.08);
}
.portfolio-page .portfolio-switch::before{opacity:.28;filter:blur(44px)}
.portfolio-page .portfolio-switch-glider{
  top:7px;
  bottom:7px;
  left:7px;
  width:calc(25% - 5.25px);
  border-radius:16px;
  box-shadow:0 9px 22px -8px rgba(55,125,255,.55),inset 0 1px 0 rgba(255,255,255,.3);
}
.portfolio-page .portfolio-tab{
  gap:.62rem;
  min-height:64px;
  padding:.62rem .72rem;
  border-radius:16px;
}
.portfolio-page .portfolio-tab strong{
  font-size:clamp(.84rem,1.1vw,.98rem);
  font-weight:700;
  letter-spacing:-.015em;
}
.portfolio-page .portfolio-tab-icon{
  flex:0 0 42px;
  width:42px;
  height:42px;
  border-radius:13px;
}
.portfolio-page .portfolio-tab-icon svg{width:20px;height:20px}
.portfolio-page .portfolio-play-icon svg{width:17px;height:17px}
.portfolio-page .portfolio-tab:hover .portfolio-tab-icon{transform:translateY(-2px) scale(1.04)}
.portfolio-page .portfolio-tab.is-active .portfolio-tab-icon{transform:scale(1.02)}
.portfolio-page .portfolio-panel-hint{
  margin-top:1.15rem;
  padding:.72rem 1rem;
  border-radius:14px;
  font-size:.82rem;
}

/* Gear panel --------------------------------------------------------------- */
#gear-panel{
  --gear-glow:93,211,255;
  position:relative;
  width:100%;
  overflow:hidden;
  padding:clamp(1.05rem,2.3vw,1.7rem)!important;
  border:1px solid rgba(116,168,210,.14)!important;
  border-radius:24px!important;
  background:
    radial-gradient(circle at 7% -8%,rgba(43,181,230,.14),transparent 31%),
    radial-gradient(circle at 94% 0%,rgba(116,82,230,.14),transparent 30%),
    linear-gradient(155deg,#0c1422 0%,#080d17 58%,#050810 100%)!important;
  box-shadow:0 24px 64px rgba(0,0,0,.34)!important;
  box-sizing:border-box;
}
#gear-panel .gear-heading{
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1.25rem;
  margin:0 0 .75rem;
}
#gear-panel .gear-eyebrow{
  display:block;
  margin-bottom:.38rem;
  color:#68dfff;
  font:700 .64rem/1 'Space Grotesk',sans-serif;
  letter-spacing:.17em;
  text-transform:uppercase;
}
#gear-panel .gear-heading h2{
  margin:0;
  color:#f3f8ff;
  font:800 clamp(1.8rem,3.8vw,3rem)/.98 'Bricolage Grotesque',sans-serif;
  letter-spacing:-.045em;
}
#gear-panel .gear-heading p{
  max-width:600px;
  margin:.48rem 0 0;
  color:#91a5bd;
  font-size:clamp(.76rem,1.1vw,.88rem);
  line-height:1.55;
}
#gear-panel .gear-controls{display:flex;gap:.5rem;flex:0 0 auto}
#gear-panel .gear-arrow{
  display:grid;
  place-items:center;
  width:40px;
  height:40px;
  padding:0;
  border:1px solid rgba(123,172,215,.18);
  border-radius:50%;
  background:rgba(255,255,255,.045);
  color:#d9e7f7;
  cursor:pointer;
  box-shadow:0 8px 20px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.07);
  transition:transform .22s,background .22s,border-color .22s,color .22s;
}
#gear-panel .gear-arrow:hover{
  transform:translateY(-2px);
  background:rgba(74,176,255,.15);
  border-color:rgba(99,208,255,.38);
  color:#fff;
}
#gear-panel .gear-arrow svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
#gear-panel .gear-stage{position:relative;z-index:2;width:100%;overflow:hidden}
#gear-panel .gear-track{
  display:flex;
  gap:14px;
  width:100%;
  overflow-x:auto;
  overscroll-behavior-x:contain;
  scroll-snap-type:x mandatory;
  scroll-behavior:smooth;
  scroll-padding-inline:calc((100% - min(78vw,290px))/2);
  padding:.65rem calc((100% - min(78vw,290px))/2) 1rem;
  box-sizing:border-box;
  scrollbar-width:none;
  -webkit-overflow-scrolling:touch;
}
#gear-panel .gear-track::-webkit-scrollbar{display:none}
#gear-panel .gear-card{
  --brand:93,211,255;
  position:relative;
  isolation:isolate;
  flex:0 0 min(78vw,290px);
  width:min(78vw,290px);
  max-width:290px;
  min-height:374px;
  overflow:hidden;
  scroll-snap-align:center;
  border:1px solid rgba(143,176,210,.14);
  border-radius:22px;
  background:
    radial-gradient(circle at 50% 2%,rgba(var(--brand),.12),transparent 36%),
    linear-gradient(155deg,rgba(255,255,255,.055),rgba(255,255,255,.014) 45%),
    #0a111d;
  color:#f5f8fc;
  box-shadow:0 15px 34px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.055);
  opacity:1!important;
  transform:none!important;
  transition:transform .38s cubic-bezier(.2,.8,.2,1),border-color .3s,box-shadow .38s;
}
#gear-panel .gear-card::before{
  content:'';
  position:absolute;
  left:18%;right:18%;top:54px;
  height:190px;
  z-index:-1;
  border-radius:50%;
  background:radial-gradient(circle,rgba(var(--brand),.16),transparent 67%);
  filter:blur(12px);
}
#gear-panel .gear-card::after{
  content:'';
  position:absolute;
  inset:0;
  z-index:4;
  pointer-events:none;
  border-radius:inherit;
  background:linear-gradient(125deg,rgba(255,255,255,.08),transparent 22%,transparent 75%,rgba(255,255,255,.025));
}
#gear-panel .gear-card.is-current{
  transform:translateY(-5px)!important;
  border-color:rgba(var(--brand),.34);
  box-shadow:0 22px 45px rgba(0,0,0,.38),0 0 0 1px rgba(var(--brand),.05),inset 0 1px 0 rgba(255,255,255,.07);
}
#gear-panel .gear-canon{--brand:236,67,77}
#gear-panel .gear-sony{--brand:73,145,255}
#gear-panel .gear-gopro{--brand:35,203,240}
#gear-panel .gear-dji{--brand:161,112,255}
#gear-panel .gear-number{
  position:absolute;
  top:.85rem;
  left:.95rem;
  z-index:3;
  color:rgba(var(--brand),.9);
  font:700 .64rem/1 'Space Grotesk',sans-serif;
  letter-spacing:.15em;
}
#gear-panel .gear-type{
  position:absolute;
  top:.72rem;
  right:.72rem;
  z-index:3;
  max-width:65%;
  padding:.34rem .52rem;
  border:1px solid rgba(143,176,210,.14);
  border-radius:999px;
  background:rgba(4,9,17,.64);
  color:#a5b5c8;
  font:700 .49rem/1 'Space Grotesk',sans-serif;
  letter-spacing:.09em;
  text-align:center;
  text-transform:uppercase;
  backdrop-filter:blur(9px);
}
#gear-panel .gear-product{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:242px;
  margin:0;
  padding:2.75rem .85rem .25rem;
  box-sizing:border-box;
  transform:none!important;
}
#gear-panel .gear-product::after{
  content:'';
  position:absolute;
  left:22%;right:22%;bottom:8%;
  height:9%;
  z-index:-1;
  border-radius:50%;
  background:rgba(0,0,0,.42);
  filter:blur(13px);
}
#gear-panel .gear-product img{
  display:block!important;
  position:static!important;
  inset:auto!important;
  width:auto!important;
  height:auto!important;
  max-width:92%!important;
  max-height:91%!important;
  margin:auto!important;
  object-fit:contain!important;
  border-radius:11px;
  background:transparent;
  filter:drop-shadow(0 16px 16px rgba(0,0,0,.34));
  transform:none!important;
  transition:transform .42s cubic-bezier(.2,.8,.2,1),filter .35s!important;
}
#gear-panel .gear-card.is-current .gear-product img{
  transform:translateY(-2px) scale(1.018)!important;
  filter:drop-shadow(0 19px 20px rgba(0,0,0,.4));
}
#gear-panel .gear-eosr .gear-product img{
  max-width:88%!important;
  max-height:82%!important;
  padding:.3rem;
  background:#f7f8fa;
  border-radius:14px;
}
#gear-panel .gear-dji-pocket4 .gear-product img{max-height:94%!important;max-width:76%!important}
#gear-panel .gear-card-copy{position:relative;z-index:3;padding:.62rem 1rem 1.1rem}
#gear-panel .gear-card-copy h3{
  margin:0;
  color:#f4f8ff;
  font:800 1.08rem/1.14 'Bricolage Grotesque',sans-serif;
  letter-spacing:-.02em;
}
#gear-panel .gear-card-copy span{
  display:block;
  margin-top:.38rem;
  color:#8093aa;
  font-size:.62rem;
  letter-spacing:.09em;
  text-transform:uppercase;
}
#gear-panel .gear-progress{
  position:relative;
  width:min(360px,66%);
  height:3px;
  margin:.05rem auto 0;
  overflow:hidden;
  border-radius:999px;
  background:rgba(112,144,177,.16);
}
#gear-panel .gear-progress span{
  position:absolute;
  inset:0 auto 0 0;
  border-radius:inherit;
  background:linear-gradient(90deg,#42d9ff,#4e8dff,#8b64f0);
  box-shadow:0 0 12px rgba(75,160,255,.38);
  transition:transform .38s cubic-bezier(.2,.75,.2,1);
}

@media(max-width:760px){
  .portfolio-page .portfolio-switch{padding:6px;border-radius:18px}
  .portfolio-page .portfolio-switch-glider{top:6px;bottom:6px;left:6px;width:calc(25% - 4.5px);border-radius:13px}
  .portfolio-page .portfolio-tab{flex-direction:column;gap:.3rem;min-height:72px;padding:.48rem .18rem;border-radius:13px}
  .portfolio-page .portfolio-tab strong{font-size:.68rem;white-space:normal;text-align:center;line-height:1.15}
  .portfolio-page .portfolio-tab-icon{flex-basis:34px;width:34px;height:34px;border-radius:10px}
  .portfolio-page .portfolio-tab-icon svg{width:17px;height:17px}
  #gear-panel{padding:.95rem!important;border-radius:20px!important}
  #gear-panel .gear-heading{align-items:flex-start}
  #gear-panel .gear-heading p{font-size:.74rem}
  #gear-panel .gear-arrow{width:36px;height:36px}
  #gear-panel .gear-track{scroll-padding-inline:calc((100% - min(82vw,278px))/2);padding-inline:calc((100% - min(82vw,278px))/2)}
  #gear-panel .gear-card{flex-basis:min(82vw,278px);width:min(82vw,278px);max-width:278px;min-height:358px}
  #gear-panel .gear-product{height:226px}
}
@media(prefers-reduced-motion:reduce){
  #gear-panel .gear-track{scroll-behavior:auto}
  #gear-panel .gear-card,#gear-panel .gear-product img{transition:none!important}
}
`;
      document.head.appendChild(style);
    }

    var panel = document.getElementById('gear-panel');
    if (!panel || panel.getAttribute('data-polished') === 'true') return;
    panel.setAttribute('data-polished', 'true');

    var oldTrack = panel.querySelector('.gear-track');
    if (!oldTrack) return;

    /* Clone the rail so the older autoplay listeners become detached. */
    var track = oldTrack.cloneNode(true);

    function makeGearCard(className, type, imageUrl, alt, title) {
      var card = document.createElement('article');
      card.className = 'gear-card ' + className;

      var number = document.createElement('span');
      number.className = 'gear-number';
      number.textContent = '00';

      var badge = document.createElement('span');
      badge.className = 'gear-type';
      badge.textContent = type;

      var product = document.createElement('div');
      product.className = 'gear-product';
      var image = document.createElement('img');
      image.src = imageUrl;
      image.alt = alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      product.appendChild(image);

      var copy = document.createElement('div');
      copy.className = 'gear-card-copy';
      var heading = document.createElement('h3');
      heading.textContent = title;
      var sub = document.createElement('span');
      sub.textContent = 'Hands-on experience';
      copy.appendChild(heading);
      copy.appendChild(sub);

      card.appendChild(number);
      card.appendChild(badge);
      card.appendChild(product);
      card.appendChild(copy);
      return card;
    }

    var originalCards = track.querySelectorAll('.gear-card');
    if (originalCards.length >= 2 && !track.querySelector('.gear-eosr')) {
      var eosR = makeGearCard(
        'gear-canon gear-eosr',
        'Full-Frame Mirrorless',
        'https://i1.adis.ws/i/canon/3075C003_EOS-R_01?bg=white&fmt=webp&qlt=80&w=940',
        'Canon EOS R full-frame mirrorless camera',
        'Canon EOS R'
      );
      originalCards[1].insertAdjacentElement('afterend', eosR);
    }

    if (!track.querySelector('.gear-dji-pocket4')) {
      track.appendChild(makeGearCard(
        'gear-dji gear-dji-pocket4',
        'Pocket Gimbal Camera',
        'https://se-cdn.djiits.com/tpc/uploads/in_the_box/cover/1ec8c69a4977b2b8bea63a357f1f74d7%40retina_small.png?format=webp',
        'DJI Osmo Pocket 4 camera',
        'DJI Osmo Pocket 4'
      ));
    }

    var cards = Array.prototype.slice.call(track.querySelectorAll('.gear-card'));
    cards.forEach(function (card, index) {
      var number = card.querySelector('.gear-number');
      if (number) number.textContent = String(index + 1).padStart(2, '0');
      card.classList.toggle('is-current', index === 0);
      card.setAttribute('aria-current', index === 0 ? 'true' : 'false');
    });

    oldTrack.parentNode.replaceChild(track, oldTrack);

    /* Detach the old progress and controls too, then run one manual slider. */
    var oldProgress = panel.querySelector('.gear-progress');
    var progress = null;
    var fill = null;
    if (oldProgress) {
      progress = oldProgress.cloneNode(true);
      oldProgress.parentNode.replaceChild(progress, oldProgress);
      fill = progress.querySelector('span');
      if (fill) fill.style.width = (100 / cards.length) + '%';
    }

    function replaceButton(selector) {
      var oldButton = panel.querySelector(selector);
      if (!oldButton) return null;
      var button = oldButton.cloneNode(true);
      oldButton.parentNode.replaceChild(button, oldButton);
      return button;
    }

    var prev = replaceButton('.gear-prev');
    var next = replaceButton('.gear-next');
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    function nearestIndex() {
      var centre = track.scrollLeft + track.clientWidth / 2;
      var best = 0;
      var distance = Infinity;
      cards.forEach(function (card, index) {
        var cardCentre = card.offsetLeft + card.offsetWidth / 2;
        var delta = Math.abs(cardCentre - centre);
        if (delta < distance) {
          distance = delta;
          best = index;
        }
      });
      return best;
    }

    function updateProgress(index) {
      if (fill) fill.style.transform = 'translateX(' + (index * 100) + '%)';
      cards.forEach(function (card, cardIndex) {
        card.classList.toggle('is-current', cardIndex === index);
        card.setAttribute('aria-current', cardIndex === index ? 'true' : 'false');
      });
    }

    function go(index) {
      if (!cards.length) return;
      if (index < 0) index = cards.length - 1;
      if (index >= cards.length) index = 0;
      var card = cards[index];
      var left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
      updateProgress(index);
    }

    if (prev) prev.addEventListener('click', function () { go(nearestIndex() - 1); });
    if (next) next.addEventListener('click', function () { go(nearestIndex() + 1); });
    track.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      go(nearestIndex() + (event.key === 'ArrowRight' ? 1 : -1));
    });

    var scrollTick = 0;
    track.addEventListener('scroll', function () {
      window.clearTimeout(scrollTick);
      scrollTick = window.setTimeout(function () { updateProgress(nearestIndex()); }, 70);
    }, { passive: true });

    updateProgress(0);

    /* The old Sony PNG has a checkerboard baked into it. Remove only the
       bright neutral background connected to the image edges, preserving
       silver/white camera details that are enclosed by the camera body. */
    function cleanCheckerboard(img) {
      if (!img || img.getAttribute('data-bg-cleaned')) return;
      img.setAttribute('data-bg-cleaned', 'pending');

      function process() {
        try {
          var probe = new Image();
          probe.decoding = 'async';
          probe.onload = function () {
            try {
              var width = probe.naturalWidth;
              var height = probe.naturalHeight;
              if (!width || !height) return;

              var canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              var context = canvas.getContext('2d', { willReadFrequently: true });
              context.drawImage(probe, 0, 0);
              var pixels = context.getImageData(0, 0, width, height);
              var data = pixels.data;
              var total = width * height;
              var seen = new Uint8Array(total);
              var queue = new Int32Array(total);
              var head = 0;
              var tail = 0;

              function isBackground(index) {
                var p = index * 4;
                var r = data[p];
                var g = data[p + 1];
                var b = data[p + 2];
                var max = Math.max(r, g, b);
                var min = Math.min(r, g, b);
                var avg = (r + g + b) / 3;
                return max - min < 22 && avg > 145;
              }

              function push(index) {
                if (index < 0 || index >= total || seen[index] || !isBackground(index)) return;
                seen[index] = 1;
                queue[tail++] = index;
              }

              var x;
              var y;
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

              context.putImageData(pixels, 0, 0);
              img.src = canvas.toDataURL('image/png');
              img.setAttribute('data-bg-cleaned', 'true');
            } catch (error) {
              img.setAttribute('data-bg-cleaned', 'failed');
            }
          };
          probe.onerror = function () { img.setAttribute('data-bg-cleaned', 'failed'); };
          probe.src = img.getAttribute('src');
        } catch (error) {
          img.setAttribute('data-bg-cleaned', 'failed');
        }
      }

      if (img.complete && img.naturalWidth) process();
      else img.addEventListener('load', process, { once: true });
    }

    cleanCheckerboard(track.querySelector('img[src$="gear/sony-a7iii.png"]'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioPolish);
  } else {
    initPortfolioPolish();
  }
})();
