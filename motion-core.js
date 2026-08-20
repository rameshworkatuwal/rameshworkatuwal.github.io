/* ============================================================
   RITESH KATUWAL — MOTION V4 PERFORMANCE
   Smooth site-wide motion without pointer-follow spotlights, blur-heavy
   reveals, per-card mouse tracking or continuous parallax loops.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function qsa(selector, scope) {
    try { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
    catch (e) { return []; }
  }

  function injectStyles() {
    if (document.getElementById('rk-motion-v4-style')) return;
    var style = document.createElement('style');
    style.id = 'rk-motion-v4-style';
    style.textContent = `
:root{
  --rk-spring:cubic-bezier(.16,1,.3,1);
  --rk-soft:cubic-bezier(.22,.74,.22,1);
  --rk-cyan:#42d9ff;
  --rk-blue:#338dff;
  --rk-violet:#8a72ff;
}
html.rk-motion-v4{scroll-behavior:smooth}

/* Navigation: keep the glass look, remove the expensive animated layer. */
nav.rk-motion-nav{
  transition:padding .42s var(--rk-spring),background .35s ease,border-color .35s ease,box-shadow .35s ease!important;
}
nav.rk-motion-nav.rk-nav-condensed{
  padding-top:.66rem!important;
  padding-bottom:.66rem!important;
  background:rgba(5,7,13,.82)!important;
  border-bottom-color:rgba(120,180,220,.16)!important;
  box-shadow:0 10px 28px rgba(3,9,20,.13)!important;
  backdrop-filter:blur(14px) saturate(1.08)!important;
  -webkit-backdrop-filter:blur(14px) saturate(1.08)!important;
}
html[data-theme="light"] nav.rk-motion-nav.rk-nav-condensed{
  background:rgba(249,251,254,.94)!important;
  border-bottom-color:rgba(80,130,175,.14)!important;
  box-shadow:0 10px 28px rgba(40,72,110,.07)!important;
}

/* One cheap progress bar. */
.rk-scroll-progress{
  position:fixed;top:0;left:0;z-index:10000;width:100%;height:2px;pointer-events:none;
  transform-origin:0 50%;transform:scaleX(0);
  background:linear-gradient(90deg,var(--rk-cyan),var(--rk-blue) 48%,var(--rk-violet));
  box-shadow:0 0 10px rgba(67,202,255,.28);
  will-change:transform;
}

/* Entry motion: transform + opacity only. No blur filters. */
.rk-page-heading{
  opacity:0;
  transform:translate3d(0,24px,0) scale(.985);
  transition:opacity .62s .04s ease,transform .78s .04s var(--rk-spring);
}
html.rk-ready .rk-page-heading{opacity:1;transform:none}
.rk-reveal{
  --rk-delay:0ms;
  opacity:0;
  transform:translate3d(0,22px,0);
  transition:opacity .56s var(--rk-delay) ease,transform .7s var(--rk-delay) var(--rk-spring);
}
.rk-reveal.rk-in{opacity:1;transform:none}
.rk-section-heading{
  transition:transform .55s var(--rk-spring),opacity .5s ease;
}

/* Cards: no per-card JS tracking by default. GPU-friendly hover only. */
.rk-motion-card{
  position:relative!important;
  transform:translateZ(0);
  backface-visibility:hidden;
  transition:transform .42s var(--rk-spring),box-shadow .38s ease,border-color .32s ease!important;
}
.rk-motion-card img:not(.camera-meta img),.rk-motion-card video{
  transition:transform .55s var(--rk-spring)!important;
}
@media(hover:hover) and (pointer:fine){
  .rk-motion-card:hover{transform:translate3d(0,-5px,0)!important}
  .rk-motion-card:hover img:not(.camera-meta img),.rk-motion-card:hover video{transform:scale(1.018)}
}

/* ============================================================
   SKILLS PAGE — premium color + dimensional motion
   Six cards only, so pointer work is RAF-throttled and active on hover devices.
   ============================================================ */
.skills-grid{
  position:relative!important;
  isolation:isolate;
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:clamp(1rem,1.6vw,1.35rem)!important;
  margin-bottom:3.4rem!important;
  perspective:1200px;
}
.skills-grid::before{
  content:'';position:absolute;z-index:-1;inset:-3rem -2rem;pointer-events:none;
  background:
    radial-gradient(circle at 12% 18%,rgba(51,195,255,.13),transparent 27%),
    radial-gradient(circle at 82% 26%,rgba(141,105,255,.12),transparent 29%),
    radial-gradient(circle at 48% 88%,rgba(255,101,155,.08),transparent 28%);
}
.skills-grid .skill-card.rk-skill-premium{
  --skill-a:57,207,255;
  --skill-b:73,122,255;
  --skill-x:50%;
  --skill-y:50%;
  --skill-rx:0deg;
  --skill-ry:0deg;
  position:relative!important;
  isolation:isolate;
  overflow:hidden;
  min-height:270px;
  padding:1.65rem!important;
  border-radius:24px!important;
  border:1px solid rgba(var(--skill-a),.24)!important;
  background:
    radial-gradient(420px circle at var(--skill-x) var(--skill-y),rgba(var(--skill-a),.13),transparent 48%),
    linear-gradient(145deg,rgba(255,255,255,.072),rgba(255,255,255,.022) 48%,rgba(var(--skill-b),.055))!important;
  box-shadow:0 18px 46px rgba(4,13,27,.17),inset 0 1px 0 rgba(255,255,255,.10)!important;
  transform-style:preserve-3d;
  backface-visibility:hidden;
  transition:transform .46s var(--rk-spring),box-shadow .42s ease,border-color .35s ease,opacity .32s ease!important;
  will-change:transform;
}
.skills-grid .skill-card.rk-skill-premium:nth-child(2){--skill-a:138,107,255;--skill-b:255,95,190}
.skills-grid .skill-card.rk-skill-premium:nth-child(3){--skill-a:55,217,166;--skill-b:48,170,255}
.skills-grid .skill-card.rk-skill-premium:nth-child(4){--skill-a:255,159,72;--skill-b:104,122,255}
.skills-grid .skill-card.rk-skill-premium:nth-child(5){--skill-a:255,83,139;--skill-b:152,97,255}
.skills-grid .skill-card.rk-skill-premium:nth-child(6){--skill-a:255,196,75;--skill-b:255,103,125}
.skills-grid .skill-card.rk-skill-premium::before{
  content:'';position:absolute;z-index:-2;left:-45%;top:-72%;width:190%;aspect-ratio:1;border-radius:50%;pointer-events:none;
  background:conic-gradient(from 0deg,transparent 0 18%,rgba(var(--skill-a),.16) 28%,transparent 40% 66%,rgba(var(--skill-b),.13) 76%,transparent 88%);
  opacity:.65;
  animation:rkSkillAuraSpin 16s linear infinite;
  transform:translateZ(0);
}
.skills-grid .skill-card.rk-skill-premium:nth-child(even)::before{animation-direction:reverse;animation-duration:19s}
@keyframes rkSkillAuraSpin{to{transform:rotate(360deg)}}
.skills-grid .skill-card.rk-skill-premium::after{
  content:'';position:absolute;z-index:-1;inset:0;pointer-events:none;border-radius:inherit;
  background:radial-gradient(260px circle at var(--skill-x) var(--skill-y),rgba(255,255,255,.17),transparent 58%);
  opacity:0;transition:opacity .34s ease;
}
.skills-grid .skill-card.rk-skill-premium .skill-icon{
  position:relative;z-index:2;
  width:58px!important;height:58px!important;border-radius:18px!important;
  display:grid!important;place-items:center;
  margin-bottom:1.28rem!important;
  color:rgb(var(--skill-a));
  background:linear-gradient(145deg,rgba(var(--skill-a),.17),rgba(var(--skill-b),.085))!important;
  border:1px solid rgba(var(--skill-a),.25)!important;
  box-shadow:0 12px 28px rgba(var(--skill-a),.11),inset 0 1px 0 rgba(255,255,255,.14);
  transform:translateZ(30px);
  animation:rkSkillIconFloat 4.8s ease-in-out infinite;
  animation-delay:calc(var(--skill-index,0) * -620ms);
  transition:transform .5s var(--rk-spring),box-shadow .4s ease,background .4s ease!important;
}
.skills-grid .skill-card.rk-skill-premium .skill-icon::before{
  content:'';position:absolute;inset:-7px;border-radius:23px;border:1px solid rgba(var(--skill-a),.18);
  transform:rotate(-7deg) scale(.9);opacity:.55;
  transition:transform .55s var(--rk-spring),opacity .4s ease;
}
.skills-grid .skill-card.rk-skill-premium .skill-icon svg{
  width:26px!important;height:26px!important;stroke:rgb(var(--skill-a))!important;
  filter:drop-shadow(0 3px 9px rgba(var(--skill-a),.24));
  transition:transform .52s var(--rk-spring),filter .35s ease!important;
}
@keyframes rkSkillIconFloat{0%,100%{transform:translate3d(0,0,30px) rotate(-1deg)}50%{transform:translate3d(0,-6px,30px) rotate(2deg)}}
.skills-grid .skill-card.rk-skill-premium h3{
  position:relative;z-index:2;
  margin-bottom:.9rem!important;
  font-family:'Bricolage Grotesque',sans-serif!important;
  font-size:clamp(1.03rem,1.25vw,1.22rem)!important;
  line-height:1.14!important;
  letter-spacing:-.025em!important;
  color:var(--text)!important;
  transform:translateZ(22px);
  transition:transform .45s var(--rk-spring),color .35s ease!important;
}
.skills-grid .skill-card.rk-skill-premium .skill-tags{
  position:relative;z-index:2;display:flex!important;flex-wrap:wrap;gap:.48rem!important;transform:translateZ(14px);
}
.skills-grid .skill-card.rk-skill-premium .tag{
  border:1px solid rgba(var(--skill-a),.17)!important;
  border-radius:999px!important;
  padding:.38rem .68rem!important;
  background:linear-gradient(135deg,rgba(var(--skill-a),.075),rgba(var(--skill-b),.035))!important;
  color:var(--muted)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.055);
  transition:transform .42s var(--rk-spring),background .35s ease,border-color .35s ease,color .35s ease,box-shadow .35s ease!important;
}
.skills-grid .skill-card.rk-skill-premium .tag:nth-child(1){transition-delay:0ms!important}
.skills-grid .skill-card.rk-skill-premium .tag:nth-child(2){transition-delay:28ms!important}
.skills-grid .skill-card.rk-skill-premium .tag:nth-child(3){transition-delay:56ms!important}
.skills-grid .skill-card.rk-skill-premium .tag:nth-child(4){transition-delay:84ms!important}
.skills-grid .skill-card.rk-skill-premium .tag:nth-child(5){transition-delay:112ms!important}
.page:has(.skills-grid) > .page-title{
  font-size:clamp(2.2rem,4vw,3.45rem)!important;
  letter-spacing:-.045em!important;
  background:linear-gradient(100deg,var(--text) 4%,#32cfff 48%,#7f73ff 76%,var(--text) 104%);
  background-size:180% auto;
  -webkit-background-clip:text;background-clip:text;color:transparent!important;
  animation:rkSkillTitleFlow 8s linear infinite;
}
.page:has(.skills-grid) > .divider-line{
  width:92px!important;height:3px!important;
  background:linear-gradient(90deg,#38d9ff,#4b8dff 55%,#916fff)!important;
  box-shadow:0 0 18px rgba(72,163,255,.24);
  transform-origin:left center;
}
@keyframes rkSkillTitleFlow{to{background-position:180% center}}
@media(hover:hover) and (pointer:fine){
  .skills-grid .skill-card.rk-skill-premium:hover{
    transform:perspective(950px) translate3d(0,-10px,0) rotateX(var(--skill-rx)) rotateY(var(--skill-ry)) scale(1.014)!important;
    border-color:rgba(var(--skill-a),.48)!important;
    box-shadow:0 30px 72px rgba(5,18,38,.23),0 0 34px rgba(var(--skill-a),.09),inset 0 1px 0 rgba(255,255,255,.16)!important;
    z-index:5;
  }
  .skills-grid .skill-card.rk-skill-premium:hover::after{opacity:1}
  .skills-grid .skill-card.rk-skill-premium:hover .skill-icon{
    animation-play-state:paused;
    transform:translate3d(0,-5px,40px) rotateY(8deg) rotateX(-5deg) scale(1.07);
    background:linear-gradient(145deg,rgba(var(--skill-a),.24),rgba(var(--skill-b),.13))!important;
    box-shadow:0 20px 38px rgba(var(--skill-a),.18),inset 0 1px 0 rgba(255,255,255,.18);
  }
  .skills-grid .skill-card.rk-skill-premium:hover .skill-icon::before{opacity:.95;transform:rotate(8deg) scale(1.02)}
  .skills-grid .skill-card.rk-skill-premium:hover .skill-icon svg{transform:scale(1.10) rotate(-4deg);filter:drop-shadow(0 6px 14px rgba(var(--skill-a),.34))}
  .skills-grid .skill-card.rk-skill-premium:hover h3{transform:translate3d(3px,-2px,28px);color:rgb(var(--skill-a))!important}
  .skills-grid .skill-card.rk-skill-premium:hover .tag{
    transform:translate3d(0,-3px,0);
    color:var(--text)!important;
    border-color:rgba(var(--skill-a),.31)!important;
    background:linear-gradient(135deg,rgba(var(--skill-a),.14),rgba(var(--skill-b),.07))!important;
    box-shadow:0 7px 16px rgba(var(--skill-a),.06),inset 0 1px 0 rgba(255,255,255,.08);
  }
  .skills-grid.rk-skills-hovering .skill-card.rk-skill-premium:not(.rk-skill-active){opacity:.72;transform:translate3d(0,2px,0) scale(.988)!important}
}
html[data-theme="light"] .skills-grid .skill-card.rk-skill-premium{
  background:
    radial-gradient(420px circle at var(--skill-x) var(--skill-y),rgba(var(--skill-a),.13),transparent 49%),
    linear-gradient(145deg,#fff 0%,rgba(var(--skill-a),.055) 58%,rgba(var(--skill-b),.075) 130%)!important;
  border-color:rgba(var(--skill-a),.23)!important;
  box-shadow:0 18px 42px rgba(55,87,122,.10),0 2px 10px rgba(55,87,122,.035),inset 0 1px 0 #fff!important;
}
html[data-theme="light"] .skills-grid .skill-card.rk-skill-premium::before{opacity:.44}
html[data-theme="light"] .skills-grid .skill-card.rk-skill-premium .skill-icon{
  background:linear-gradient(145deg,rgba(var(--skill-a),.17),rgba(var(--skill-b),.08))!important;
  box-shadow:0 12px 26px rgba(var(--skill-a),.12),inset 0 1px 0 rgba(255,255,255,.9);
}
html[data-theme="light"] .skills-grid .skill-card.rk-skill-premium h3{color:#102234!important}
html[data-theme="light"] .skills-grid .skill-card.rk-skill-premium .tag{color:#60778f!important;background:linear-gradient(135deg,rgba(var(--skill-a),.07),rgba(var(--skill-b),.035))!important}
html[data-theme="light"] .skills-grid .skill-card.rk-skill-premium:hover h3{color:rgb(var(--skill-a))!important}
html[data-theme="light"] .skills-grid .skill-card.rk-skill-premium:hover .tag{color:#17334c!important}
@media(max-width:1050px){.skills-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:620px){
  .skills-grid{grid-template-columns:1fr!important;gap:.9rem!important}
  .skills-grid .skill-card.rk-skill-premium{min-height:0;padding:1.3rem!important;border-radius:20px!important}
  .skills-grid .skill-card.rk-skill-premium .skill-icon{width:52px!important;height:52px!important;border-radius:16px!important}
}

/* ============================================================
   ALL TOOLS & SOFTWARE — keep the existing logos, upgrade the presentation.
   Motion is intentionally transform/opacity-based so it looks rich without
   bringing back the portfolio-page lag problems.
   ============================================================ */
.rk-tools-shell{
  position:relative!important;isolation:isolate;overflow:hidden!important;
  padding:clamp(1.25rem,2.2vw,2rem)!important;border-radius:30px!important;
  border:1px solid rgba(92,176,232,.20)!important;
  background:
    radial-gradient(circle at 8% 0%,rgba(55,214,255,.10),transparent 28%),
    radial-gradient(circle at 95% 16%,rgba(135,104,255,.10),transparent 31%),
    linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018))!important;
  box-shadow:0 24px 68px rgba(4,15,30,.12),inset 0 1px 0 rgba(255,255,255,.07)!important;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
}
.rk-tools-shell::before{
  content:'';position:absolute;z-index:-2;inset:-45% -10%;pointer-events:none;
  background:conic-gradient(from 0deg at 50% 50%,transparent 0 18%,rgba(55,215,255,.12) 28%,transparent 41% 62%,rgba(142,107,255,.11) 72%,transparent 86%);
  animation:rkToolsAura 18s linear infinite;
  transform:translateZ(0);
}
.rk-tools-shell::after{
  content:'';position:absolute;z-index:-1;inset:0;pointer-events:none;border-radius:inherit;
  background:linear-gradient(118deg,transparent 6%,rgba(255,255,255,.035) 28%,transparent 48%,rgba(82,211,255,.035) 68%,transparent 92%);
  background-size:220% 100%;animation:rkToolsShellSweep 9s linear infinite;
}
@keyframes rkToolsAura{to{transform:rotate(360deg)}}
@keyframes rkToolsShellSweep{to{background-position:220% 0}}
.rk-tools-shell .tools-section{position:relative;z-index:2}
.rk-tools-shell .tools-section>h3{
  margin:0 0 1.25rem!important;font:800 clamp(.86rem,1.2vw,1.05rem)/1 'Space Grotesk',sans-serif!important;
  letter-spacing:.08em!important;text-transform:uppercase!important;
  background:linear-gradient(90deg,#27d7ff,#448dff 48%,#8a72ff 86%);background-size:180% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent!important;
  animation:rkToolsTitle 7s linear infinite;
}
@keyframes rkToolsTitle{to{background-position:180% 0}}
.rk-tools-shell .tools-grid2{
  display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:clamp(.72rem,1.15vw,1rem)!important;margin-top:0!important;perspective:1100px;
}
.rk-tools-shell .lp.rk-tool-card{
  --tool-a:66,207,255;--tool-x:50%;--tool-y:50%;--tool-rx:0deg;--tool-ry:0deg;
  position:relative!important;isolation:isolate;overflow:hidden;
  display:flex!important;align-items:center!important;gap:.78rem!important;min-width:0!important;min-height:82px;
  padding:.72rem .9rem .72rem .72rem!important;border-radius:22px!important;
  border:1px solid rgba(var(--tool-a),.20)!important;
  background:
    radial-gradient(220px circle at var(--tool-x) var(--tool-y),rgba(var(--tool-a),.115),transparent 57%),
    linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025) 58%,rgba(var(--tool-a),.045))!important;
  color:var(--text)!important;font-family:'Plus Jakarta Sans',sans-serif!important;font-size:.80rem!important;font-weight:650!important;
  box-shadow:0 12px 30px rgba(4,15,30,.11),inset 0 1px 0 rgba(255,255,255,.08)!important;
  transform-style:preserve-3d;backface-visibility:hidden;will-change:transform;
  transform:perspective(900px) translate3d(0,var(--tool-float,0px),0) rotateX(var(--tool-rx)) rotateY(var(--tool-ry));
  transition:transform .42s var(--rk-spring),border-color .32s ease,box-shadow .38s ease,background .32s ease,opacity .3s ease!important;
  animation:rkToolDrift 6.4s ease-in-out infinite;
  animation-delay:calc(var(--tool-index,0) * -430ms);
}
.rk-tools-shell .lp.rk-tool-card::before{
  content:'';position:absolute;z-index:-1;inset:-1px;padding:1px;border-radius:inherit;pointer-events:none;
  background:linear-gradient(120deg,transparent 5%,rgba(var(--tool-a),.85) 24%,transparent 41%,rgba(255,255,255,.24) 56%,transparent 74%,rgba(var(--tool-a),.58) 91%);
  background-size:240% 100%;opacity:.33;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
  animation:rkToolEdge 5.6s linear infinite;
}
.rk-tools-shell .lp.rk-tool-card::after{
  content:'';position:absolute;top:-34%;bottom:-34%;left:-50%;width:30%;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.26),rgba(255,255,255,.08),transparent);
  transform:skewX(-18deg);opacity:0;
}
@keyframes rkToolDrift{0%,100%{--tool-float:0px}50%{--tool-float:-3px}}
@keyframes rkToolEdge{to{background-position:240% 0}}
.rk-tools-shell .lp.rk-tool-card .lp-i{
  position:relative!important;z-index:3;display:grid!important;place-items:center!important;flex:0 0 auto!important;
  width:46px!important;height:46px!important;border-radius:15px!important;
  box-shadow:0 10px 24px rgba(6,20,39,.14),0 0 0 1px rgba(255,255,255,.05) inset!important;
  transform:translateZ(28px) rotateY(-5deg) rotateX(3deg);
  transition:transform .48s var(--rk-spring),box-shadow .38s ease,filter .35s ease!important;
  animation:rkToolIconFloat 4.8s ease-in-out infinite;
  animation-delay:calc(var(--tool-index,0) * -310ms);
}
.rk-tools-shell .lp.rk-tool-card .lp-i::after{
  content:'';position:absolute;inset:-6px;border:1px solid rgba(var(--tool-a),.18);border-radius:20px;pointer-events:none;
  opacity:.6;transform:rotate(-6deg) scale(.92);transition:transform .48s var(--rk-spring),opacity .35s ease;
}
.rk-tools-shell .lp.rk-tool-card .lp-i svg{width:23px!important;height:23px!important}
@keyframes rkToolIconFloat{0%,100%{transform:translate3d(0,0,28px) rotateY(-5deg) rotateX(3deg)}50%{transform:translate3d(0,-4px,28px) rotateY(4deg) rotateX(-2deg)}}
.rk-tools-shell.rk-tools-hovering .lp.rk-tool-card:not(.rk-tool-active){opacity:.58!important;transform:perspective(900px) translate3d(0,2px,0) scale(.985)!important}

@media(hover:hover) and (pointer:fine){
  .rk-tools-shell .lp.rk-tool-card:hover{
    animation-play-state:paused;
    transform:perspective(900px) translate3d(0,-8px,0) rotateX(var(--tool-rx)) rotateY(var(--tool-ry)) scale(1.018)!important;
    border-color:rgba(var(--tool-a),.48)!important;
    box-shadow:0 24px 52px rgba(4,16,34,.19),0 0 26px rgba(var(--tool-a),.09),inset 0 1px 0 rgba(255,255,255,.13)!important;
    z-index:8;
  }
  .rk-tools-shell .lp.rk-tool-card:hover::before{opacity:.9}
  .rk-tools-shell .lp.rk-tool-card:hover::after{animation:rkToolSheen .78s var(--rk-spring)}
  .rk-tools-shell .lp.rk-tool-card:hover .lp-i{
    animation-play-state:paused;
    transform:translate3d(0,-3px,38px) rotateY(10deg) rotateX(-7deg) scale(1.08);
    box-shadow:0 18px 34px rgba(6,20,39,.18),0 0 0 7px rgba(var(--tool-a),.055)!important;
    filter:saturate(1.1) contrast(1.03);
  }
  .rk-tools-shell .lp.rk-tool-card:hover .lp-i::after{opacity:1;transform:rotate(7deg) scale(1.02)}
}
@keyframes rkToolSheen{0%{left:-50%;opacity:0}18%{opacity:.68}100%{left:125%;opacity:0}}

html[data-theme="light"] .rk-tools-shell{
  background:radial-gradient(circle at 8% 0%,rgba(55,214,255,.09),transparent 28%),radial-gradient(circle at 95% 16%,rgba(135,104,255,.08),transparent 31%),linear-gradient(145deg,#fff,rgba(247,251,255,.95))!important;
  border-color:rgba(74,151,207,.18)!important;box-shadow:0 24px 68px rgba(48,81,118,.08),inset 0 1px 0 #fff!important;
}
html[data-theme="light"] .rk-tools-shell .lp.rk-tool-card{
  background:radial-gradient(220px circle at var(--tool-x) var(--tool-y),rgba(var(--tool-a),.09),transparent 58%),linear-gradient(145deg,#fff,#f9fbff 64%,rgba(var(--tool-a),.035))!important;
  color:#14283b!important;border-color:rgba(var(--tool-a),.20)!important;
  box-shadow:0 12px 28px rgba(44,75,111,.08),inset 0 1px 0 #fff!important;
}
html[data-theme="light"] .rk-tools-shell .lp.rk-tool-card .lp-i{box-shadow:0 10px 22px rgba(42,71,105,.11),0 0 0 1px rgba(255,255,255,.7) inset!important}
@media(max-width:1150px){.rk-tools-shell .tools-grid2{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:820px){.rk-tools-shell .tools-grid2{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:520px){.rk-tools-shell{padding:1rem!important;border-radius:22px!important}.rk-tools-shell .tools-grid2{grid-template-columns:1fr!important}.rk-tools-shell .lp.rk-tool-card{min-height:72px}}

/* Buttons: retain a tiny lift but remove magnetic pointer tracking. */
.rk-magnet{
  transition:transform .34s var(--rk-spring),box-shadow .34s ease!important;
}
@media(hover:hover) and (pointer:fine){.rk-magnet:hover{transform:translate3d(0,-2px,0) scale(1.015)}}

/* Portfolio panel switch. */
.portfolio-panel.rk-panel-enter:not([hidden]){animation:rkPanelEnter .48s var(--rk-spring) both}
@keyframes rkPanelEnter{
  from{opacity:0;transform:translate3d(0,16px,0)}
  to{opacity:1;transform:none}
}

/* Photography must stay especially cheap: no inherited 3D card transforms. */
.portfolio-page #photography-panel .album-folder.rk-motion-card,
.portfolio-page #photography-panel .gal-item.rk-motion-card{
  transform:translateZ(0)!important;
}
@media(hover:hover) and (pointer:fine){
  .portfolio-page #photography-panel .album-folder.rk-motion-card:hover{transform:translate3d(0,-4px,0)!important}
}

/* Quiet page leave. */
body.rk-page-leave{opacity:.88;transition:opacity .16s ease}

@media(max-width:760px){
  .rk-reveal{transform:translate3d(0,14px,0)}
  nav.rk-motion-nav.rk-nav-condensed{backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}
}
@media(prefers-reduced-motion:reduce){
  html.rk-motion-v4{scroll-behavior:auto}
  .rk-scroll-progress{display:none!important}
  .rk-page-heading,.rk-reveal,.rk-motion-card,.rk-magnet,.portfolio-panel.rk-panel-enter:not([hidden]){
    animation:none!important;transition:none!important;opacity:1!important;transform:none!important
  }
  .skills-grid .skill-card.rk-skill-premium::before,.skills-grid .skill-card.rk-skill-premium .skill-icon,.page:has(.skills-grid) > .page-title{animation:none!important}
  .skills-grid .skill-card.rk-skill-premium,.skills-grid .skill-card.rk-skill-premium .skill-icon{transform:none!important}
  .rk-tools-shell::before,.rk-tools-shell::after,.rk-tools-shell .lp.rk-tool-card,.rk-tools-shell .lp.rk-tool-card::before,.rk-tools-shell .lp.rk-tool-card .lp-i,.rk-tools-shell .tools-section>h3{animation:none!important}
  .rk-tools-shell .lp.rk-tool-card,.rk-tools-shell .lp.rk-tool-card .lp-i{transform:none!important;transition:none!important}
}
`;
    document.head.appendChild(style);
  }

  function classifyHeadings() {
    var pageHeading = document.querySelector('.hero-name,.page-title,.portfolio-title,.portfolio-heading-row h1,.about-hero h1,.skills-hero h1,.experience-hero h1,.youtube-title,.blog-title,main h1');
    if (pageHeading) pageHeading.classList.add('rk-page-heading');
    qsa('.sec-title,.section-title,.panel-intro h2,.gear-heading h2,.gal-set-head h3,.cta-strip h2,.cta-section h2,.about-section h2,.skills-section h2,main section > h2').forEach(function (h) {
      h.classList.add('rk-section-heading');
    });
  }

  function classifyCards() {
    var selector = [
      '.card','.skill-card','.exp-card','.experience-card','.timeline-item','.blog-card','.youtube-card','.yt-card',
      '.project-card','.portfolio-card','.portfolio-tab','.portfolio-switch','.album-folder','.gear-card','.reel-card','.tiktok-card',
      '.about-card','.stat-card','.cert-card','.contact-card','.work-card'
    ].join(',');
    qsa(selector).forEach(function (card) {
      if (card.closest('.lb,.tiktok-modal,.reel-modal')) return;
      card.classList.add('rk-motion-card');
    });
  }

  function setupReveals() {
    var selector = [
      '[data-anim]','.reveal','.reveal-stagger','.rk-section-heading',
      '.card','.skill-card','.exp-card','.experience-card','.timeline-item','.blog-card','.youtube-card','.yt-card',
      '.project-card','.album-folder','.gear-card','.about-card','.stat-card','.cert-card','.contact-card',
      '.cta-strip','.cta-section','.contact-cta'
    ].join(',');
    var seen = [];
    qsa(selector).forEach(function (el) {
      if (seen.indexOf(el) !== -1 || el.classList.contains('rk-page-heading') || el.closest('.lb,.tiktok-modal,.reel-modal')) return;
      seen.push(el);
      el.classList.add('rk-reveal');
      var parent = el.parentElement;
      if (parent) {
        var idx = Array.prototype.indexOf.call(parent.children, el);
        el.style.setProperty('--rk-delay', Math.min(Math.max(idx, 0), 5) * 42 + 'ms');
      }
    });

    if (reduce || !('IntersectionObserver' in window)) {
      seen.forEach(function (el) { el.classList.add('rk-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('rk-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -3% 0px' });
    seen.forEach(function (el) { io.observe(el); });
  }

  function setupPortfolioPanelMotion() {
    var panels = qsa('.portfolio-panel');
    if (!panels.length) return;
    function animateActive() {
      panels.forEach(function (panel) {
        if (panel.hidden || !panel.classList.contains('is-active')) return;
        panel.classList.remove('rk-panel-enter');
        void panel.offsetWidth;
        panel.classList.add('rk-panel-enter');
      });
    }
    qsa('.portfolio-tab').forEach(function (tab) { tab.addEventListener('click', animateActive); });
  }

  function setupButtons() {
    qsa('a.btn,button:not(.nav-toggle):not(.lb-nav):not(.lb-x),[data-magnet],[data-magnetic]').forEach(function (button) {
      if (button.closest('.lb,.tiktok-modal,.reel-modal')) return;
      button.classList.add('rk-magnet');
    });
  }

  function setupSkillsShowcase() {
    var grid = document.querySelector('.skills-grid');
    if (!grid) return;
    var cards = qsa('.skill-card', grid);
    if (!cards.length) return;

    cards.forEach(function (card, index) {
      card.classList.add('rk-skill-premium');
      card.style.setProperty('--skill-index', index);
    });

    if (reduce) return;
    var canHover = false;
    try { canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) {}
    if (!canHover) return;

    cards.forEach(function (card) {
      var frame = 0;
      var px = .5, py = .5;

      function paint() {
        frame = 0;
        var x = Math.max(0, Math.min(1, px));
        var y = Math.max(0, Math.min(1, py));
        card.style.setProperty('--skill-x', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--skill-y', (y * 100).toFixed(1) + '%');
        card.style.setProperty('--skill-ry', ((x - .5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--skill-rx', ((.5 - y) * 6).toFixed(2) + 'deg');
      }

      card.addEventListener('pointerenter', function () {
        card.classList.add('rk-skill-active');
        grid.classList.add('rk-skills-hovering');
      }, { passive:true });

      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        px = (event.clientX - rect.left) / rect.width;
        py = (event.clientY - rect.top) / rect.height;
        if (!frame) frame = requestAnimationFrame(paint);
      }, { passive:true });

      card.addEventListener('pointerleave', function () {
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        card.classList.remove('rk-skill-active');
        grid.classList.remove('rk-skills-hovering');
        card.style.setProperty('--skill-x','50%');
        card.style.setProperty('--skill-y','50%');
        card.style.setProperty('--skill-rx','0deg');
        card.style.setProperty('--skill-ry','0deg');
      }, { passive:true });
    });
  }

  function setupToolsShowcase() {
    var tools = document.querySelector('.tools-grid2');
    if (!tools) return;
    var shell = tools.closest('.tools-section');
    if (!shell) return;
    var wrapper = shell.parentElement;
    if (wrapper) wrapper.classList.add('rk-tools-shell');

    var colors = [
      '153,69,255','43,43,52','0,196,204','242,78,30','200,16,46','22,105,183','28,122,72',
      '43,87,154','52,168,83','227,116,0','227,79,38','255,58,120','4,103,223','255,0,0'
    ];
    var cards = qsa('.lp', tools);
    cards.forEach(function (card, index) {
      card.classList.add('rk-tool-card');
      card.style.setProperty('--tool-index', index);
      card.style.setProperty('--tool-a', colors[index % colors.length]);
    });

    if (reduce) return;
    var canHover = false;
    try { canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) {}
    if (!canHover) return;

    cards.forEach(function (card) {
      var frame = 0, px = .5, py = .5;
      function paint() {
        frame = 0;
        var x = Math.max(0,Math.min(1,px));
        var y = Math.max(0,Math.min(1,py));
        card.style.setProperty('--tool-x',(x*100).toFixed(1)+'%');
        card.style.setProperty('--tool-y',(y*100).toFixed(1)+'%');
        card.style.setProperty('--tool-ry',((x-.5)*8).toFixed(2)+'deg');
        card.style.setProperty('--tool-rx',((.5-y)*7).toFixed(2)+'deg');
      }
      card.addEventListener('pointerenter',function(){
        card.classList.add('rk-tool-active');
        if (wrapper) wrapper.classList.add('rk-tools-hovering');
      },{passive:true});
      card.addEventListener('pointermove',function(event){
        var rect=card.getBoundingClientRect();
        if(!rect.width||!rect.height)return;
        px=(event.clientX-rect.left)/rect.width;
        py=(event.clientY-rect.top)/rect.height;
        if(!frame)frame=requestAnimationFrame(paint);
      },{passive:true});
      card.addEventListener('pointerleave',function(){
        if(frame){cancelAnimationFrame(frame);frame=0;}
        card.classList.remove('rk-tool-active');
        if(wrapper)wrapper.classList.remove('rk-tools-hovering');
        card.style.setProperty('--tool-x','50%');
        card.style.setProperty('--tool-y','50%');
        card.style.setProperty('--tool-rx','0deg');
        card.style.setProperty('--tool-ry','0deg');
      },{passive:true});
    });
  }

  function setupPageLeave() {
    qsa('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        var href = link.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#' || link.target || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;
        try {
          var u = new URL(link.href, location.href);
          if (u.origin !== location.origin) return;
        } catch (e) { return; }
        document.body.classList.add('rk-page-leave');
      });
    });
  }

  ready(function () {
    injectStyles();
    root.classList.remove('rk-motion-v3');
    root.classList.add('rk-motion-v4');
    classifyHeadings();
    classifyCards();
    setupReveals();
    setupButtons();
    setupSkillsShowcase();
    setupToolsShowcase();
    setupPortfolioPanelMotion();
    setupPageLeave();

    var nav = document.querySelector('nav');
    if (nav) nav.classList.add('rk-motion-nav');

    var progress = document.querySelector('.progress');
    var ownProgress = false;
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'rk-scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
      ownProgress = true;
    }

    requestAnimationFrame(function () { root.classList.add('rk-ready'); });
    if (reduce) return;

    var ticking = false;
    function updateScroll() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var p = Math.max(0, Math.min(1, y / max));
      if (ownProgress) progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      else progress.style.width = (p * 100).toFixed(2) + '%';
      if (nav) nav.classList.toggle('rk-nav-condensed', y > 28);
    }
    function requestScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', requestScroll, { passive: true });
    updateScroll();
  });
})();
