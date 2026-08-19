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

/* ---------- Photography overview ----------
   A real grid keeps every row on the same rails. No centered partial rows,
   no different card widths, and no big empty gutters on both sides. */
.gallery-page{
  width:min(95%,1540px)!important;
  max-width:1540px!important;
  margin-left:auto!important;
  margin-right:auto!important;
  padding-left:0!important;
  padding-right:0!important;
}
.album-folders{
  display:grid!important;
  grid-template-columns:repeat(5,minmax(0,1fr))!important;
  grid-auto-flow:row!important;
  align-items:stretch!important;
  justify-content:stretch!important;
  gap:18px!important;
  width:100%!important;
  max-width:1480px!important;
  margin-left:auto!important;
  margin-right:auto!important;
}
.album-folder{
  width:100%!important;
  min-width:0!important;
  max-width:none!important;
  height:100%!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
}
.album-folder-frame{
  aspect-ratio:16/10!important;
  border-radius:13px!important;
}
.album-folder-copy{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  align-items:start!important;
  column-gap:.55rem!important;
  min-height:78px!important;
  margin:.55rem .08rem .05rem!important;
}
.album-folder-title{
  display:flex!important;
  flex-direction:column!important;
  align-items:flex-start!important;
  gap:.34rem!important;
  min-width:0!important;
}
.album-folder strong{
  display:block!important;
  width:100%!important;
  min-height:2.18em!important;
  margin:0!important;
  font-size:.94rem!important;
  line-height:1.09!important;
  overflow-wrap:anywhere!important;
}
.album-count{
  align-self:start!important;
  margin:0!important;
  padding:.28rem .52rem!important;
  font-size:.64rem!important;
  line-height:1!important;
  white-space:nowrap!important;
}
.album-folder small{
  max-width:100%!important;
  margin:0!important;
  font-size:.62rem!important;
  line-height:1.24!important;
  letter-spacing:.055em!important;
  overflow-wrap:anywhere!important;
}

/* Canon/meta badge fix. gallery-premium.css styles every album image as a
   cover image, so logo images must be explicitly reset inside metadata. */
.album-folder .camera-meta,
.gal-set-head .camera-meta{
  display:inline-flex!important;
  align-items:center!important;
  gap:.36rem!important;
  max-width:100%!important;
  width:max-content!important;
  min-width:0!important;
  padding:.24rem .48rem!important;
  border-radius:999px!important;
  overflow:hidden!important;
}
.album-folder .camera-meta img,
.gal-set-head .camera-meta img{
  position:static!important;
  inset:auto!important;
  display:block!important;
  flex:0 0 auto!important;
  width:34px!important;
  height:12px!important;
  max-width:34px!important;
  object-fit:contain!important;
  transform:none!important;
  filter:none!important;
  opacity:1!important;
}
.album-folder .camera-meta b,
.gal-set-head .camera-meta b{
  min-width:0!important;
  margin:0!important;
  font-size:.58rem!important;
  line-height:1.15!important;
  white-space:normal!important;
  overflow-wrap:anywhere!important;
}
.gal-set-head .camera-meta img{
  width:45px!important;
  height:16px!important;
  max-width:45px!important;
}
.gal-set-head .camera-meta b{
  font-size:.68rem!important;
}

a[href="#photography-2015"] small{
  max-width:180px!important;
  white-space:normal!important;
  letter-spacing:.04em!important;
}
#photography-2015 .camera-meta{
  max-width:min(100%,390px)!important;
}

/* Slightly calmer heading/card proportion on the overview. */
.portfolio-panel .panel-intro h2{
  font-size:clamp(2.7rem,4.7vw,4.6rem)!important;
  line-height:.96!important;
}

/* Album cards should never sit half-faded while already visible. Keep hover
   motion from the premium skin, but remove reveal opacity/blur leftovers. */
.album-folders .album-folder,
.album-folders .album-folder.in,
.album-folders .album-folder[data-anim]{
  opacity:1!important;
  filter:none!important;
}

/* ---------- Gear ---------- */
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

@media(max-width:1280px){
  .gallery-page{width:min(94%,1180px)!important}
  .album-folders{grid-template-columns:repeat(4,minmax(0,1fr))!important;max-width:1160px!important}
}
@media(max-width:980px){
  .album-folders{grid-template-columns:repeat(3,minmax(0,1fr))!important;max-width:840px!important}
}
@media(max-width:720px){
  .gallery-page{width:92%!important}
  .album-folders{grid-template-columns:repeat(2,minmax(0,1fr))!important;max-width:590px!important;gap:14px!important}
  #gear-panel .gear-card{
    flex-basis:min(76vw,255px)!important;
    width:min(76vw,255px)!important;
    max-width:255px!important;
  }
}
@media(max-width:470px){
  .album-folders{grid-template-columns:1fr!important;max-width:320px!important;gap:1rem!important}
  .album-folder-copy{min-height:72px!important}
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
