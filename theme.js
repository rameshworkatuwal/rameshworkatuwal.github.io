/* Theme toggle — dark by default, light optional. Preference saved locally. */
(function () {
  var KEY = 'rk_theme';
  var root = document.documentElement;

  /* Instagram's current brand type is custom/proprietary. Use Plus Jakarta
     Sans as the site's open webfont counterpart and apply one consistent
     Instagram-inspired type system everywhere, instead of mixing three
     display/body families across pages. */
  function installInstagramTypeSystem() {
    if (!document.querySelector('link[data-rk-instagram-font]')) {
      var font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
      font.setAttribute('data-rk-instagram-font', 'true');
      document.head.appendChild(font);
    }

    if (document.getElementById('rk-instagram-type')) return;
    var type = document.createElement('style');
    type.id = 'rk-instagram-type';
    type.textContent = `
:root{
  --rk-ig-sans:'Plus Jakarta Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
}

html,body,
button,input,textarea,select,
a,p,li,label,small,strong,b,em,
h1,h2,h3,h4,h5,h6{
  font-family:var(--rk-ig-sans)!important;
}
body{
  font-optical-sizing:auto;
  font-synthesis:none;
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  letter-spacing:-.006em;
}

/* Brand/display — compact, confident, modern. */
h1,h2,h3,h4,h5,h6,
.hero-name,.page-title,.portfolio-title,
.panel-intro h2,.gal-set-head h3,
.album-folder strong,
#gear-panel .gear-heading h2,
#gear-panel .gear-card-copy h3,
.exp-card .job-title,.skill-card h3,
.youtube-title,.blog-title{
  font-family:var(--rk-ig-sans)!important;
  font-weight:800!important;
  letter-spacing:-.052em!important;
  font-variation-settings:'wght' 800;
}

/* UI/navigation — similar clean rhythm to Instagram product UI. */
nav,.nav-logo,.nav-links,.nav-links a,.nav-more-button,
.btn,button,.roles,.eyebrow,.page-label,
.portfolio-tab,.portfolio-tab strong,
.album-count,.camera-meta,
#gear-panel .gear-eyebrow,
#gear-panel .gear-number,
#gear-panel .gear-type{
  font-family:var(--rk-ig-sans)!important;
}
.nav-logo,.nav-links a,.nav-more-button,
.btn,.portfolio-tab strong{
  font-weight:600!important;
  letter-spacing:-.018em!important;
}

/* Body copy keeps the lighter, airy Instagram-Sans-like feel. */
p,li,.hero-subtitle,.about-text,.info-row,
.job-points,.skill-desc,.gal-set-note,
.portfolio-panel-hint{
  font-weight:400;
  letter-spacing:-.012em;
}

/* Small uppercase labels need tracking, not the old extra-wide spacing. */
.page-label,.eyebrow,
#gear-panel .gear-eyebrow,
#gear-panel .gear-number,
#gear-panel .gear-type{
  font-weight:700!important;
  letter-spacing:.105em!important;
}

@media(max-width:620px){
  h1,h2,h3,h4,h5,h6,
  .hero-name,.page-title,.portfolio-title,
  .panel-intro h2,.gal-set-head h3,
  #gear-panel .gear-heading h2{
    letter-spacing:-.042em!important;
  }
}
`;
    document.head.appendChild(type);
  }

  installInstagramTypeSystem();

  function current() {
    try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; }
  }
  function apply(t) {
    if (t === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  }
  apply(current());

  function icons(btn, t) {
    btn.innerHTML = t === 'light'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }

  function build() {
    var b = document.createElement('button');
    b.id = 'themeToggle';
    b.style.cssText =
      'position:fixed;right:70px;bottom:18px;z-index:9998;width:42px;height:42px;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;cursor:pointer;' +
      'border:1px solid var(--line);background:var(--surface);color:var(--blue);' +
      'backdrop-filter:blur(10px);box-shadow:0 6px 20px rgba(0,0,0,.25);' +
      'transition:transform .25s,border-color .25s;';
    b.onmouseenter = function () { b.style.transform = 'scale(1.08)'; b.style.borderColor = 'var(--blue)'; };
    b.onmouseleave = function () { b.style.transform = 'scale(1)'; b.style.borderColor = 'var(--line)'; };
    icons(b, current());
    b.addEventListener('click', function () {
      var next = current() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      root.style.transition = 'none';
      apply(next);
      icons(b, next);
    });
    document.body.appendChild(b);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
