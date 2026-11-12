(function () {
  'use strict';
  var section = document.getElementById('daily-quotes');
  if (!section) return;

  var quoteBody = document.getElementById('quote-text');
  var quoteAuthor = document.getElementById('quote-author');
  var dateLabel = document.getElementById('quotes-date');
  var source = document.getElementById('quotes-source');
  var shuffleBtn = document.getElementById('quote-shuffle');

  var endpoint = 'https://dummyjson.com/quotes?limit=0';
  var storageKey = 'rk-daily-quote-v2';

  var fallback = [
    { quote: "Opportunity is missed by most people because it is dressed in overalls and looks like work.", author: "Thomas A. Edison" },
    { quote: "Make today a small promise kept to your future self.", author: "Daily Reminder" },
    { quote: "You do not need a perfect day to make real progress.", author: "Daily Reminder" },
    { quote: "Give the next ten minutes to the thing that matters.", author: "Daily Reminder" },
    { quote: "Let your effort be steady even when your confidence is not.", author: "Daily Reminder" },
    { quote: "Start where you are, then make that starting point proud.", author: "Daily Reminder" },
    { quote: "Count the days, but also give each day something worth counting.", author: "Daily Reminder" },
    { quote: "Progress can be quiet and still be real.", author: "Daily Reminder" },
    { quote: "It's a dare. Impossible is potential. Impossible is temporary. Impossible is nothing.", author: "Muhammad Ali" },
    { quote: "The time is always right to do what is right.", author: "Martin Luther King Jr." }
  ];

  var pool = fallback.slice();
  var currentIndex = 0;
  var busy = false;

  function dayKey(now) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
  }

  function validQuotes(items) {
    if (!Array.isArray(items)) return [];
    var seen = new Set();
    return items.filter(function (item) {
      if (!item || typeof item.quote !== 'string' || typeof item.author !== 'string') return false;
      var text = item.quote.trim();
      if (text.length < 15 || text.length > 220 || seen.has(text)) return false;
      seen.add(text);
      return true;
    }).map(function (item) {
      return { quote: item.quote.trim(), author: item.author.trim() };
    });
  }

  function pickForDay(items, day) {
    var ordinal = Math.floor(Date.parse(day + 'T00:00:00Z') / 86400000);
    var idx = ((ordinal % items.length) + items.length) % items.length;
    return { item: items[idx], index: idx };
  }

  function displayQuote(item, animate) {
    if (!quoteBody || !quoteAuthor || !item) return;

    if (animate) {
      quoteBody.classList.add('is-animating');
      setTimeout(function () {
        quoteBody.textContent = '“' + item.quote + '”';
        quoteAuthor.textContent = item.author;
        quoteBody.classList.remove('is-animating');
      }, 180);
    } else {
      quoteBody.textContent = '“' + item.quote + '”';
      quoteAuthor.textContent = item.author;
    }
  }

  function updateDateAndSource(day, isExternal) {
    if (dateLabel) {
      try {
        dateLabel.textContent = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Dubai',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(new Date(day + 'T00:00:00+04:00'));
      } catch (e) {
        dateLabel.textContent = day;
      }
    }

    if (source) {
      source.replaceChildren();
      if (isExternal) {
        source.appendChild(document.createTextNode('Quote via '));
        var link = document.createElement('a');
        link.href = 'https://dummyjson.com/docs/quotes';
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'DummyJSON';
        source.appendChild(link);
      } else {
        source.textContent = 'Daily reminders';
      }
    }
  }

  async function initQuotes() {
    var today = dayKey(new Date());
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch (e) {}

    if (saved && Array.isArray(saved.pool) && saved.pool.length > 5) {
      pool = saved.pool;
    }

    var selection = pickForDay(pool, today);
    currentIndex = selection.index;
    displayQuote(selection.item, false);
    updateDateAndSource(today, !!(saved && saved.isExternal));

    if (!saved || saved.day !== today || !saved.isExternal) {
      if (busy) return;
      busy = true;
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 8000);
      try {
        var res = await fetch(endpoint, { signal: controller.signal, credentials: 'omit' });
        if (res.ok) {
          var data = await res.json();
          var fresh = validQuotes(data.quotes).filter(function (item) {
            return /dream|success|achiev|believ|effort|work|begin|start|learn|courage|persist|goal|opportun|future|progress|discipline|possible|strength|step|time|action|focus/i.test(item.quote);
          });
          if (fresh.length >= 10) {
            pool = fresh;
            var newSelection = pickForDay(pool, today);
            currentIndex = newSelection.index;
            displayQuote(newSelection.item, true);
            updateDateAndSource(today, true);
            try {
              localStorage.setItem(storageKey, JSON.stringify({
                day: today,
                pool: pool,
                isExternal: true
              }));
            } catch (err) {}
          }
        }
      } catch (err) {
      } finally {
        clearTimeout(timeout);
        busy = false;
      }
    }
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', function () {
      if (!pool || pool.length === 0) return;
      currentIndex = (currentIndex + 1) % pool.length;
      displayQuote(pool[currentIndex], true);
    });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        section.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(section);
  } else {
    section.classList.add('is-visible');
  }

  initQuotes();
})();
