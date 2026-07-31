/* ============================================================
   LIVE LOCAL WEATHER + CLOCK  (nav widget)

   Shows the visitor's own city, their local time, and live weather,
   with an animated background that matches the conditions.

   How the location is worked out, in order:
     1. A precise position the visitor previously granted (kept in
        localStorage on their device only).
     2. Otherwise their IANA time zone — "Asia/Kathmandu" tells us the
        city without asking permission, without an IP lookup service,
        and without any tracking.
     3. If that name can't be geocoded, the widget stays hidden rather
        than showing something wrong.

   APIs: Open-Meteo (weather + geocoding) and BigDataCloud (reverse
   geocoding). Both are free, keyless and CORS-enabled, so this works
   from a static GitHub Pages site with no backend.

   The markup is injected here rather than pasted into all 11 pages,
   so there is exactly one place to change it.
   ============================================================ */
(function () {
  'use strict';

  var nav = document.querySelector('nav');
  var links = nav && nav.querySelector('.nav-links');
  if (!nav || !links) return;
  // Sit straight after the logo. index.html also has a mobile menu button
  // between the logo and the links, and the widget belongs before it.
  var logo = nav.querySelector('.nav-logo');
  var anchor = logo ? logo.nextSibling : links;

  var PLACE_KEY = 'rk_wx_place';
  var DATA_KEY  = 'rk_wx_data';
  var TTL_MS    = 10 * 60 * 1000;   // re-fetch at most every 10 minutes

  /* ---------- tiny storage helpers (private mode can throw) ---------- */
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  /* ---------- WMO weather codes -> our buckets ---------- */
  var CODES = {
    0:['clear','Clear'],
    1:['partly','Mainly clear'], 2:['partly','Partly cloudy'], 3:['cloudy','Overcast'],
    45:['fog','Fog'], 48:['fog','Rime fog'],
    51:['drizzle','Light drizzle'], 53:['drizzle','Drizzle'], 55:['drizzle','Heavy drizzle'],
    56:['drizzle','Freezing drizzle'], 57:['drizzle','Freezing drizzle'],
    61:['rain','Light rain'], 63:['rain','Rain'], 65:['rain','Heavy rain'],
    66:['rain','Freezing rain'], 67:['rain','Freezing rain'],
    71:['snow','Light snow'], 73:['snow','Snow'], 75:['snow','Heavy snow'], 77:['snow','Snow grains'],
    80:['rain','Light showers'], 81:['rain','Showers'], 82:['rain','Violent showers'],
    85:['snow','Snow showers'], 86:['snow','Heavy snow showers'],
    95:['storm','Thunderstorm'], 96:['storm','Thunderstorm, hail'], 99:['storm','Thunderstorm, hail']
  };
  function decode(code) { return CODES[code] || ['cloudy', 'Cloudy']; }

  /* ---------- icons ---------- */
  var S = 'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var CLOUD = '<path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5.2 11.2 3.9 3.9 0 0 0 6 19z" ' + S + '/>';
  var ICONS = {
    clearDay:   '<circle cx="12" cy="12" r="4.2" ' + S + '/><path d="M12 2.4v2.1M12 19.5v2.1M4.2 12H2.1M21.9 12h-2.1M6.5 6.5 5 5M19 19l-1.5-1.5M17.5 6.5 19 5M5 19l1.5-1.5" ' + S + '/>',
    clearNight: '<path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5z" ' + S + '/>',
    partlyDay:  '<circle cx="8.2" cy="8.2" r="3.1" ' + S + '/><path d="M8.2 1.9v1.6M8.2 12.9v1.6M1.9 8.2h1.6M12.9 8.2h1.6M3.8 3.8l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.8l-1.1 1.1M4.9 11.5l-1.1 1.1" ' + S + '/><path d="M17.8 20.5a3.7 3.7 0 0 0 .4-7.38 5.3 5.3 0 0 0-10.4.9 3.2 3.2 0 0 0 .6 6.48z" ' + S + '/>',
    partlyNight:'<path d="M15.6 9.2A5.6 5.6 0 0 1 8.4 2a5.7 5.7 0 1 0 7.2 7.2z" ' + S + '/><path d="M17.8 20.5a3.7 3.7 0 0 0 .4-7.38 5.3 5.3 0 0 0-10.4.9 3.2 3.2 0 0 0 .6 6.48z" ' + S + '/>',
    cloudy:     CLOUD,
    fog:        CLOUD + '<path d="M4 21h9M8 17.6h11" ' + S + '/>',
    drizzle:    '<path d="M17.5 16.5a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5.2 8.7 3.9 3.9 0 0 0 6 16.5z" ' + S + '/><path d="M9 19.4v1.3M13 19v1.9M17 19.4v1.3" ' + S + '/>',
    rain:       '<path d="M17.5 15.5a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5.2 7.7 3.9 3.9 0 0 0 6 15.5z" ' + S + '/><path d="m9 18.4-1 3M13.2 18.4l-1 3M17.4 18.4l-1 3" ' + S + '/>',
    snow:       '<path d="M17.5 15.5a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5.2 7.7 3.9 3.9 0 0 0 6 15.5z" ' + S + '/><path d="M9 19h.01M13 19h.01M17 19h.01M11 21.5h.01M15 21.5h.01" ' + S + '/>',
    storm:      '<path d="M17.5 14.5a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5.2 6.7 3.9 3.9 0 0 0 6 14.5z" ' + S + '/><path d="m13 15-3.2 4.4h3.4L11.4 23" ' + S + '/>'
  };
  function iconFor(cond, isDay) {
    if (cond === 'clear')  return isDay ? ICONS.clearDay  : ICONS.clearNight;
    if (cond === 'partly') return isDay ? ICONS.partlyDay : ICONS.partlyNight;
    return ICONS[cond] || ICONS.cloudy;
  }

  /* ---------- animated backdrop, built per condition ---------- */
  function backdrop(cond, isDay) {
    var i, html = '';
    if (cond === 'clear' && isDay)   return '<span class="wx-sun"></span>';
    if (cond === 'clear')            { for (i = 0; i < 7; i++) html += star(i); return html; }
    if (cond === 'partly' || cond === 'cloudy') {
      if (cond === 'partly' && isDay) html += '<span class="wx-sun wx-sun-peek"></span>';
      for (i = 0; i < 3; i++) html += '<span class="wx-cloud wx-cloud-' + i + '"></span>';
      return html;
    }
    if (cond === 'fog')  return '<span class="wx-fog wx-fog-0"></span><span class="wx-fog wx-fog-1"></span>';
    if (cond === 'drizzle' || cond === 'rain') {
      var n = cond === 'rain' ? 14 : 9;
      for (i = 0; i < n; i++) html += drop(i, n);
      return html;
    }
    if (cond === 'snow') { for (i = 0; i < 11; i++) html += flake(i); return html; }
    if (cond === 'storm') {
      for (i = 0; i < 12; i++) html += drop(i, 12);
      return html + '<span class="wx-flash"></span>';
    }
    return '';
  }
  // Deterministic scatter — no Math.random, so the layout can't jitter
  // between renders on the same page.
  function drop(i, n) {
    var left = (i * 97) % 100, delay = ((i * 37) % 100) / 100, dur = 0.55 + ((i * 23) % 40) / 100;
    return '<i class="wx-drop" style="left:' + left + '%;animation-delay:' + delay +
           's;animation-duration:' + dur + 's;opacity:' + (0.35 + (i % 3) * 0.2) + '"></i>';
  }
  function flake(i) {
    var left = (i * 91) % 100, delay = ((i * 53) % 100) / 100 * 3, dur = 3 + ((i * 29) % 30) / 10;
    return '<i class="wx-flake" style="left:' + left + '%;animation-delay:' + delay +
           's;animation-duration:' + dur + 's"></i>';
  }
  function star(i) {
    var left = (i * 83) % 96, top = ((i * 47) % 70) + 10, delay = ((i * 31) % 100) / 100 * 3;
    return '<i class="wx-star" style="left:' + left + '%;top:' + top + '%;animation-delay:' + delay + 's"></i>';
  }

  /* ---------- markup ---------- */
  var el = document.createElement('div');
  el.className = 'wx';
  el.hidden = true;
  el.innerHTML =
    '<button class="wx-pill" type="button" aria-expanded="false" aria-label="Local weather and time">' +
      '<span class="wx-anim" aria-hidden="true"></span>' +
      '<span class="wx-icon" aria-hidden="true"></span>' +
      '<span class="wx-temp"></span>' +
      '<span class="wx-dot" aria-hidden="true"></span>' +
      '<span class="wx-city"></span>' +
      '<span class="wx-time"><span class="wx-hh"></span><span class="wx-colon">:</span><span class="wx-mm"></span></span>' +
    '</button>' +
    '<div class="wx-panel" hidden>' +
      '<div class="wx-panel-anim" aria-hidden="true"></div>' +
      '<div class="wx-panel-body">' +
        '<div class="wx-panel-head">' +
          '<div class="wx-panel-place"><strong class="wx-panel-city"></strong><span class="wx-panel-desc"></span></div>' +
          '<div class="wx-panel-temp"></div>' +
        '</div>' +
        '<div class="wx-panel-grid">' +
          '<div><span>Feels like</span><b class="wx-feels">—</b></div>' +
          '<div><span>Humidity</span><b class="wx-hum">—</b></div>' +
          '<div><span>Wind</span><b class="wx-wind">—</b></div>' +
          '<div><span>Local time</span><b class="wx-full">—</b></div>' +
        '</div>' +
        '<button type="button" class="wx-locate">Use my exact location</button>' +
        '<p class="wx-note"></p>' +
      '</div>' +
    '</div>';
  nav.insertBefore(el, anchor);

  var q = function (s) { return el.querySelector(s); };
  var pill = q('.wx-pill'), panel = q('.wx-panel');

  /* ---------- clock ---------- */
  var tz = null, lastHH = '', lastMM = '';
  function tickClock() {
    if (!tz) return;
    var now = new Date(), hh, mm;
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
      }).format(now).split(':');
      hh = parts[0]; mm = parts[1];
    } catch (e) { return; }
    if (hh !== lastHH) { q('.wx-hh').textContent = hh; lastHH = hh; }
    if (mm !== lastMM) { q('.wx-mm').textContent = mm; lastMM = mm; }
    if (!panel.hidden) {
      try {
        q('.wx-full').textContent = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
        }).format(now);
      } catch (e) {}
    }
  }

  /* ---------- render ---------- */
  function render(place, wx) {
    var cur   = wx.current || {};
    var code  = typeof cur.weather_code === 'number' ? cur.weather_code : 3;
    var isDay = cur.is_day !== 0;
    var d     = decode(code);
    var cond  = d[0], desc = d[1];
    var temp  = Math.round(cur.temperature_2m);

    el.setAttribute('data-cond', cond);
    el.setAttribute('data-day', isDay ? '1' : '0');
    q('.wx-icon').innerHTML = '<svg viewBox="0 0 24 24">' + iconFor(cond, isDay) + '</svg>';
    q('.wx-anim').innerHTML = backdrop(cond, isDay);
    q('.wx-panel-anim').innerHTML = backdrop(cond, isDay);
    q('.wx-temp').textContent = isFinite(temp) ? temp + '°' : '—';
    q('.wx-city').textContent = place.city;
    q('.wx-panel-city').textContent = place.city + (place.country ? ', ' + place.country : '');
    q('.wx-panel-desc').textContent = desc;
    q('.wx-panel-temp').textContent = isFinite(temp) ? temp + '°' : '—';
    q('.wx-feels').textContent = isFinite(cur.apparent_temperature) ? Math.round(cur.apparent_temperature) + '°' : '—';
    q('.wx-hum').textContent   = isFinite(cur.relative_humidity_2m) ? Math.round(cur.relative_humidity_2m) + '%' : '—';
    q('.wx-wind').textContent  = isFinite(cur.wind_speed_10m) ? Math.round(cur.wind_speed_10m) + ' km/h' : '—';
    q('.wx-note').textContent = place.precise
      ? 'Using your exact location. It stays on this device.'
      : 'Detected from your time zone. Nothing leaves this device.';
    q('.wx-locate').hidden = !!place.precise;

    tz = place.timezone || wx.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    lastHH = lastMM = '';
    tickClock();
    el.hidden = false;
    el.classList.add('is-in');
  }

  /* ---------- data ---------- */
  function json(url) {
    return fetch(url, { mode: 'cors' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function fetchWeather(place) {
    var url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + encodeURIComponent(place.lat) +
      '&longitude=' + encodeURIComponent(place.lon) +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m' +
      '&timezone=auto';
    return json(url);
  }

  // "Asia/Kathmandu" -> "Kathmandu", "America/New_York" -> "New York"
  function cityFromTimeZone(zone) {
    if (!zone || zone.indexOf('/') === -1) return null;
    var last = zone.split('/').pop();
    return last.replace(/_/g, ' ');
  }

  function placeFromTimeZone() {
    var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var guess = cityFromTimeZone(zone);
    if (!guess) return Promise.reject(new Error('no timezone city'));
    return json('https://geocoding-api.open-meteo.com/v1/search?count=1&format=json&language=en&name=' +
                encodeURIComponent(guess))
      .then(function (r) {
        var hit = r && r.results && r.results[0];
        if (!hit) throw new Error('not geocoded');
        return {
          city: hit.name, country: hit.country || '',
          lat: hit.latitude, lon: hit.longitude,
          timezone: hit.timezone || zone, precise: false
        };
      });
  }

  function placeFromCoords(lat, lon) {
    return json('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat +
                '&longitude=' + lon + '&localityLanguage=en')
      .then(function (r) {
        return {
          city: r.city || r.locality || r.principalSubdivision || cityFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Your area',
          country: r.countryName || '',
          lat: lat, lon: lon,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          precise: true
        };
      })
      .catch(function () {
        // Reverse geocoding is a nicety — the weather still works without it.
        return {
          city: cityFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Your area',
          country: '', lat: lat, lon: lon,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, precise: true
        };
      });
  }

  function load(place, useCache) {
    var cached = useCache ? read(DATA_KEY) : null;
    if (cached && cached.wx && (Date.now() - cached.at) < TTL_MS &&
        cached.lat === place.lat && cached.lon === place.lon) {
      render(place, cached.wx);
      return Promise.resolve();
    }
    return fetchWeather(place).then(function (wx) {
      write(DATA_KEY, { at: Date.now(), lat: place.lat, lon: place.lon, wx: wx });
      render(place, wx);
    });
  }

  function start() {
    var saved = read(PLACE_KEY);
    var chosen = saved && isFinite(saved.lat) ? Promise.resolve(saved) : placeFromTimeZone();
    chosen
      .then(function (place) { write(PLACE_KEY, place); return load(place, true); })
      .catch(function () { el.hidden = true; });   // stay silent rather than show something wrong
  }

  /* ---------- interaction ---------- */
  pill.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = panel.hidden;
    panel.hidden = !open;
    pill.setAttribute('aria-expanded', open ? 'true' : 'false');
    el.classList.toggle('is-open', open);
    if (open) tickClock();
  });

  document.addEventListener('click', function (e) {
    if (!panel.hidden && !el.contains(e.target)) {
      panel.hidden = true;
      pill.setAttribute('aria-expanded', 'false');
      el.classList.remove('is-open');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      pill.setAttribute('aria-expanded', 'false');
      el.classList.remove('is-open');
      pill.focus();
    }
  });

  q('.wx-locate').addEventListener('click', function () {
    var btn = this;
    if (!navigator.geolocation) { btn.textContent = 'Not supported here'; return; }
    btn.disabled = true;
    btn.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = +pos.coords.latitude.toFixed(3);   // street-level precision isn't needed for weather
      var lon = +pos.coords.longitude.toFixed(3);
      placeFromCoords(lat, lon).then(function (place) {
        write(PLACE_KEY, place);
        return load(place, false);
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'Use my exact location';
      });
    }, function () {
      btn.disabled = false;
      btn.textContent = 'Permission denied';
      setTimeout(function () { btn.textContent = 'Use my exact location'; }, 2500);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  });

  setInterval(tickClock, 1000);
  // Coming back to the tab after a while should not show a stale reading.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    tickClock();
    var saved = read(PLACE_KEY);
    if (saved && isFinite(saved.lat)) load(saved, true).catch(function () {});
  });

  start();
})();
