/* ============================================================
   PHOTO LIKES

   A heart that appears only while a photo is open in the lightbox.

   Counts live in Firestore, reached over its plain REST API — no
   Firebase SDK, so this adds about 4KB instead of 100KB+ and there is
   no extra script for the browser to download.

   Two things make it safe to run on a public static site:
     · the only write ever sent is "move this one number by 1", which
       is exactly what the Firestore rules allow (see firebase-config.js)
     · which photos this device liked is kept in localStorage, so a
       visitor can't like the same photo twice by clicking again

   If Firebase isn't configured yet — or is unreachable — the heart
   silently falls back to remembering the like on this device only.
   The gallery never breaks because of it.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.RK_FIREBASE || {};
  var LIVE = !!(CFG.PROJECT_ID && CFG.API_KEY);
  var MINE_KEY = 'rk_liked_photos';

  var BASE = LIVE
    ? 'https://firestore.googleapis.com/v1/projects/' + CFG.PROJECT_ID +
      '/databases/(default)/documents'
    : null;

  /* ---------- which photos this device has liked ---------- */
  function mine() {
    try { return JSON.parse(localStorage.getItem(MINE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function setMine(id, liked) {
    try {
      var m = mine();
      if (liked) m[id] = 1; else delete m[id];
      localStorage.setItem(MINE_KEY, JSON.stringify(m));
    } catch (e) {}
  }

  // A photo path makes a fine key, but Firestore document ids can't
  // contain "/", so flatten it.
  function docId(src) {
    return String(src).replace(/^\.?\//, '').replace(/[\/.]/g, '_');
  }

  /* ---------- Firestore REST ---------- */
  function readCount(id) {
    if (!LIVE) return Promise.resolve(null);
    return fetch(BASE + '/likes/' + encodeURIComponent(id) + '?key=' + CFG.API_KEY)
      .then(function (r) {
        if (r.status === 404) return 0;           // nobody has liked it yet
        if (!r.ok) throw new Error('read ' + r.status);
        return r.json();
      })
      .then(function (d) {
        if (typeof d === 'number') return d;
        var f = d && d.fields && d.fields.count;
        return f ? parseInt(f.integerValue, 10) || 0 : 0;
      })
      .catch(function () { return null; });        // offline / not set up
  }

  function bump(id, by) {
    if (!LIVE) return Promise.resolve(false);
    // An update with an empty mask plus a transform means "create the
    // document if it's missing, then add `by` to count" — atomically,
    // so two people liking at the same moment can't overwrite each other.
    var body = {
      writes: [{
        update: {
          name: 'projects/' + CFG.PROJECT_ID + '/databases/(default)/documents/likes/' + id
        },
        updateMask: { fieldPaths: [] },
        updateTransforms: [{
          fieldPath: 'count',
          increment: { integerValue: String(by) }
        }]
      }]
    };
    return fetch(BASE + ':commit?key=' + CFG.API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.ok; })
      .catch(function () { return false; });
  }

  /* ---------- the button ---------- */
  var wrap, btn, num, currentSrc = null, busy = false;

  function build() {
    var lb = document.getElementById('lb');
    if (!lb || document.querySelector('.lb-like')) return false;

    wrap = document.createElement('div');
    wrap.className = 'lb-like';
    wrap.innerHTML =
      '<button type="button" class="lb-like-btn" aria-pressed="false" aria-label="Like this photo">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M12 21s-7.5-4.6-9.6-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.6 12c-2.1 4.4-9.6 9-9.6 9z"/>' +
        '</svg>' +
        '<span class="lb-like-num"></span>' +
      '</button>';
    lb.appendChild(wrap);

    btn = wrap.querySelector('.lb-like-btn');
    num = wrap.querySelector('.lb-like-num');
    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    return true;
  }

  function paint(liked, count) {
    btn.classList.toggle('is-liked', !!liked);
    btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    btn.setAttribute('aria-label', (liked ? 'Unlike' : 'Like') + ' this photo');
    num.textContent = (count === null || count === undefined || count <= 0) ? '' : count;
  }

  function load(src) {
    currentSrc = src;
    var id = docId(src);
    var liked = !!mine()[id];
    paint(liked, null);                 // show the heart straight away
    wrap.classList.add('is-loading');
    readCount(id).then(function (n) {
      if (currentSrc !== src) return;   // the viewer already moved on
      wrap.classList.remove('is-loading');
      paint(liked, n);
    });
  }

  function toggle() {
    if (busy || !currentSrc) return;
    var id = docId(currentSrc);
    var liked = !!mine()[id];
    var shown = parseInt(num.textContent, 10);
    if (isNaN(shown)) shown = 0;

    busy = true;
    var next = !liked;
    // Update straight away so the tap feels instant, then confirm.
    setMine(id, next);
    paint(next, Math.max(0, shown + (next ? 1 : -1)));
    btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');

    bump(id, next ? 1 : -1).then(function (ok) {
      busy = false;
      if (ok || !LIVE) return;
      // The write failed — put it back rather than show a wrong number.
      setMine(id, liked);
      paint(liked, shown);
    });
  }

  /* ---------- wire into the lightbox ---------- */
  function start() {
    if (!build()) return;
    var lbImg = document.getElementById('lbImg');
    if (!lbImg) return;

    // gallery.js swaps the <img> src as you move between photos, so watch
    // that instead of trying to hook every one of its navigation paths.
    var last = null;
    var sync = function () {
      var src = lbImg.getAttribute('src');
      if (!src || src === last) return;
      last = src;
      load(src);
    };
    new MutationObserver(sync).observe(lbImg, { attributes: true, attributeFilter: ['src'] });
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  } else {
    setTimeout(start, 0);
  }
})();
