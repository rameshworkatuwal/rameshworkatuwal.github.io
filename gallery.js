/* ============================================================
   AUTO GALLERY
   Just upload images to the folder on GitHub — nothing to edit here.

   How it finds your photos, in order:
     1. Asks GitHub what files are in the folder (any filename works)
     2. If that fails, looks for 01.jpg, 02.jpg, 03.jpg ... in the folder
     3. If that fails, looks for the same names in the site root
   ============================================================ */
(function () {
  var CFG = window.GALLERY_CONFIG || {};
  var USER = CFG.user, REPO = CFG.repo;
  var SETS = CFG.sets || [];
  var EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function canLoad(src) {
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () { res(true); };
      i.onerror = function () { res(false); };
      i.src = src;
    });
  }

  // 1) GitHub contents API — any filename, no config
  function fromGitHub(folder) {
    if (!USER || !REPO) return Promise.resolve(null);
    var url = 'https://api.github.com/repos/' + USER + '/' + REPO + '/contents/' + folder;
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('gh'); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list)) return null;
        var files = list
          .filter(function (f) { return f.type === 'file' && EXT.test(f.name); })
          .sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); })
          .map(function (f) { return folder + '/' + f.name; });
        return files.length ? files : null;
      })
      .catch(function () { return null; });
  }

  // 2/3) numbered probe — 01.jpg, 02.jpg, ... (stops after 3 misses in a row)
  function probe(prefix) {
    var found = [], misses = 0, i = 1;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function step() {
      if (i > 60 || misses >= 3) return Promise.resolve(found);
      var name = prefix + pad(i) + '.jpg';
      i++;
      return canLoad(name).then(function (ok) {
        if (ok) { found.push(name); misses = 0; } else { misses++; }
        return step();
      });
    }
    return step();
  }

  function resolveSet(set) {
    if (Array.isArray(set.files) && set.files.length) {
      return Promise.resolve(set.files.slice());
    }
    var folder = set.folder;
    return fromGitHub(folder).then(function (files) {
      if (files && files.length) return files;
      return probe(folder + '/').then(function (f) {
        if (f.length) return f;
        return probe('');
      });
    });
  }

  /* ---------- lightbox (shared) ---------- */
  var all = [], lb, lbImg, lbCount, cur = 0, previousFocus = null;

  function buildLightbox() {
    lb = el('div', 'lb'); lb.id = 'lb';
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
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.className === 'lb-stage') close(); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  function show(i) {
    cur = (i + all.length) % all.length;
    lbImg.src = all[cur];
    lbCount.textContent = (cur + 1) + ' / ' + all.length;
  }
  function open(i, trigger) {
    previousFocus = trigger || document.activeElement;
    show(i);
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-x').focus();
  }
  function close() {
    lb.classList.remove('on');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }

  /* ---------- render ---------- */
  function render(set, files, wrap) {
    if (!files.length) {
      wrap.innerHTML = '<p class="gal-empty">No photos in this folder yet.</p>';
      return;
    }
    var grid = el('div', 'gal-grid');
    files.forEach(function (src, position) {
      var idx = all.length;
      all.push(src);
      var a = el('button', 'gal-item');
      a.type = 'button';
      a.setAttribute('aria-label', 'Open ' + (set.title || 'travel') + ' photograph ' + (position + 1));
      var img = el('img');
      img.src = src;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = (set.title || 'Travel') + ' photograph ' + (position + 1);
      a.appendChild(img);
      a.addEventListener('click', function () { open(idx, a); });
      grid.appendChild(a);
    });
    wrap.innerHTML = '';
    wrap.appendChild(grid);

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var items = [].slice.call(grid.querySelectorAll('.gal-item'));
          e.target.style.transitionDelay = (Math.min(items.indexOf(e.target), 6) * 0.08) + 's';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.gal-item').forEach(function (n) { io.observe(n); });
  }

  function init() {
    buildLightbox();
    var host = document.getElementById('gallery');
    if (!host) return;
    SETS.forEach(function (set) {
      var sec = el('div', 'gal-set');
      sec.id = set.folder;
      var head = el('div', 'gal-set-head');
      var meta = set.cameraLogo
        ? '<span class="camera-meta"><img src="canon-logo.png" alt="Canon"><b>' + (set.sub || '2000D') + '</b></span>'
        : (set.sub ? '<span>' + set.sub + '</span>' : '');
      head.innerHTML = '<h3>' + (set.title || set.folder) + '</h3>' +
                       meta;
      var wrap = el('div');
      wrap.innerHTML = '<p class="gal-empty">Loading photos…</p>';
      sec.appendChild(head); sec.appendChild(wrap);
      host.appendChild(sec);
      resolveSet(set).then(function (files) { render(set, files || [], wrap); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
