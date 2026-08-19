/* ============================================================
   AUTO GALLERY
   Photography albums are resolved from GitHub folders. Dynamic albums are
   only shown after their original image files really exist in the repo.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.GALLERY_CONFIG || {};
  var USER = CFG.user, REPO = CFG.repo;
  var SETS = (CFG.sets || []).slice();
  var EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

  if (!document.querySelector('link[data-gallery-premium]')) {
    var premium = document.createElement('link');
    premium.rel = 'stylesheet';
    premium.href = 'gallery-premium.css?v=20260819-premium';
    premium.setAttribute('data-gallery-premium', 'true');
    document.head.appendChild(premium);
  }

  function hasSet(folder) {
    return SETS.some(function (set) { return set.folder === folder; });
  }

  function addSet(set) {
    if (!hasSet(set.folder)) SETS.push(set);
  }

  addSet({
    folder: 'kulekhani',
    title: 'Kulekhani 2022',
    year: 2022,
    sub: 'Canon EOS 200D Mark II · 75–300mm lens',
    cameraLogo: true,
    note: 'Kulekhani, Nepal',
    dynamicFolder: true,
    verifyFiles: true,
    files: [
      'kulekhani/kulekhani-01.png',
      'kulekhani/kulekhani-02.png',
      'kulekhani/kulekhani-03.png',
      'kulekhani/kulekhani-04.png'
    ]
  });

  addSet({
    folder: 'photography-2015',
    title: '2015',
    year: 2015,
    sub: 'Canon PowerShot SX740 HS Lite Edition',
    cameraLogo: true,
    dynamicFolder: true
  });

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function canLoad(src) {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = function () { resolve(true); };
      image.onerror = function () { resolve(false); };
      image.src = src;
    });
  }

  function verifyFiles(files) {
    return Promise.all(files.map(function (src) {
      return canLoad(src).then(function (ok) { return ok ? src : null; });
    })).then(function (list) {
      return list.filter(Boolean);
    });
  }

  function fromGitHub(folder) {
    if (!USER || !REPO) return Promise.resolve(null);
    var url = 'https://api.github.com/repos/' + USER + '/' + REPO + '/contents/' + folder;
    return fetch(url, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('github');
        return response.json();
      })
      .then(function (list) {
        if (!Array.isArray(list)) return null;
        var files = list
          .filter(function (file) { return file.type === 'file' && EXT.test(file.name); })
          .sort(function (a, b) {
            return a.name.localeCompare(b.name, undefined, { numeric: true });
          })
          .map(function (file) { return folder + '/' + file.name; });
        return files.length ? files : null;
      })
      .catch(function () { return null; });
  }

  function probe(prefix) {
    var found = [], misses = 0, index = 1;
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function step() {
      if (index > 60 || misses >= 3) return Promise.resolve(found);
      var name = prefix + pad(index) + '.jpg';
      index++;
      return canLoad(name).then(function (ok) {
        if (ok) { found.push(name); misses = 0; }
        else misses++;
        return step();
      });
    }
    return step();
  }

  function resolveSet(set) {
    if (Array.isArray(set.files) && set.files.length) {
      if (set.verifyFiles) return verifyFiles(set.files);
      return Promise.resolve(set.files.slice());
    }
    return fromGitHub(set.folder).then(function (files) {
      if (files && files.length) return files;
      return probe(set.folder + '/').then(function (found) {
        if (found.length) return found;
        if (set.dynamicFolder) return [];
        return probe('');
      });
    });
  }

  function yearFromCard(card) {
    var own = parseInt(card.getAttribute('data-year') || '', 10);
    if (own) return own;
    var title = card.querySelector('strong');
    var match = title && title.textContent.match(/\b(19|20)\d{2}\b/);
    return match ? parseInt(match[0], 10) : null;
  }

  function insertFolderByYear(folders, card, year) {
    var children = Array.prototype.slice.call(folders.children);

    if (!year) {
      var firstDated = children.find(function (item) { return yearFromCard(item); });
      if (firstDated) folders.insertBefore(card, firstDated);
      else folders.appendChild(card);
      return;
    }

    var inserted = false;
    children.forEach(function (item) {
      if (inserted) return;
      var existingYear = yearFromCard(item);
      if (existingYear && existingYear < year) {
        folders.insertBefore(card, item);
        inserted = true;
      }
    });
    if (!inserted) folders.appendChild(card);
  }

  function ensureFolderCard(set, files) {
    if (!set.dynamicFolder || !files.length) return;
    var folders = document.querySelector('.album-folders');
    if (!folders) return;

    var existing = folders.querySelector('a[href="#' + set.folder + '"]');
    if (existing) {
      var existingCount = existing.querySelector('.album-count');
      if (existingCount) existingCount.textContent = files.length + ' photos';
      return;
    }

    var card = document.createElement('a');
    card.className = 'album-folder';
    card.href = '#' + set.folder;
    card.setAttribute('data-anim', 'pop');
    if (set.year) card.setAttribute('data-year', String(set.year));
    card.style.setProperty('--d', String(folders.children.length));

    var subtitle = set.sub ? '<small>' + set.sub + '</small>' : '';
    if (folders.querySelector('.album-folder-frame')) {
      card.innerHTML =
        '<span class="album-folder-frame"><img src="' + files[0] + '" alt="' + set.title + ' photography album" loading="lazy" decoding="async"></span>' +
        '<span class="album-folder-copy">' +
          '<span class="album-folder-title"><strong>' + set.title + '</strong>' + subtitle + '</span>' +
          '<span class="album-count">' + files.length + ' photos</span>' +
        '</span>';
    } else {
      card.innerHTML =
        '<img src="' + files[0] + '" alt="' + set.title + ' photography album" loading="lazy" decoding="async">' +
        '<span class="album-folder-copy">' + subtitle + '<strong>' + set.title + '</strong></span>';
    }

    insertFolderByYear(folders, card, set.year || null);
  }

  function ensureSX740GearCard() {
    var track = document.querySelector('#gear-panel .gear-track');
    if (!track || track.querySelector('.gear-sx740')) return;

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 500">' +
      '<defs>' +
        '<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3d424a"/><stop offset=".42" stop-color="#15181d"/><stop offset="1" stop-color="#050608"/></linearGradient>' +
        '<radialGradient id="l"><stop stop-color="#2f3540"/><stop offset=".45" stop-color="#0b0d11"/><stop offset=".7" stop-color="#303943"/><stop offset=".84" stop-color="#080a0d"/><stop offset="1" stop-color="#010203"/></radialGradient>' +
        '<linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#8b939d"/><stop offset="1" stop-color="#2e333b"/></linearGradient>' +
        '<filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#000" flood-opacity=".55"/></filter>' +
      '</defs>' +
      '<g filter="url(#s)">' +
        '<path d="M118 145c0-29 23-52 52-52h420c29 0 52 23 52 52v236c0 29-23 52-52 52H170c-29 0-52-23-52-52z" fill="url(#b)" stroke="#69717b" stroke-width="5"/>' +
        '<path d="M138 143h172l29-40h125l32 40h126" fill="none" stroke="#585f68" stroke-width="9" stroke-linecap="round"/>' +
        '<rect x="165" y="128" width="92" height="24" rx="8" fill="#0a0c0f" stroke="#4b515a" stroke-width="3"/>' +
        '<rect x="525" y="126" width="56" height="24" rx="12" fill="url(#g)"/>' +
        '<circle cx="385" cy="276" r="126" fill="#090b0e" stroke="#505964" stroke-width="9"/>' +
        '<circle cx="385" cy="276" r="104" fill="url(#l)" stroke="#15191e" stroke-width="10"/>' +
        '<circle cx="385" cy="276" r="65" fill="#020305" stroke="#3d4651" stroke-width="7"/>' +
        '<circle cx="360" cy="247" r="24" fill="#526b82" opacity=".34"/>' +
        '<path d="M220 198h76" stroke="#bfc4ca" stroke-width="12" stroke-linecap="round" opacity=".9"/>' +
        '<text x="170" y="365" fill="#f6f7f8" font-family="Arial,sans-serif" font-size="34" font-weight="700">Canon</text>' +
        '<text x="500" y="365" fill="#c8d0d9" font-family="Arial,sans-serif" font-size="21" font-weight="700">SX740 HS</text>' +
      '</g></svg>';

    var card = document.createElement('article');
    card.className = 'gear-card gear-canon gear-sx740';
    card.innerHTML =
      '<span class="gear-number">00</span>' +
      '<span class="gear-type">Lite Edition · Travel Compact</span>' +
      '<div class="gear-product"><img alt="Canon PowerShot SX740 HS Lite Edition camera" loading="lazy" decoding="async"></div>' +
      '<div class="gear-card-copy"><h3>Canon PowerShot SX740 HS Lite Edition</h3></div>';
    card.querySelector('img').src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    track.appendChild(card);
  }

  var all = [], lb, lbImg, lbCount, cur = 0, previousFocus = null;

  function buildLightbox() {
    lb = el('div', 'lb');
    lb.id = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML =
      '<button class="lb-x" aria-label="Close">✕</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous">‹</button>' +
      '<button class="lb-nav lb-next" aria-label="Next">›</button>' +
      '<div class="lb-stage"><img id="lbImg" alt=""></div>' +
      '<div class="lb-count" id="lbCount"></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('#lbImg');
    lbCount = lb.querySelector('#lbCount');

    lb.querySelector('.lb-x').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function (event) {
      event.stopPropagation(); show(cur - 1);
    });
    lb.querySelector('.lb-next').addEventListener('click', function (event) {
      event.stopPropagation(); show(cur + 1);
    });
    lb.addEventListener('click', function (event) {
      if (event.target === lb || event.target.className === 'lb-stage') close();
    });

    document.addEventListener('keydown', function (event) {
      if (!lb.classList.contains('on')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') show(cur + 1);
      if (event.key === 'ArrowLeft') show(cur - 1);
    });

    var startX = null;
    lb.addEventListener('touchstart', function (event) {
      startX = event.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (event) {
      if (startX === null) return;
      var delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 50) show(cur + (delta < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
  }

  function show(index) {
    if (!all.length) return;
    cur = (index + all.length) % all.length;
    lbImg.src = all[cur];
    lbCount.textContent = (cur + 1) + ' / ' + all.length;
  }

  function open(index, trigger) {
    previousFocus = trigger || document.activeElement;
    show(index);
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-x').focus();
  }

  function close() {
    lb.classList.remove('on');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }

  function bindGalleryMotion(item) {
    if (!item || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var frame = 0;
    item.addEventListener('pointermove', function (event) {
      if (window.innerWidth < 760 || frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        var rect = item.getBoundingClientRect();
        var px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        var py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        item.style.setProperty('--rx', ((0.5 - py) * 5.5).toFixed(2) + 'deg');
        item.style.setProperty('--ry', ((px - 0.5) * 7).toFixed(2) + 'deg');
        item.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        item.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
    }, { passive: true });
    item.addEventListener('pointerleave', function () {
      item.style.setProperty('--rx', '0deg');
      item.style.setProperty('--ry', '0deg');
      item.style.setProperty('--mx', '50%');
      item.style.setProperty('--my', '50%');
    });
  }

  function render(set, files, wrap) {
    var grid = el('div', 'gal-grid');
    files.forEach(function (src, position) {
      var index = all.length;
      all.push(src);
      var button = el('button', 'gal-item');
      button.type = 'button';
      button.setAttribute('aria-label', 'Open ' + (set.title || 'travel') + ' photograph ' + (position + 1));
      button.setAttribute('data-index', String(position + 1).padStart(2, '0'));
      var image = el('img');
      image.src = src;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = (set.title || 'Travel') + ' photograph ' + (position + 1);
      image.addEventListener('load', function () {
        if (image.naturalHeight > image.naturalWidth * 1.16) button.classList.add('is-portrait');
        else if (Math.abs(image.naturalWidth - image.naturalHeight) < Math.max(image.naturalWidth, image.naturalHeight) * 0.08) button.classList.add('is-square');
      }, { once: true });
      button.appendChild(image);
      button.addEventListener('click', function () { open(index, button); });
      bindGalleryMotion(button);
      grid.appendChild(button);
    });
    wrap.innerHTML = '';
    wrap.appendChild(grid);

    if (!('IntersectionObserver' in window)) {
      grid.querySelectorAll('.gal-item').forEach(function (item) { item.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var items = Array.prototype.slice.call(grid.querySelectorAll('.gal-item'));
        entry.target.style.transitionDelay = (Math.min(items.indexOf(entry.target), 6) * 0.08) + 's';
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.gal-item').forEach(function (item) { io.observe(item); });
  }

  function makeSection(set, files, host) {
    var section = el('div', 'gal-set');
    section.id = set.folder;
    var head = el('div', 'gal-set-head');
    var meta = set.cameraLogo
      ? '<span class="camera-meta"><img src="canon-logo.png" alt="Canon"><b>' + (set.sub || 'Canon') + '</b></span>'
      : (set.sub ? '<span>' + set.sub + '</span>' : '');
    var link = set.link
      ? '<a class="gal-set-link" href="' + set.link + '" target="_blank" rel="noopener noreferrer">' +
          (set.linkLabel || 'View') +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>' +
        '</a>'
      : '';
    head.innerHTML = '<h3>' + (set.title || set.folder) + '</h3>' + meta + link;
    section.appendChild(head);

    if (set.note) {
      var note = el('p', 'gal-set-note');
      note.textContent = set.note;
      section.appendChild(note);
    }

    var wrap = el('div');
    section.appendChild(wrap);
    host.appendChild(section);
    render(set, files, wrap);
  }

  function init() {
    ensureSX740GearCard();
    buildLightbox();

    var host = document.getElementById('gallery');
    if (!host) return;

    Promise.all(SETS.map(resolveSet)).then(function (resolved) {
      SETS.forEach(function (set, index) {
        var files = resolved[index] || [];
        if (!files.length) {
          if (set.dynamicFolder) return;
          var section = el('div', 'gal-set');
          section.id = set.folder;
          section.innerHTML = '<div class="gal-set-head"><h3>' + (set.title || set.folder) + '</h3></div><p class="gal-empty">No photos in this folder yet.</p>';
          host.appendChild(section);
          return;
        }
        ensureFolderCard(set, files);
        makeSection(set, files, host);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
