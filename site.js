/* Shared navigation behaviour for every page. */
(function () {
  function initNavigation() {
    var nav = document.querySelector('nav');
    var links = nav && nav.querySelector('.nav-links');
    if (!nav || !links) return;

    if (!links.id) links.id = 'site-navigation';

    var secondaryPages = [
      'certifications.html',
      'youtube.html',
      'photography.html',
      'blog.html'
    ];
    var secondaryItems = [];

    Array.prototype.forEach.call(links.children, function (item) {
      var anchor = item.querySelector('a');
      if (anchor && secondaryPages.indexOf(anchor.getAttribute('href')) !== -1) {
        secondaryItems.push(item);
      }
    });

    if (secondaryItems.length) {
      var moreItem = document.createElement('li');
      moreItem.className = 'nav-more';

      var moreButton = document.createElement('button');
      moreButton.className = 'nav-more-button';
      moreButton.type = 'button';
      moreButton.setAttribute('aria-haspopup', 'true');
      moreButton.setAttribute('aria-expanded', 'false');
      moreButton.innerHTML = 'More <span aria-hidden="true">⌄</span>';

      var submenu = document.createElement('ul');
      submenu.className = 'nav-submenu';
      submenu.setAttribute('aria-label', 'More pages');

      secondaryItems.forEach(function (item) {
        if (item.querySelector('a.active')) moreButton.classList.add('active');
        submenu.appendChild(item);
      });

      moreItem.appendChild(moreButton);
      moreItem.appendChild(submenu);
      var contactItem = links.querySelector('a[href="contact.html"]');
      links.insertBefore(moreItem, contactItem ? contactItem.parentElement : null);

      moreButton.addEventListener('click', function (event) {
        event.stopPropagation();
        var open = moreItem.classList.toggle('open');
        moreButton.setAttribute('aria-expanded', String(open));
      });

      document.addEventListener('click', function () {
        moreItem.classList.remove('open');
        moreButton.setAttribute('aria-expanded', 'false');
      });
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
      var more = links.querySelector('.nav-more');
      var moreButton = links.querySelector('.nav-more-button');
      if (more) more.classList.remove('open');
      if (moreButton) moreButton.setAttribute('aria-expanded', 'false');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
