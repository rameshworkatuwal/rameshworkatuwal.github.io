/* Global site loader.
   Keeps the existing site behaviour in site-core.js and groups local games,
   online multiplayer and Live Sports under the Games navigation experience. */
(function () {
  'use strict';

  function currentPage(){return (location.pathname.split('/').pop()||'index.html').toLowerCase();}

  function addGamesTab() {
    var links = document.querySelector('nav .nav-links');
    if (!links) return;
    var page=currentPage();
    var link=links.querySelector('a[href="games.html"]');
    if(!link){
      var item=document.createElement('li');
      link=document.createElement('a');
      link.href='games.html';link.textContent='Games';item.appendChild(link);
      var blog=links.querySelector('a[href="blog.html"]');
      if(blog&&blog.parentNode)links.insertBefore(item,blog.parentNode);else links.appendChild(item);
    }
    if(page==='games.html'||page==='online-ludo.html'||page==='sports.html')link.classList.add('active');
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

  function init(){addGamesTab();normalizeGamesSwitch();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  var core=document.createElement('script');
  core.src='site-core.js?v=20260820';
  core.async=false;
  document.head.appendChild(core);
})();
