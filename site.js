/* Global site loader.
   Keeps the existing site behaviour in site-core.js and groups Play + Live Sports
   under the Games navigation experience. */
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
    if(page==='games.html'||page==='sports.html')link.classList.add('active');
  }

  function addSportsGamesSwitch(){
    if(currentPage()!=='sports.html')return;
    var page=document.querySelector('.sports-page');
    if(!page||page.querySelector('.games-hub-switch'))return;
    var sw=document.createElement('div');
    sw.className='games-hub-switch sports-games-switch';
    sw.innerHTML='<a href="games.html"><span>Play Games</span></a><a href="sports.html" class="live-link is-active"><span>Live Sports</span></a>';
    page.insertBefore(sw,page.firstChild);
    if(!document.querySelector('link[href^="games-enhanced.css"]')){
      var css=document.createElement('link');css.rel='stylesheet';css.href='games-enhanced.css?v=20260820-3';document.head.appendChild(css);
    }
  }

  function init(){addGamesTab();addSportsGamesSwitch();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  var core=document.createElement('script');
  core.src='site-core.js?v=20260820';
  core.async=false;
  document.head.appendChild(core);
})();
