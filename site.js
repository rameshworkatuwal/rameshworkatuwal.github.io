/* Global site loader.
   Keeps the existing site behaviour in site-core.js and groups local games,
   online multiplayer and Live Sports under the Games navigation experience. */
(function () {
  'use strict';

  function currentPage(){return (location.pathname.split('/').pop()||'index.html').toLowerCase();}

  function ensureGamesNavStyle(){
    if(document.getElementById('rk-games-nav-style'))return;
    var style=document.createElement('style');
    style.id='rk-games-nav-style';
    style.textContent=`
nav .nav-links>li.nav-games{position:relative;display:flex;align-items:center;gap:.18rem}
nav .nav-games>a[href="games.html"]{display:inline-flex;align-items:center;gap:.28rem}
nav .nav-games-toggle{display:grid;place-items:center;width:22px;height:22px;padding:0;border:0;border-radius:999px;background:transparent;color:var(--muted,#7d91a7);cursor:pointer;transition:transform .25s ease,color .25s ease,background .25s ease}
nav .nav-games-toggle:hover,nav .nav-games.open .nav-games-toggle{color:var(--text,#122334);background:rgba(89,190,255,.09)}
nav .nav-games-toggle svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .32s cubic-bezier(.16,1,.3,1)}
nav .nav-games.open .nav-games-toggle svg,nav .nav-games:hover .nav-games-toggle svg,nav .nav-games:focus-within .nav-games-toggle svg{transform:rotate(180deg)}
nav .nav-games::after{content:'';position:absolute;left:-12px;right:-12px;top:100%;height:18px;pointer-events:none}
nav .nav-games-menu{position:absolute;z-index:400;top:calc(100% + 13px);left:50%;min-width:220px;margin:0;padding:7px;list-style:none;border:1px solid rgba(111,170,211,.16);border-radius:18px;background:color-mix(in srgb,var(--surface,#0b1421) 92%,transparent);box-shadow:0 22px 55px rgba(3,13,23,.24),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(24px) saturate(1.25);opacity:0;visibility:hidden;pointer-events:none;transform:translateX(-50%) translateY(8px) scale(.97);transform-origin:50% 0;transition:opacity .2s ease,visibility .2s ease,transform .34s cubic-bezier(.16,1,.3,1)}
nav .nav-games:hover .nav-games-menu,nav .nav-games:focus-within .nav-games-menu,nav .nav-games.open .nav-games-menu{opacity:1;visibility:visible;pointer-events:auto;transform:translateX(-50%) translateY(0) scale(1)}
nav .nav-games-menu li{display:block!important;margin:0!important;padding:0!important}
nav .nav-games-menu a{display:grid!important;grid-template-columns:31px minmax(0,1fr);gap:.68rem;align-items:center;width:100%;padding:.62rem .68rem!important;border-radius:12px;color:var(--muted,#71869b)!important;text-decoration:none!important;transition:background .25s ease,color .25s ease,transform .25s cubic-bezier(.16,1,.3,1)!important}
nav .nav-games-menu a::after{display:none!important}
nav .nav-games-menu a:hover,nav .nav-games-menu a.active{color:var(--text,#102233)!important;background:rgba(71,180,246,.10);transform:translateX(2px)}
nav .nav-games-menu .g-icon{display:grid;place-items:center;width:31px;height:31px;border:1px solid rgba(75,178,244,.16);border-radius:10px;background:rgba(75,178,244,.07);font-size:.85rem}
nav .nav-games-menu .g-copy{display:grid;gap:.08rem;min-width:0}
nav .nav-games-menu .g-copy b{font-size:.73rem;line-height:1.1;color:inherit}
nav .nav-games-menu .g-copy small{font-size:.52rem;line-height:1.2;color:var(--muted,#8293a6);white-space:nowrap}
nav .nav-games-menu .g-live{position:relative}
nav .nav-games-menu .g-live .g-icon::before{content:'';width:8px;height:8px;border-radius:50%;background:#ff4266;box-shadow:0 0 0 0 rgba(255,66,102,.5);animation:rkNavLive 1.55s ease-out infinite}
@keyframes rkNavLive{70%{box-shadow:0 0 0 7px rgba(255,66,102,0)}}
html[data-theme="light"] nav .nav-games-menu{background:rgba(255,255,255,.94);box-shadow:0 22px 55px rgba(65,93,124,.18),inset 0 1px 0 #fff}
@media(max-width:900px){
  nav .nav-links>li.nav-games{display:grid!important;grid-template-columns:1fr auto;width:100%}
  nav .nav-games>a[href="games.html"]{width:100%}
  nav .nav-games-toggle{width:34px;height:34px}
  nav .nav-games::after{display:none}
  nav .nav-games-menu{position:static;grid-column:1/-1;min-width:0;width:100%;margin-top:.3rem;padding:5px;transform:translateY(-5px) scale(.99);display:none;opacity:0;visibility:hidden;pointer-events:none;box-shadow:none;background:rgba(70,170,235,.045)}
  nav .nav-games:hover .nav-games-menu{display:none;opacity:0;visibility:hidden;pointer-events:none}
  nav .nav-games.open .nav-games-menu,nav .nav-games:focus-within.open .nav-games-menu{display:block;opacity:1;visibility:visible;pointer-events:auto;transform:none}
}
@media(prefers-reduced-motion:reduce){nav .nav-games-menu,nav .nav-games-toggle svg{transition:none!important}.g-live .g-icon::before{animation:none!important}}
`;
    document.head.appendChild(style);
  }

  function groupGamesNavigation(){
    var links=document.querySelector('nav .nav-links');
    if(!links)return;
    ensureGamesNavStyle();
    var page=currentPage();

    /* Remove any standalone Live / Live Sports item from the top-level nav. */
    [].slice.call(links.children).forEach(function(item){
      if(!item || !item.querySelector)return;
      var a=item.querySelector(':scope > a');
      if(!a)return;
      var href=(a.getAttribute('href')||'').split('?')[0].split('#')[0].toLowerCase();
      var label=(a.textContent||'').trim().toLowerCase();
      if(href==='sports.html' || label==='live' || label==='live sports')item.remove();
    });

    var link=links.querySelector(':scope > li > a[href="games.html"]');
    var item=link&&link.parentElement;
    if(!link){
      item=document.createElement('li');
      link=document.createElement('a');
      link.href='games.html';
      link.textContent='Games';
      item.appendChild(link);
      var blog=links.querySelector(':scope > li > a[href="blog.html"]');
      if(blog&&blog.parentNode)links.insertBefore(item,blog.parentNode);else links.appendChild(item);
    }

    item.classList.add('nav-games');
    link.classList.toggle('active',page==='games.html'||page==='online-ludo.html'||page==='sports.html');

    var toggle=item.querySelector('.nav-games-toggle');
    if(!toggle){
      toggle=document.createElement('button');
      toggle.type='button';
      toggle.className='nav-games-toggle';
      toggle.setAttribute('aria-label','Open Games menu');
      toggle.setAttribute('aria-expanded','false');
      toggle.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
      item.insertBefore(toggle,link.nextSibling);
      toggle.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        var open=item.classList.toggle('open');
        toggle.setAttribute('aria-expanded',String(open));
        toggle.setAttribute('aria-label',open?'Close Games menu':'Open Games menu');
      });
    }

    var menu=item.querySelector('.nav-games-menu');
    if(!menu){menu=document.createElement('ul');menu.className='nav-games-menu';item.appendChild(menu)}
    menu.innerHTML=
      '<li><a href="games.html"'+(page==='games.html'?' class="active"':'')+'><span class="g-icon">🎮</span><span class="g-copy"><b>Play Games</b><small>Ludo & Snake</small></span></a></li>'+ 
      '<li><a href="online-ludo.html"'+(page==='online-ludo.html'?' class="active"':'')+'><span class="g-icon">🌐</span><span class="g-copy"><b>Play Online</b><small>Friends multiplayer</small></span></a></li>'+ 
      '<li><a href="sports.html" class="g-live'+(page==='sports.html'?' active':'')+'"><span class="g-icon"></span><span class="g-copy"><b>Live Sports</b><small>Scores & results</small></span></a></li>';

    document.addEventListener('click',function(e){
      if(!item.contains(e.target)){item.classList.remove('open');toggle.setAttribute('aria-expanded','false')}
    },{once:true});
  }

  function appendStyleOnce(href,prefix){
    if(document.querySelector('link[href^="'+prefix+'"]'))return;
    var css=document.createElement('link');css.rel='stylesheet';css.href=href;document.head.appendChild(css);
  }

  function ensureGamesHubStyles(){
    appendStyleOnce('games-enhanced.css?v=20260820-3','games-enhanced.css');
    appendStyleOnce('games-realism.css?v=20260820-2327','games-realism.css');
  }

  function normalizeGamesSwitch(){
    var page=currentPage();
    if(page!=='games.html'&&page!=='sports.html'&&page!=='online-ludo.html')return;
    ensureGamesHubStyles();
    var sw=document.querySelector('.games-hub-switch');
    if(!sw&&page==='sports.html'){
      var container=document.querySelector('.sports-page');
      if(!container)return;
      sw=document.createElement('div');sw.className='games-hub-switch sports-games-switch';container.insertBefore(sw,container.firstChild);
    }
    if(!sw)return;
    sw.innerHTML='<a href="games.html"'+(page==='games.html'?' class="is-active"':'')+'><span>Play Games</span></a>'+ 
      '<a href="online-ludo.html"'+(page==='online-ludo.html'?' class="is-active"':'')+'><span>Play Online</span></a>'+ 
      '<a href="sports.html" class="live-link'+(page==='sports.html'?' is-active':'')+'"><span>Live Sports</span></a>';
  }

  function init(){
    groupGamesNavigation();
    normalizeGamesSwitch();
    /* Some page scripts render nav extras later; clean standalone Live again. */
    setTimeout(groupGamesNavigation,500);
    setTimeout(groupGamesNavigation,1600);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  var core=document.createElement('script');
  core.src='site-core.js?v=20260820';
  core.async=false;
  document.head.appendChild(core);
})();
