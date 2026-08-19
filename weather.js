/* ============================================================
   LOCAL WEATHER + VISITOR CLOCK V4
   - visitor city / timezone
   - live HH:MM:SS clock
   - current weather via Open-Meteo
   - adds a compact Live Sports nav entry on every page
   ============================================================ */
(function () {
  'use strict';

  var nav = document.querySelector('nav');
  var links = nav && nav.querySelector('.nav-links');
  if (!nav || !links) return;

  /* ---------- global Live Sports nav ---------- */
  function ensureSportsNav() {
    if (links.querySelector('a[href="sports.html"]')) return;

    var a = document.createElement('a');
    a.href = 'sports.html';
    a.className = 'sports-nav-link';
    a.innerHTML = '<span class="sports-nav-dot" aria-hidden="true"></span>Live';
    if (/\/sports\.html$/i.test(location.pathname)) a.classList.add('active');

    var blog = links.querySelector('a[href="blog.html"]');
    if (links.tagName === 'UL' || links.tagName === 'OL') {
      var li = document.createElement('li');
      li.appendChild(a);
      if (blog && blog.parentElement) links.insertBefore(li, blog.parentElement);
      else links.appendChild(li);
    } else {
      if (blog) links.insertBefore(a, blog);
      else links.appendChild(a);
    }

    if (!document.getElementById('sports-nav-style')) {
      var style = document.createElement('style');
      style.id = 'sports-nav-style';
      style.textContent = '.sports-nav-link{display:inline-flex!important;align-items:center;gap:.38rem}.sports-nav-dot{width:6px;height:6px;border-radius:50%;background:#ff416c;box-shadow:0 0 0 0 rgba(255,65,108,.55);animation:sportsNavPulse 1.8s ease-out infinite}@keyframes sportsNavPulse{70%{box-shadow:0 0 0 7px rgba(255,65,108,0)}}@media(prefers-reduced-motion:reduce){.sports-nav-dot{animation:none}}';
      document.head.appendChild(style);
    }
  }
  ensureSportsNav();

  var logo = nav.querySelector('.nav-logo');
  var anchor = logo ? logo.nextSibling : links;

  var PLACE_KEY = 'rk_wx_place_v4';
  var DATA_KEY = 'rk_wx_data_v4';
  var AUTO_KEY = 'rk_wx_auto_location_v2';
  var WEATHER_TTL = 10 * 60 * 1000;
  var tz = '';
  var lastHH = '', lastMM = '', lastSS = '';

  var TZ_ALIASES = {
    'Asia/Katmandu':'Asia/Kathmandu','Asia/Calcutta':'Asia/Kolkata','Asia/Saigon':'Asia/Ho_Chi_Minh',
    'Asia/Rangoon':'Asia/Yangon','Asia/Dacca':'Asia/Dhaka','Asia/Thimbu':'Asia/Thimphu',
    'Europe/Kiev':'Europe/Kyiv','Africa/Asmera':'Africa/Asmara','Pacific/Ponape':'Pacific/Pohnpei'
  };

  function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function zoneNow() {
    var z = '';
    try { z = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return TZ_ALIASES[z] || z;
  }
  function cityFromZone(zone) {
    if (!zone || zone.indexOf('/') < 0) return '';
    return zone.split('/').pop().replace(/_/g, ' ');
  }
  function json(url) {
    return fetch(url, { mode:'cors', cache:'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  var CODES = {
    0:['clear','Clear'],1:['partly','Mainly clear'],2:['partly','Partly cloudy'],3:['cloudy','Overcast'],
    45:['fog','Fog'],48:['fog','Rime fog'],51:['drizzle','Light drizzle'],53:['drizzle','Drizzle'],55:['drizzle','Heavy drizzle'],
    61:['rain','Light rain'],63:['rain','Rain'],65:['rain','Heavy rain'],71:['snow','Light snow'],73:['snow','Snow'],75:['snow','Heavy snow'],
    80:['rain','Showers'],81:['rain','Showers'],82:['rain','Heavy showers'],85:['snow','Snow showers'],86:['snow','Heavy snow showers'],
    95:['storm','Thunderstorm'],96:['storm','Thunderstorm'],99:['storm','Thunderstorm']
  };
  function decode(code) { return CODES[code] || ['cloudy','Cloudy']; }

  var ICON = {
    clear:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
    partly:'<path d="M17.5 19H6a4 4 0 0 1-.3-8A6.3 6.3 0 0 1 18 10.5 4.3 4.3 0 0 1 17.5 19Z"/>',
    cloudy:'<path d="M17.5 19H6a4 4 0 0 1-.3-8A6.3 6.3 0 0 1 18 10.5 4.3 4.3 0 0 1 17.5 19Z"/>',
    fog:'<path d="M5 9h14M3 13h18M6 17h12"/>',
    drizzle:'<path d="M18 14H6a4 4 0 0 1-.3-8A6.2 6.2 0 0 1 18 5.5 4.2 4.2 0 0 1 18 14Z"/><path d="M8 17v2M12 17v3M16 17v2"/>',
    rain:'<path d="M18 13H6a4 4 0 0 1-.3-8A6.2 6.2 0 0 1 18 4.5 4.2 4.2 0 0 1 18 13Z"/><path d="m8 16-1 4m5-4-1 4m5-4-1 4"/>',
    snow:'<path d="M18 13H6a4 4 0 0 1-.3-8A6.2 6.2 0 0 1 18 4.5 4.2 4.2 0 0 1 18 13Z"/><path d="M8 17h.01M12 19h.01M16 17h.01"/>',
    storm:'<path d="M18 13H6a4 4 0 0 1-.3-8A6.2 6.2 0 0 1 18 4.5 4.2 4.2 0 0 1 18 13Z"/><path d="m13 14-4 5h4l-2 4"/>'
  };

  var el = document.createElement('div');
  el.className = 'wx';
  el.hidden = true;
  el.innerHTML =
    '<button class="wx-pill" type="button" aria-expanded="false" aria-label="Local weather and time">' +
      '<span class="wx-anim" aria-hidden="true"></span>' +
      '<span class="wx-icon" aria-hidden="true"></span>' +
      '<span class="wx-temp"></span><span class="wx-dot" aria-hidden="true"></span>' +
      '<span class="wx-city"></span>' +
      '<span class="wx-time"><span class="wx-hh"></span><span class="wx-colon">:</span><span class="wx-mm"></span><span class="wx-colon">:</span><span class="wx-ss"></span></span>' +
    '</button>' +
    '<div class="wx-panel" hidden>' +
      '<div class="wx-panel-anim" aria-hidden="true"></div><div class="wx-panel-scrim" aria-hidden="true"></div>' +
      '<div class="wx-panel-body">' +
        '<p class="wx-panel-kicker"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 3 3 10.5l7.6 2.9L13.5 21z"/></svg><span class="wx-panel-where">My Location</span></p>' +
        '<h3 class="wx-panel-city"></h3><p class="wx-panel-temp"></p><p class="wx-panel-desc"></p>' +
        '<p class="wx-panel-hl"><span class="wx-hi">—</span><span class="wx-lo">—</span></p>' +
        '<div class="wx-panel-grid"><div><span>Feels</span><b class="wx-feels">—</b></div><div><span>Humidity</span><b class="wx-hum">—</b></div><div><span>Wind</span><b class="wx-wind">—</b></div><div><span>Local time</span><b class="wx-full">—</b></div></div>' +
        '<button type="button" class="wx-locate">Use my exact location</button><p class="wx-note"></p>' +
      '</div>' +
    '</div>';
  nav.insertBefore(el, anchor);

  var q = function (s) { return el.querySelector(s); };
  var pill = q('.wx-pill');
  var panel = q('.wx-panel');

  function tickClock() {
    if (!tz) return;
    var now = new Date();
    var parts;
    try {
      parts = new Intl.DateTimeFormat('en-GB', {
        timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
      }).formatToParts(now);
    } catch (e) { return; }
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var hh = map.hour || '00', mm = map.minute || '00', ss = map.second || '00';
    if (hh !== lastHH) { q('.wx-hh').textContent = hh; lastHH = hh; }
    if (mm !== lastMM) { q('.wx-mm').textContent = mm; lastMM = mm; }
    if (ss !== lastSS) { q('.wx-ss').textContent = ss; lastSS = ss; }
    if (!panel.hidden) {
      try {
        q('.wx-full').textContent = new Intl.DateTimeFormat('en-GB', {
          timeZone:tz,weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
        }).format(now);
      } catch (e) {}
    }
  }

  function render(place, wx) {
    var cur = wx.current || {};
    var code = typeof cur.weather_code === 'number' ? cur.weather_code : 3;
    var info = decode(code);
    var cond = info[0], desc = info[1];
    var temp = Math.round(cur.temperature_2m);
    var daily = wx.daily || {};
    var hi = daily.temperature_2m_max && daily.temperature_2m_max[0];
    var lo = daily.temperature_2m_min && daily.temperature_2m_min[0];

    el.setAttribute('data-cond', cond);
    el.setAttribute('data-day', cur.is_day === 0 ? '0' : '1');
    q('.wx-icon').innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICON[cond] || ICON.cloudy) + '</svg>';
    q('.wx-temp').textContent = isFinite(temp) ? temp + '°' : '—';
    q('.wx-city').textContent = place.city || 'Local';
    q('.wx-panel-city').textContent = place.city || 'Local';
    q('.wx-panel-where').textContent = place.precise ? ('My Location' + (place.country ? ' · ' + place.country : '')) : (place.country || 'Local weather');
    q('.wx-panel-temp').textContent = isFinite(temp) ? temp + '°' : '—';
    q('.wx-panel-desc').textContent = desc;
    q('.wx-hi').textContent = isFinite(hi) ? 'H:' + Math.round(hi) + '°' : '';
    q('.wx-lo').textContent = isFinite(lo) ? 'L:' + Math.round(lo) + '°' : '';
    q('.wx-feels').textContent = isFinite(cur.apparent_temperature) ? Math.round(cur.apparent_temperature) + '°' : '—';
    q('.wx-hum').textContent = isFinite(cur.relative_humidity_2m) ? Math.round(cur.relative_humidity_2m) + '%' : '—';
    q('.wx-wind').textContent = isFinite(cur.wind_speed_10m) ? Math.round(cur.wind_speed_10m) + ' km/h' : '—';
    q('.wx-note').textContent = place.precise ? 'Using your approximate location for local weather.' : 'City estimated from your device time zone.';
    q('.wx-locate').hidden = !!place.precise;

    tz = place.timezone || wx.timezone || zoneNow();
    lastHH = lastMM = lastSS = '';
    tickClock();
    el.hidden = false;
    el.classList.add('is-in');
  }

  function fetchWeather(place) {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(place.lat) +
      '&longitude=' + encodeURIComponent(place.lon) +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto';
    return json(url);
  }

  function load(place, useCache) {
    var cache = useCache ? read(DATA_KEY) : null;
    if (cache && cache.wx && cache.lat === place.lat && cache.lon === place.lon && Date.now() - cache.at < WEATHER_TTL) {
      render(place, cache.wx);
      return Promise.resolve();
    }
    return fetchWeather(place).then(function (wx) {
      write(DATA_KEY, { at:Date.now(),lat:place.lat,lon:place.lon,wx:wx });
      render(place, wx);
    });
  }

  function placeFromZone() {
    var zone = zoneNow();
    var city = cityFromZone(zone);
    if (!city) return Promise.reject(new Error('No timezone city'));
    return json('https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&format=json&name=' + encodeURIComponent(city)).then(function (r) {
      var list = (r && r.results) || [];
      if (!list.length) throw new Error('No geocode');
      var best = list[0];
      for (var i = 0; i < list.length; i++) {
        if (list[i].timezone === zone) { best = list[i]; break; }
      }
      return { city:best.name || city,country:best.country || '',lat:best.latitude,lon:best.longitude,timezone:zone || best.timezone,precise:false };
    });
  }

  function placeFromCoords(lat, lon) {
    return json('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + encodeURIComponent(lat) + '&longitude=' + encodeURIComponent(lon) + '&localityLanguage=en').then(function (r) {
      return { city:r.city || r.locality || r.principalSubdivision || cityFromZone(zoneNow()) || 'Local',country:r.countryName || '',lat:lat,lon:lon,timezone:zoneNow(),precise:true };
    }).catch(function () {
      return { city:cityFromZone(zoneNow()) || 'Local',country:'',lat:lat,lon:lon,timezone:zoneNow(),precise:true };
    });
  }

  function requestCurrentPlace() {
    if (!navigator.geolocation) return Promise.reject(new Error('Geolocation unavailable'));
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = +pos.coords.latitude.toFixed(2);
        var lon = +pos.coords.longitude.toFixed(2);
        placeFromCoords(lat, lon).then(resolve, reject);
      }, reject, { enableHighAccuracy:false,timeout:9000,maximumAge:600000 });
    });
  }

  function start() {
    var saved = read(PLACE_KEY);
    var first = saved && isFinite(saved.lat) ? Promise.resolve(saved) : placeFromZone();
    first.then(function (place) {
      write(PLACE_KEY, place);
      return load(place, true);
    }).catch(function () { el.hidden = true; });

    if (!read(AUTO_KEY) && navigator.geolocation) {
      write(AUTO_KEY, { at:Date.now() });
      requestCurrentPlace().then(function (place) {
        write(PLACE_KEY, place);
        return load(place, false);
      }).catch(function () {});
    }
  }

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
      pill.setAttribute('aria-expanded','false');
      el.classList.remove('is-open');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      pill.setAttribute('aria-expanded','false');
      el.classList.remove('is-open');
      pill.focus();
    }
  });

  q('.wx-locate').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Locating…';
    requestCurrentPlace().then(function (place) {
      write(PLACE_KEY, place);
      return load(place, false);
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Use my exact location';
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Permission denied';
      setTimeout(function () { btn.textContent = 'Use my exact location'; }, 2200);
    });
  });

  setInterval(tickClock, 1000);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    tickClock();
    var saved = read(PLACE_KEY);
    if (saved && isFinite(saved.lat)) load(saved, true).catch(function () {});
  });

  start();
})();
