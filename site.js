/* Global site loader.
   Keeps the existing site behaviour in site-core.js and adds the Games tab
   to every page that uses the shared navigation script. */
(function () {
  'use strict';

  function addGamesTab() {
    var links = document.querySelector('nav .nav-links');
    if (!links || links.querySelector('a[href="games.html"]')) return;

    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = 'games.html';
    link.textContent = 'Games';

    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (page === 'games.html') link.classList.add('active');

    item.appendChild(link);
    var blog = links.querySelector('a[href="blog.html"]');
    if (blog && blog.parentNode) links.insertBefore(item, blog.parentNode);
    else links.appendChild(item);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addGamesTab, { once: true });
  } else {
    addGamesTab();
  }

  var core = document.createElement('script');
  core.src = 'site-core.js?v=20260820';
  core.async = false;
  document.head.appendChild(core);
})();
