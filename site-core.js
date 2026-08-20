/* Shared navigation behaviour for every page. */
(function () {
  'use strict';

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
      if (!event.target.closest('a')) return;
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      toggle.textContent = '☰';
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      toggle.textContent = '☰';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNavigation);
  else initNavigation();
})();

/* Portfolio polish + manual Gear rail + cinematic per-card motion. */
(function () {
  'use strict';

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
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018)),rgba(7,12,22,.78);
  border-color:rgba(124,173,215,.16);
  box-shadow:0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.08);
}
.portfolio-page .portfolio-switch::before{opacity:.28;filter:blur(44px)}
.portfolio-page .portfolio-switch-glider{
  top:7px;bottom:7px;left:7px;width:calc(25% - 5.25px);border-radius:16px;
  box-shadow:0 9px 22px -8px rgba(55,125,255,.55),inset 0 1px 0 rgba(255,255,255,.3);
}
.portfolio-page .portfolio-tab{gap:.62rem;min-height:64px;padding:.62rem .72rem;border-radius:16px}
.portfolio-page .portfolio-tab strong{font-size:clamp(.84rem,1.1vw,.98rem);font-weight:700;letter-spacing:-.015em}
.portfolio-page .portfolio-tab-icon{flex:0 0 42px;width:42px;height:42px;border-radius:13px}
.portfolio-page .portfolio-tab-icon svg{width:20px;height:20px}
.portfolio-page .portfolio-play-icon svg{width:17px;height:17px}
.portfolio-page .portfolio-tab:hover .portfolio-tab-icon{transform:translateY(-2px) scale(1.04)}
.portfolio-page .portfolio-tab.is-active .portfolio-tab-icon{transform:scale(1.02)}
.portfolio-page .portfolio-panel-hint{margin-top:1.15rem;padding:.72rem 1rem;border-radius:14px;font-size:.82rem}

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
#gear-panel::before{
  content:'';
  position:absolute;
  inset:-45% -15%;
  pointer-events:none;
  background:
    radial-gradient(circle at 16% 40%,rgba(46,211,255,.14),transparent 27%),
    radial-gradient(circle at 82% 28%,rgba(130,91,255,.16),transparent 30%);
  filter:blur(38px);
  animation:gearPanelAura 9s ease-in-out infinite alternate;
}
@keyframes gearPanelAura{
  from{transform:translate3d(-2%,1%,0) scale(1)}
  to{transform:translate3d(4%,-3%,0) scale(1.08)}
}
#gear-panel .gear-heading{
  position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:1.25rem;margin:0 0 .75rem;
}
#gear-panel .gear-eyebrow{display:block;margin-bottom:.48rem;color:#68dfff;font:700 .64rem/1 'Space Grotesk',sans-serif;letter-spacing:.17em;text-transform:uppercase}
#gear-panel .gear-heading h2{
  margin:0;
  font-family:'Space Grotesk',sans-serif;
  font-size:clamp(2.15rem,4.45vw,3.75rem);
  font-weight:700;
  line-height:.9;
  letter-spacing:-.067em;
  background:linear-gradient(105deg,#ffffff 0%,#eef8ff 36%,#78e8ff 70%,#ab98ff 100%);
  background-size:185% 100%;
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  color:transparent;
  filter:drop-shadow(0 10px 28px rgba(53,153,228,.13));
  animation:gearTitleFlow 5.2s ease-in-out infinite alternate;
}
@keyframes gearTitleFlow{
  from{background-position:0 50%;filter:drop-shadow(0 8px 22px rgba(53,153,228,.1))}
  to{background-position:100% 50%;filter:drop-shadow(0 12px 32px rgba(114,100,255,.2))}
}
#gear-panel .gear-heading p{display:none!important}
#gear-panel .gear-controls{display:flex;gap:.5rem;flex:0 0 auto}
#gear-panel .gear-arrow{
  display:grid;place-items:center;width:40px;height:40px;padding:0;border:1px solid rgba(123,172,215,.18);border-radius:50%;
  background:rgba(255,255,255,.045);color:#d9e7f7;cursor:pointer;
  box-shadow:0 8px 20px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.07);
  transition:transform .22s,background .22s,border-color .22s,color .22s,box-shadow .22s;
}
#gear-panel .gear-arrow:hover{transform:translateY(-3px) scale(1.06);background:rgba(74,176,255,.15);border-color:rgba(99,208,255,.38);color:#fff;box-shadow:0 12px 28px rgba(28,112,190,.22)}
#gear-panel .gear-arrow svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
#gear-panel .gear-stage{position:relative;z-index:3;width:100%;overflow:hidden;perspective:1300px}
#gear-panel .gear-track{
  display:flex;gap:14px;width:100%;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-behavior:smooth;
  scroll-padding-inline:calc((100% - min(78vw,290px))/2);padding:.95rem calc((100% - min(78vw,290px))/2) 1.15rem;
  box-sizing:border-box;scrollbar-width:none;-webkit-overflow-scrolling:touch;
}
#gear-panel .gear-track::-webkit-scrollbar{display:none}

#gear-panel .gear-card{
  --brand:93,211,255;
  --rail-scale:.92;
  --rail-ry:0deg;
  --rail-lift:4px;
  --pointer-rx:0deg;
  --pointer-ry:0deg;
  --shine-x:50%;
  --shine-y:35%;
  --gear-opacity:.68;
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
  opacity:var(--gear-opacity)!important;
  transform:
    perspective(1050px)
    translateY(var(--rail-lift))
    scale(var(--rail-scale))
    rotateX(var(--pointer-rx))
    rotateY(calc(var(--rail-ry) + var(--pointer-ry)))!important;
  transform-style:preserve-3d;
  will-change:transform,opacity,filter;
  transition:transform .34s cubic-bezier(.2,.8,.2,1),opacity .3s,border-color .3s,box-shadow .38s,filter .35s;
}
#gear-panel .gear-card::before{
  content:'';position:absolute;left:12%;right:12%;top:48px;height:205px;z-index:-1;border-radius:50%;
  background:radial-gradient(circle,rgba(var(--brand),.25),rgba(var(--brand),.08) 37%,transparent 70%);
  filter:blur(14px);opacity:.52;transform:scale(.9);
  transition:opacity .35s,transform .45s;
  animation:gearHaloBreath 4.8s ease-in-out infinite alternate;
  animation-delay:calc(var(--gear-index,0) * -.36s);
}
#gear-panel .gear-card::after{
  content:'';position:absolute;inset:0;z-index:9;pointer-events:none;border-radius:inherit;
  background:
    radial-gradient(circle at var(--shine-x) var(--shine-y),rgba(255,255,255,.2),transparent 24%),
    linear-gradient(112deg,transparent 18%,rgba(255,255,255,.09) 34%,transparent 49%);
  background-size:100% 100%,230% 100%;
  background-position:0 0,145% 0;
  opacity:.55;
  mix-blend-mode:screen;
  animation:gearGlassSweep 5.4s ease-in-out infinite;
  animation-delay:calc(var(--gear-index,0) * -.61s);
}
@keyframes gearHaloBreath{from{opacity:.34;transform:scale(.84)}to{opacity:.76;transform:scale(1.08)}}
@keyframes gearGlassSweep{0%,58%{background-position:0 0,145% 0}100%{background-position:0 0,-70% 0}}

#gear-panel .gear-card.is-current{
  --rail-scale:1.035;
  --rail-lift:-10px;
  --gear-opacity:1;
  border-color:rgba(var(--brand),.43);
  box-shadow:0 28px 56px rgba(0,0,0,.45),0 0 36px rgba(var(--brand),.13),0 0 0 1px rgba(var(--brand),.08),inset 0 1px 0 rgba(255,255,255,.09);
  filter:saturate(1.08) brightness(1.025);
}
#gear-panel .gear-card.is-current::before{opacity:.9;transform:scale(1.12)}
#gear-panel .gear-card:hover{border-color:rgba(var(--brand),.48);box-shadow:0 30px 60px rgba(0,0,0,.48),0 0 42px rgba(var(--brand),.14),inset 0 1px 0 rgba(255,255,255,.1)}
#gear-panel .gear-card.gear-kick .gear-product img{animation:gearKick .62s cubic-bezier(.16,.88,.24,1.16)}
@keyframes gearKick{
  0%{transform:translate3d(0,10px,0) scale(.9) rotate(-2deg)}
  58%{transform:translate3d(0,-8px,0) scale(1.075) rotate(1.8deg)}
  100%{transform:translate3d(0,-2px,0) scale(1.02) rotate(0)}
}

#gear-panel .gear-canon{--brand:236,67,77}
#gear-panel .gear-sony{--brand:73,145,255}
#gear-panel .gear-gopro{--brand:35,203,240}
#gear-panel .gear-dji{--brand:161,112,255}
#gear-panel .gear-number{position:absolute;top:.85rem;left:.95rem;z-index:7;color:rgba(var(--brand),.95);font:700 .64rem/1 'Space Grotesk',sans-serif;letter-spacing:.15em;transition:transform .3s,text-shadow .3s}
#gear-panel .gear-card.is-current .gear-number{animation:gearNumberPulse 1.9s ease-in-out infinite alternate}
@keyframes gearNumberPulse{from{transform:translateY(0);text-shadow:0 0 0 rgba(var(--brand),0)}to{transform:translateY(-2px);text-shadow:0 0 16px rgba(var(--brand),.72)}}
#gear-panel .gear-type{position:absolute;top:.72rem;right:.72rem;z-index:7;max-width:65%;padding:.34rem .52rem;border:1px solid rgba(143,176,210,.14);border-radius:999px;background:rgba(4,9,17,.64);color:#a5b5c8;font:700 .49rem/1 'Space Grotesk',sans-serif;letter-spacing:.09em;text-align:center;text-transform:uppercase;backdrop-filter:blur(9px);transition:transform .3s,border-color .3s,background .3s}
#gear-panel .gear-card.is-current .gear-type{transform:translateY(-2px);border-color:rgba(var(--brand),.3);background:rgba(var(--brand),.09)}

#gear-panel .gear-orbit{
  position:absolute;left:50%;top:44%;z-index:1;width:180px;height:180px;border:1px solid rgba(var(--brand),.2);border-radius:50%;
  transform:translate(-50%,-50%) rotateX(68deg) rotateZ(0deg);pointer-events:none;opacity:.35;
  animation:gearOrbitSpin 8.5s linear infinite;animation-delay:calc(var(--gear-index,0) * -.47s);
}
#gear-panel .gear-orbit::before,
#gear-panel .gear-orbit::after{content:'';position:absolute;border-radius:50%;background:rgb(var(--brand));box-shadow:0 0 12px rgba(var(--brand),.95),0 0 28px rgba(var(--brand),.5)}
#gear-panel .gear-orbit::before{width:7px;height:7px;top:7px;left:50%;margin-left:-3px}
#gear-panel .gear-orbit::after{width:4px;height:4px;bottom:13px;left:24%;opacity:.75}
#gear-panel .gear-card.is-current .gear-orbit{opacity:.72;animation-duration:5.2s}
@keyframes gearOrbitSpin{to{transform:translate(-50%,-50%) rotateX(68deg) rotateZ(360deg)}}

#gear-panel .gear-product{position:relative;z-index:4;display:flex;align-items:center;justify-content:center;width:100%;height:242px;margin:0;padding:2.75rem .85rem .25rem;box-sizing:border-box;transform:translateZ(28px)!important}
#gear-panel .gear-product::after{content:'';position:absolute;left:22%;right:22%;bottom:8%;height:9%;z-index:-1;border-radius:50%;background:rgba(0,0,0,.46);filter:blur(13px);transition:transform .4s,opacity .4s}
#gear-panel .gear-card.is-current .gear-product::after{transform:scaleX(1.12);opacity:.72}
#gear-panel .gear-product img{
  display:block!important;position:static!important;inset:auto!important;width:auto!important;height:auto!important;max-width:92%!important;max-height:91%!important;margin:auto!important;
  object-fit:contain!important;border-radius:11px;background:transparent;filter:drop-shadow(0 16px 16px rgba(0,0,0,.34));
  transform:translate3d(var(--img-x,0),var(--img-y,0),0)!important;
  transform-origin:50% 58%;will-change:transform,filter;
  transition:transform .28s cubic-bezier(.2,.8,.2,1),filter .35s!important;
}
#gear-panel .gear-card.is-current .gear-product img{
  filter:drop-shadow(0 22px 23px rgba(0,0,0,.46)) drop-shadow(0 0 17px rgba(var(--brand),.12));
  animation:gearProductFloat 3.3s ease-in-out infinite alternate;
  animation-delay:calc(var(--gear-index,0) * -.31s);
}
@keyframes gearProductFloat{
  from{translate:0 2px;rotate:-.55deg}
  to{translate:0 -7px;rotate:.7deg}
}
#gear-panel .gear-card:hover .gear-product img{filter:drop-shadow(0 24px 24px rgba(0,0,0,.48)) drop-shadow(0 0 20px rgba(var(--brand),.18))}
#gear-panel .gear-eosr .gear-product img{max-width:88%!important;max-height:82%!important;padding:.3rem;background:#f7f8fa;border-radius:14px}
#gear-panel .gear-dji-pocket4 .gear-product img{max-height:94%!important;max-width:76%!important}

#gear-panel .gear-card-copy{position:relative;z-index:6;padding:.82rem 1rem 1.18rem;transform:translateZ(36px)}
#gear-panel .gear-card-copy h3{margin:0;color:#f4f8ff;font:800 1.08rem/1.14 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;transition:text-shadow .35s,transform .35s}
#gear-panel .gear-card.is-current .gear-card-copy h3{transform:translateY(-1px);text-shadow:0 0 22px rgba(var(--brand),.18)}
#gear-panel .gear-now{
  display:inline-flex!important;align-items:center;gap:.34rem!important;width:max-content;margin-top:.56rem!important;padding:.26rem .48rem;border:1px solid rgba(74,222,128,.22);border-radius:999px;background:rgba(34,197,94,.08);color:#86efac!important;font-size:.52rem!important;font-weight:700;letter-spacing:.08em!important;text-transform:uppercase;
}
#gear-panel .gear-now::before{content:'';width:5px;height:5px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 0 rgba(74,222,128,.48);animation:gearNowPulse 1.7s infinite}
@keyframes gearNowPulse{70%{box-shadow:0 0 0 7px rgba(74,222,128,0)}}

#gear-panel .gear-progress{position:relative;width:min(360px,66%);height:3px;margin:.05rem auto 0;overflow:visible;border-radius:999px;background:rgba(112,144,177,.16);box-shadow:0 0 0 1px rgba(255,255,255,.02)}
#gear-panel .gear-progress span{position:absolute;inset:0 auto 0 0;border-radius:inherit;background:linear-gradient(90deg,#42d9ff,#4e8dff,#8b64f0);box-shadow:0 0 14px rgba(75,160,255,.48);transition:transform .38s cubic-bezier(.2,.75,.2,1)}
#gear-panel .gear-progress span::after{content:'';position:absolute;right:-3px;top:50%;width:7px;height:7px;border-radius:50%;background:#91eaff;box-shadow:0 0 15px #54bfff;transform:translateY(-50%);animation:gearProgressDot 1.3s ease-in-out infinite alternate}
@keyframes gearProgressDot{to{transform:translateY(-50%) scale(1.45);filter:brightness(1.25)}}

html[data-theme="light"] #gear-panel{
  background:radial-gradient(circle at 7% -8%,rgba(43,181,230,.12),transparent 31%),radial-gradient(circle at 94% 0%,rgba(116,82,230,.11),transparent 30%),linear-gradient(155deg,#152438 0%,#0d1828 58%,#08111e 100%)!important;
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
  #gear-panel .gear-heading h2{font-size:clamp(2rem,10vw,2.8rem);letter-spacing:-.055em}
  #gear-panel .gear-arrow{width:36px;height:36px}
  #gear-panel .gear-track{scroll-padding-inline:calc((100% - min(82vw,278px))/2);padding-inline:calc((100% - min(82vw,278px))/2)}
  #gear-panel .gear-card{flex-basis:min(82vw,278px);width:min(82vw,278px);max-width:278px;min-height:358px}
  #gear-panel .gear-product{height:226px}
  #gear-panel .gear-orbit{width:164px;height:164px}
}
@media(prefers-reduced-motion:reduce){
  #gear-panel::before,
  #gear-panel .gear-heading h2,
  #gear-panel .gear-card::before,
  #gear-panel .gear-card::after,
  #gear-panel .gear-orbit,
  #gear-panel .gear-product img,
  #gear-panel .gear-number,
  #gear-panel .gear-now::before,
  #gear-panel .gear-progress span::after{animation:none!important}
  #gear-panel .gear-track{scroll-behavior:auto}
  #gear-panel .gear-card,#gear-panel .gear-product img{transition:none!important}
}
`;
      document.head.appendChild(style);
    }

    var panel = document.getElementById('gear-panel');
    if (!panel || panel.getAttribute('data-polished') === 'true') return;
    panel.setAttribute('data-polished', 'true');

    /* Wording reflects experience, not current ownership. */
    var heading = panel.querySelector('.gear-heading h2');
    var intro = panel.querySelector('.gear-heading p');
    if (heading) heading.textContent = "The Gear I’ve Used";
    if (intro) intro.remove();

    var oldTrack = panel.querySelector('.gear-track');
    if (!oldTrack) return;

    /* Clone the rail so older autoplay listeners become detached. */
    var track = oldTrack.cloneNode(true);

    /* The compact cards only need the gear name. Remove generic secondary
       labels such as HANDS-ON EXPERIENCE from every existing card. */
    Array.prototype.slice.call(track.querySelectorAll('.gear-card-copy > span')).forEach(function (sub) {
      sub.remove();
    });

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
      var cardHeading = document.createElement('h3');
      cardHeading.textContent = title;
      copy.appendChild(cardHeading);

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
      card.style.setProperty('--gear-index', String(index));
      var number = card.querySelector('.gear-number');
      if (number) number.textContent = String(index + 1).padStart(2, '0');

      var orbit = document.createElement('span');
      orbit.className = 'gear-orbit';
      orbit.setAttribute('aria-hidden', 'true');
      card.appendChild(orbit);

      var title = card.querySelector('.gear-card-copy h3');
      if (title && title.textContent.trim() === 'DJI Osmo Pocket 3') {
        card.classList.add('gear-currently-using');
        var now = document.createElement('span');
        now.className = 'gear-now';
        now.textContent = 'Current setup';
        card.querySelector('.gear-card-copy').appendChild(now);
      }

      card.classList.toggle('is-current', index === 0);
      card.setAttribute('aria-current', index === 0 ? 'true' : 'false');
    });

    oldTrack.parentNode.replaceChild(track, oldTrack);

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

    var currentIndex = -1;
    function updateProgress(index, kick) {
      if (fill) fill.style.transform = 'translateX(' + (index * 100) + '%)';
      cards.forEach(function (card, cardIndex) {
        var active = cardIndex === index;
        card.classList.toggle('is-current', active);
        card.setAttribute('aria-current', active ? 'true' : 'false');
      });

      if (kick && currentIndex !== index && cards[index] && !reduce) {
        cards[index].classList.remove('gear-kick');
        void cards[index].offsetWidth;
        cards[index].classList.add('gear-kick');
        window.setTimeout(function () { cards[index].classList.remove('gear-kick'); }, 680);
      }
      currentIndex = index;
    }

    function syncDepth() {
      if (reduce) return;
      var trackRect = track.getBoundingClientRect();
      var trackCentre = trackRect.left + trackRect.width / 2;
      var half = Math.max(trackRect.width * .58, 1);

      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var cardCentre = rect.left + rect.width / 2;
        var offset = (cardCentre - trackCentre) / half;
        offset = Math.max(-1.15, Math.min(1.15, offset));
        var proximity = Math.max(0, 1 - Math.abs(offset));
        var scale = .91 + proximity * .09;
        var lift = 7 - proximity * 11;
        var ry = -offset * 13;
        var opacity = .56 + proximity * .44;
        card.style.setProperty('--rail-scale', scale.toFixed(3));
        card.style.setProperty('--rail-lift', lift.toFixed(2) + 'px');
        card.style.setProperty('--rail-ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--gear-opacity', opacity.toFixed(3));
      });
    }

    var depthFrame = 0;
    function requestDepth() {
      if (depthFrame || reduce) return;
      depthFrame = requestAnimationFrame(function () {
        depthFrame = 0;
        syncDepth();
      });
    }

    function go(index) {
      if (!cards.length) return;
      if (index < 0) index = cards.length - 1;
      if (index >= cards.length) index = 0;
      var card = cards[index];
      var left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
      updateProgress(index, true);
      requestDepth();
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
      requestDepth();
      window.clearTimeout(scrollTick);
      scrollTick = window.setTimeout(function () {
        updateProgress(nearestIndex(), true);
        requestDepth();
      }, 75);
    }, { passive: true });

    window.addEventListener('resize', requestDepth, { passive: true });

    /* Pointer-driven 3D tilt, light hotspot and image parallax on every card. */
    if (!reduce) {
      cards.forEach(function (card) {
        var moveFrame = 0;
        card.addEventListener('pointermove', function (event) {
          if (window.innerWidth < 761 || moveFrame) return;
          moveFrame = requestAnimationFrame(function () {
            moveFrame = 0;
            var rect = card.getBoundingClientRect();
            var px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            var py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
            card.style.setProperty('--pointer-rx', ((.5 - py) * 8).toFixed(2) + 'deg');
            card.style.setProperty('--pointer-ry', ((px - .5) * 10).toFixed(2) + 'deg');
            card.style.setProperty('--shine-x', (px * 100).toFixed(1) + '%');
            card.style.setProperty('--shine-y', (py * 100).toFixed(1) + '%');
            var image = card.querySelector('.gear-product img');
            if (image) {
              image.style.setProperty('--img-x', ((px - .5) * 10).toFixed(1) + 'px');
              image.style.setProperty('--img-y', ((py - .5) * 7).toFixed(1) + 'px');
            }
          });
        }, { passive: true });

        card.addEventListener('pointerleave', function () {
          card.style.setProperty('--pointer-rx', '0deg');
          card.style.setProperty('--pointer-ry', '0deg');
          card.style.setProperty('--shine-x', '50%');
          card.style.setProperty('--shine-y', '35%');
          var image = card.querySelector('.gear-product img');
          if (image) {
            image.style.setProperty('--img-x', '0px');
            image.style.setProperty('--img-y', '0px');
          }
        });
      });
    }

    updateProgress(0, false);
    requestAnimationFrame(syncDepth);

    /* The old Sony PNG has a checkerboard baked into it. Remove only the
       bright neutral background connected to image edges. */
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPortfolioPolish);
  else initPortfolioPolish();
})();
