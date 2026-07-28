/* Shared navigation behaviour for every page. */
(function () {
  function initNavigation() {
    var nav = document.querySelector('nav');
    var links = nav && nav.querySelector('.nav-links');
    if (!nav || !links) return;

    if (!links.id) links.id = 'site-navigation';

    var channelLink = links.querySelector('a[href="channel.html"]');
    if (channelLink && channelLink.parentElement) {
      channelLink.parentElement.remove();
    }

    var portfolioLink = links.querySelector('a[href="photography.html"], a[href="portfolio.html"]');
    if (portfolioLink) {
      portfolioLink.href = 'portfolio.html';
      portfolioLink.textContent = 'Portfolio';
    }

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
