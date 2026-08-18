/* Theme + shared typography/layout polish. */
(function () {
  'use strict';

  var KEY = 'rk_theme';
  var root = document.documentElement;
  var CAMERA_MODEL = 'Canon PowerShot SX740 HS LITE EDITION';
  var CAMERA_URL = 'https://en.canon-me.com/store/ae/canon-powershot-sx740-hs-lite-edition-camera-black/2955C039/';

  function installSitePolish() {
    if (!document.querySelector('link[data-rk-instagram-font]')) {
      var font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
      font.setAttribute('data-rk-instagram-font', 'true');
      document.head.appendChild(font);
    }

    if (document.getElementById('rk-site-polish')) return;
    var style = document.createElement('style');
    style.id = 'rk-site-polish';
    style.textContent = `
:root{
  --rk-ig-sans:'Plus Jakarta Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
}

html,body,button,input,textarea,select,a,p,li,label,small,strong,b,em,h1,h2,h3,h4,h5,h6{
  font-family:var(--rk-ig-sans)!important;
}
body{
  font-optical-sizing:auto;
  font-synthesis:none;
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  letter-spacing:0;
  word-spacing:.035em;
}

h1,h2,h3,h4,h5,h6,
.hero-name,.page-title,.portfolio-title,
.panel-intro h2,.gal-set-head h3,
.album-folder strong,
#gear-panel .gear-heading h2,
#gear-panel .gear-card-copy h3,
.exp-card .job-title,.skill-card h3,
.youtube-title,.blog-title{
  font-family:var(--rk-ig-sans)!important;
  font-weight:700!important;
  letter-spacing:-.022em!important;
  word-spacing:.09em!important;
}

nav,.nav-logo,.nav-links,.nav-links a,.nav-more-button,
.btn,button,.roles,.eyebrow,.page-label,
.portfolio-tab,.portfolio-tab strong,
.album-count,.camera-meta,
#gear-panel .gear-eyebrow,
#gear-panel .gear-number,
#gear-panel .gear-type{
  font-family:var(--rk-ig-sans)!important;
}
.nav-logo,.nav-links a,.nav-more-button,.btn,.portfolio-tab strong{
  font-weight:600!important;
  letter-spacing:0!important;
  word-spacing:.045em!important;
}

p,li,.hero-subtitle,.about-text,.info-row,
.job-points,.skill-desc,.gal-set-note,.portfolio-panel-hint{
  font-weight:400;
  letter-spacing:0!important;
  word-spacing:.05em!important;
}

.page-label,.eyebrow,#gear-panel .gear-eyebrow,#gear-panel .gear-number,#gear-panel .gear-type{
  font-weight:700!important;
  letter-spacing:.11em!important;
  word-spacing:.05em!important;
}

/* Photography overview: keep cards compact but use the available width.
   Five cards fit across wide desktop screens; wrapped rows stay centered. */
.gallery-page{
  width:min(94%,1440px)!important;
  max-width:1440px!important;
  margin-left:auto!important;
  margin-right:auto!important;
}
.album-folders{
  display:flex!important;
  flex-wrap:wrap!important;
  justify-content:center!important;
  align-items:stretch!important;
  gap:1rem!important;
  width:100%!important;
  max-width:1320px!important;
  margin-left:auto!important;
  margin-right:auto!important;
}
.album-folder{
  flex:1 1 218px!important;
  width:auto!important;
  min-width:205px!important;
  max-width:245px!important;
}
.album-folder-frame{
  aspect-ratio:16/10!important;
  border-radius:12px!important;
}
.album-folder-copy{
  margin-top:.52rem!important;
  gap:.45rem!important;
}
.album-folder strong{
  font-size:.91rem!important;
  line-height:1.18!important;
}
.album-folder small,.album-count{
  font-size:.64rem!important;
  line-height:1.3!important;
}
.camera-meta{
  padding:.15rem .42rem!important;
  font-size:.59rem!important;
}
.camera-meta img{
  width:34px!important;
  height:12px!important;
}

/* Long confirmed PowerShot model stays neat on the 2015 card and open album. */
a[href="#photography-2015"] small{
  max-width:178px!important;
  white-space:normal!important;
  letter-spacing:.035em!important;
}
#photography-2015 .camera-meta{
  max-width:min(100%,360px)!important;
}
#photography-2015 .camera-meta b{
  white-space:normal!important;
  line-height:1.2!important;
}

/* Gear rail: cards begin from the useful content edge, with no artificial
   half-track spacer. */
#gear-panel{
  padding-left:clamp(1rem,2.2vw,1.8rem)!important;
  padding-right:clamp(1rem,2.2vw,1.8rem)!important;
}
#gear-panel .gear-stage{
  width:100%!important;
  overflow:hidden!important;
}
#gear-panel .gear-track{
  width:100%!important;
  padding:.8rem 2px 1.1rem!important;
  scroll-padding-inline:2px!important;
  gap:12px!important;
}
#gear-panel .gear-card{
  flex:0 0 min(72vw,270px)!important;
  width:min(72vw,270px)!important;
  max-width:270px!important;
  min-height:356px!important;
}
#gear-panel .gear-card.is-current{
  --rail-lift:-7px!important;
  --rail-scale:1.02!important;
}
#gear-panel .gear-product{
  min-height:210px!important;
}
#gear-panel .gear-sx740 .gear-type{
  color:#72dcff!important;
}
#gear-panel .gear-sx740 .gear-card-copy h3{
  font-size:clamp(.9rem,1.35vw,1.08rem)!important;
  line-height:1.18!important;
}

@media(max-width:1100px){
  .album-folders{max-width:1040px!important}
  .album-folder{flex-basis:215px!important;max-width:235px!important}
}
@media(max-width:780px){
  .album-folders{max-width:720px!important}
  .album-folder{flex-basis:205px!important;max-width:225px!important}
  #gear-panel .gear-card{
    flex-basis:min(76vw,255px)!important;
    width:min(76vw,255px)!important;
    max-width:255px!important;
  }
}
@media(max-width:520px){
  .gallery-page{width:92%!important}
  .album-folders{max-width:320px!important;gap:1rem!important}
  .album-folder{flex:1 1 100%!important;min-width:0!important;max-width:320px!important}
  #gear-panel{padding-left:.85rem!important;padding-right:.85rem!important}
  #gear-panel .gear-track{gap:10px!important}
}
@media(max-width:620px){
  h1,h2,h3,h4,h5,h6,
  .hero-name,.page-title,.portfolio-title,
  .panel-intro h2,.gal-set-head h3,#gear-panel .gear-heading h2{
    letter-spacing:-.018em!important;
    word-spacing:.075em!important;
  }
}
`;
    document.head.appendChild(style);
  }

  installSitePolish();

  function current() {
    try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; }
    catch (e) { return 'dark'; }
  }

  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  }

  applyTheme(current());

  function icons(button, theme) {
    button.innerHTML = theme === 'light'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    button.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }

  function buildToggle() {
    if (document.getElementById('themeToggle')) return;
    var button = document.createElement('button');
    button.id = 'themeToggle';
    button.style.cssText =
      'position:fixed;right:70px;bottom:18px;z-index:9998;width:42px;height:42px;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;cursor:pointer;' +
      'border:1px solid var(--line);background:var(--surface);color:var(--blue);' +
      'backdrop-filter:blur(10px);box-shadow:0 6px 20px rgba(0,0,0,.25);' +
      'transition:transform .25s,border-color .25s;';
    button.onmouseenter = function () {
      button.style.transform = 'scale(1.08)';
      button.style.borderColor = 'var(--blue)';
    };
    button.onmouseleave = function () {
      button.style.transform = 'scale(1)';
      button.style.borderColor = 'var(--line)';
    };
    icons(button, current());
    button.addEventListener('click', function () {
      var next = current() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      root.style.transition = 'none';
      applyTheme(next);
      icons(button, next);
    });
    document.body.appendChild(button);
  }

  /* gallery.js creates the 2015 album and SX740 card dynamically. Keep every
     visible camera reference synced to the exact Canon UAE model supplied by
     the portfolio owner. */
  function syncCameraModel() {
    var album = document.querySelector('a[href="#photography-2015"]');
    if (album) {
      var small = album.querySelector('small');
      if (small && small.textContent !== CAMERA_MODEL) small.textContent = CAMERA_MODEL;
      album.setAttribute('title', CAMERA_MODEL);
    }

    var openedMeta = document.querySelector('#photography-2015 .camera-meta b');
    if (openedMeta && openedMeta.textContent !== CAMERA_MODEL) openedMeta.textContent = CAMERA_MODEL;

    var gear = document.querySelector('#gear-panel .gear-sx740');
    if (gear) {
      var title = gear.querySelector('.gear-card-copy h3');
      var type = gear.querySelector('.gear-type');
      var image = gear.querySelector('.gear-product img');
      if (title && title.textContent !== CAMERA_MODEL) title.textContent = CAMERA_MODEL;
      if (type) type.textContent = 'LITE EDITION · TRAVEL COMPACT';
      if (image) image.alt = CAMERA_MODEL + ' camera';
      gear.setAttribute('data-model-url', CAMERA_URL);
      gear.setAttribute('title', CAMERA_MODEL);
    }

    return !!(album && openedMeta && gear);
  }

  function watchCameraModel() {
    syncCameraModel();
    if (!document.body || !window.MutationObserver) return;
    var queued = false;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        if (syncCameraModel()) observer.disconnect();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(function () {
      syncCameraModel();
      observer.disconnect();
    }, 8000);
  }

  function init() {
    buildToggle();
    watchCameraModel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
