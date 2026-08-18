/* Theme toggle — dark by default, light optional. Preference saved locally. */
(function () {
  var KEY = 'rk_theme';
  var root = document.documentElement;

  /* Instagram's current brand type is custom/proprietary. Use Plus Jakarta
     Sans as the site's open webfont counterpart and apply one consistent
     Instagram-inspired type system everywhere, instead of mixing three
     display/body families across pages. */
  function installInstagramTypeSystem() {
    if (!document.querySelector('link[data-rk-instagram-font]'))