(function () {
  'use strict';
  var section = document.getElementById('daily-quotes');
  if (!section) return;
  var grid = document.getElementById('quotes-grid');
  var source = document.getElementById('quotes-source');
  var dateLabel = document.getElementById('quotes-date');
  var endpoint = 'https://dummyjson.com/quotes?limit=0';
  var storageKey = 'rk-daily-quotes-v1';
  var fallback = [{"quote":"Make today a small promise kept to your future self.","author":"Daily reminder","source":"original"},{"quote":"You do not need a perfect day to make real progress.","author":"Daily reminder","source":"original"},{"quote":"Give the next ten minutes to the thing that matters.","author":"Daily reminder","source":"original"},{"quote":"Let your effort be steady even when your confidence is not.","author":"Daily reminder","source":"original"},{"quote":"A distant goal becomes closer through ordinary daily action.","author":"Daily reminder","source":"original"},{"quote":"Start where you are, then make that starting point proud.","author":"Daily reminder","source":"original"},{"quote":"Practice turns the difficult into the familiar.","author":"Daily reminder","source":"original"},{"quote":"Protect a little time each day for the life you want.","author":"Daily reminder","source":"original"},{"quote":"One completed step teaches more than a hundred imagined ones.","author":"Daily reminder","source":"original"},{"quote":"Count the days, but also give each day something worth counting.","author":"Daily reminder","source":"original"},{"quote":"Rest when you need to, then return to your direction.","author":"Daily reminder","source":"original"},{"quote":"Build a routine that carries you when motivation takes a break.","author":"Daily reminder","source":"original"},{"quote":"Your next attempt can use everything your last attempt taught you.","author":"Daily reminder","source":"original"},{"quote":"Choose a small action you can finish before today ends.","author":"Daily reminder","source":"original"},{"quote":"Progress can be quiet and still be real.","author":"Daily reminder","source":"original"}];
  var saved = null, shownDay = '', busy = false, lastAttempt = 0;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch (error) {}
  if (saved && (typeof saved.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(saved.day))) saved = null;
  function dayKey(now) {
    return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  }
  function validQuotes(items) {
    if (!Array.isArray(items)) return [];
    var seen = new Set();
    return items.filter(function (item) {
      if (!item || typeof item.quote !== 'string' || typeof item.author !== 'string') return false;
      var text = item.quote.trim();
      if (text.length < 15 || text.length > 260 || seen.has(text)) return false;
      seen.add(text);
      return true;
    }).map(function (item) { return {quote:item.quote.trim(),author:item.author.trim(),source:item.source}; });
  }
  function pick(items, day) {
    // Consecutive Dubai days move through the feed in groups of five.
    var ordinal = Math.floor(Date.parse(day + 'T00:00:00Z') / 86400000);
    var start = ((ordinal * 5) % items.length + items.length) % items.length;
    return Array.from({length:5}, function (_, i) { return items[(start + i) % items.length]; });
  }
  function render(quotes, day, external, stale) {
    grid.replaceChildren();
    quotes.forEach(function (quote, i) {
      var card = document.createElement('figure');
      card.className = 'daily-quote';
      card.style.setProperty('--quote-order', i);
      var number = document.createElement('span');
      number.className = 'daily-quote-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = '0' + (i + 1) + ' / 05';
      var text = document.createElement('blockquote');
      text.textContent = quote.quote;
      var author = document.createElement('figcaption');
      author.textContent = quote.author;
      card.append(number, text, author);
      grid.appendChild(card);
    });
    dateLabel.textContent = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Dubai',day:'numeric',month:'short',year:'numeric'}).format(new Date(day + 'T00:00:00+04:00'));
    source.replaceChildren();
    if (external) {
      source.appendChild(document.createTextNode('Quotes via '));
      var link = document.createElement('a');
      link.href = 'https://dummyjson.com/docs/quotes';
      link.textContent = 'DummyJSON';
      source.appendChild(link);
      if (stale) source.appendChild(document.createTextNode(' · Last saved selection'));
    } else {
      source.textContent = 'Daily reminders';
    }
    shownDay = dayKey(new Date());
  }
  async function refresh() {
    if (document.hidden || busy) return;
    var day = dayKey(new Date());
    var cached = saved && validQuotes(saved.quotes);
    if (cached && cached.length === 5 && saved.day === day && saved.external === true) {
      if (shownDay !== day) render(cached, day, true, false);
      return;
    }
    if (shownDay !== day) {
      if (cached && cached.length === 5 && saved.external === true) render(cached, saved.day, true, true);
      else render(pick(fallback, day), day, false, false);
    }
    if (Date.now() - lastAttempt < 3600000) return;
    lastAttempt = Date.now();
    busy = true;
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    try {
      var response = await fetch(endpoint, {signal:controller.signal,credentials:'omit'});
      if (!response.ok) throw new Error('Quote feed unavailable');
      var data = await response.json();
      var pool = validQuotes(data.quotes).filter(function (item) {
        return /dream|success|achiev|believ|effort|work|begin|start|learn|courage|persist|goal|opportun|future|progress|discipline|possible|strength|step|time/i.test(item.quote);
      });
      if (pool.length < 10) throw new Error('Not enough motivational quotes');
      var today = dayKey(new Date());
      var quotes = pick(pool, today);
      saved = {day:today,quotes:quotes,external:true};
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (error) {}
      render(quotes, today, true, false);
    } catch (error) {
      // The visible cached selection or original reminders stay in place.
    } finally {
      clearTimeout(timeout);
      busy = false;
    }
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        section.classList.add('is-visible');
        observer.disconnect();
      }
    }, {threshold:.08});
    observer.observe(section);
  } else section.classList.add('is-visible');
  refresh();
  setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', refresh);
})();
