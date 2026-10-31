/* Games are temporarily paused. Original pages and navigation are in _archive/games/. */
(function () {
  'use strict';
  function showLiveSportsNavigation() {
    var links = document.querySelector('nav .nav-links');
    if (!links) return;
    var link = links.querySelector('a[href="sports.html"]');
    if (!link) {
      var item = document.createElement('li');
      link = document.createElement('a');
      link.href = 'sports.html';
      item.appendChild(link);
      var blog = links.querySelector('a[href="blog.html"]');
      if (blog) links.insertBefore(item, blog.parentNode);
      else links.appendChild(item);
    }
    link.textContent = 'Live Sports';
    var active = /\/sports\.html$/.test(location.pathname);
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  function init() {
    showLiveSportsNavigation();
    setTimeout(showLiveSportsNavigation, 500);
    setTimeout(showLiveSportsNavigation, 1600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  var core = document.createElement('script');
  core.src = 'site-core.js?v=20260820';
  core.async = false;
  document.head.appendChild(core);
})();
