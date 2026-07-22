/* Theme toggle — dark by default, light optional. Preference saved locally. */
(function () {
  var KEY = 'rk_theme';
  var root = document.documentElement;

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
