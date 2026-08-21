/* WORLDWIDE LIVE SPORTS ENGINE
   Merges ESPN scoreboards for broad/high-quality live coverage with
   TheSportsDB day feeds as a multi-sport fallback. No page reloads.
   Visible match clocks tick locally every second; network scores refresh
   more conservatively to avoid public-API rate limits.
*/
(function(){
  'use strict';

  var root=document.getElementById('rkSportsPage');
  if(!root)return;

  var grid=root.querySelector('.sw-grid')||root.querySelector('.sp-grid');
  var feature=root.querySelector('.sw-feature');
  var tabs=root.querySelector('.sw-tabs')||root.querySelector('.sp-filters');
  var updated=root.querySelector('.sw-updated')||root.querySelector('.sp-updated');
  var count=root.querySelector('.sw-count')||root.querySelector('.sp-count');
  var refreshBtn=root.querySelector('.sw-refresh')||root.querySelector('.sp-refresh');
  var empty=root.querySelector('.sw-empty')||root.querySelector('.sp-empty');
  var moreBtn=root.querySelector('.sw-more button');
  var liveCountEl=root.querySelector('.sw-live-count');
  var activeFilter='All';
  var allEvents=[];
  var renderLimit=24;
  var previousScores=new Map();
  var networkTimer=null;
  var clockTimer=null;
  var firstLoad=true;

  var ESPN=[
    ['Football','Premier League','https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'],
    ['Football','LaLiga','https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard'],
    ['Football','Bundesliga','https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard'],
    ['Football','Serie A','https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard'],
    ['Football','Ligue 1','https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard'],
    ['Football','Champions League','https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard'],
    ['Football','Europa League','https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard'],
    ['Football','MLS','https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard'],
    ['Basketball','NBA','https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'],
    ['Basketball','WNBA','https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard'],
    ['American Football','NFL','https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'],
    ['Baseball','MLB','https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard'],
    ['Ice Hockey','NHL','https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard']
  ];

  var TDB_SPORTS=['Soccer','Basketball','Cricket','Tennis','Motorsport','Baseball','Ice Hockey','American Football','Rugby','Volleyball','Handball','Golf'];
  var ICONS={Football:'⚽',Soccer:'⚽',Basketball:'🏀',Cricket:'🏏',Tennis:'🎾',Motorsport:'🏎️',Baseball:'⚾','Ice Hockey':'🏒','American Football':'🏈',Rugby:'🏉',Volleyball:'🏐',Handball:'🤾',Golf:'⛳'};

  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
  function pad(n){return String(n).padStart(2,'0')}
  function localDateKey(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function localESPNDate(){var d=new Date();return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())}
  function safeNum(v){if(v===null||v===undefined||v==='')return null;var n=Number(v);return Number.isFinite(n)?n:null}
  function initials(name){return String(name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(function(x){return x[0]}).join('').toUpperCase()||'?'}
  function sportName(s){if(s==='Soccer')return 'Football';return s||'Other'}
  function iconFor(s){return ICONS[s]||ICONS[sportName(s)]||'●'}
  function stateRank(s){return s==='live'?0:s==='upcoming'?1:2}
  function fmtTime(ms){if(!ms)return 'TBA';try{return new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(ms))}catch(e){return new Date(ms).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}}
  function fmtDate(ms){if(!ms)return '';var d=new Date(ms),now=new Date();if(d.toDateString()===now.toDateString())return 'Today';var t=new Date(now);t.setDate(now.getDate()+1);if(d.toDateString()===t.toDateString())return 'Tomorrow';return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}

  function normalizeESPN(payload,meta){
    var out=[];
    ((payload&&payload.events)||[]).forEach(function(ev){
      var comp=(ev.competitions&&ev.competitions[0])||{};
      var comps=comp.competitors||[];
      var home=comps.find(function(c){return c.homeAway==='home'})||comps[0]||{};
      var away=comps.find(function(c){return c.homeAway==='away'})||comps[1]||{};
      var status=(comp.status||ev.status||{});
      var type=status.type||{};
      var state=type.state==='in'?'live':type.state==='post'?'done':'upcoming';
      var start=Date.parse(ev.date||comp.date||'')||0;
      var venue=(comp.venue&&comp.venue.fullName)||'';
      var league=(ev.league&&ev.league.name)||meta[1]||'';
      out.push({
        id:'espn-'+(ev.id||[meta[0],home.id,away.id,start].join('-')),
        sport:meta[0],league:league,country:'',venue:venue,start:start,state:state,
        statusText:(type.shortDetail||type.detail||status.displayClock||''),
        clock:status.displayClock||'',period:status.period||null,
        home:{name:(home.team&&home.team.displayName)||home.displayName||'Home',short:(home.team&&home.team.shortDisplayName)||'',logo:(home.team&&home.team.logo)||'',score:safeNum(home.score)},
        away:{name:(away.team&&away.team.displayName)||away.displayName||'Away',short:(away.team&&away.team.shortDisplayName)||'',logo:(away.team&&away.team.logo)||'',score:safeNum(away.score)},
        source:'ESPN'
      });
    });
    return out;
  }

  function parseTDBStart(e){
    if(e.strTimestamp){var n=Date.parse(e.strTimestamp);if(!isNaN(n))return n}
    var raw=(e.dateEvent||localDateKey())+'T'+(e.strTime||'00:00:00');var t=Date.parse(raw);return isNaN(t)?0:t
  }
  function normalizeTDB(payload,sport){
    return ((payload&&payload.events)||[]).map(function(e){
      var start=parseTDBStart(e),hs=safeNum(e.intHomeScore),as=safeNum(e.intAwayScore),now=Date.now();
      var lower=String(e.strStatus||e.strProgress||'').toLowerCase();
      var state=/live|in progress|1h|2h|half|quarter|period|inning|set/.test(lower)?'live':/finished|ft|final|ended|aet|after/.test(lower)?'done':'upcoming';
      if(state==='upcoming'&&(hs!==null||as!==null)&&start&&now>=start&&now-start<5*3600000)state='live';
      if(state==='upcoming'&&start&&now>start+7*3600000)state='done';
      return {
        id:'tdb-'+(e.idEvent||[sport,e.strEvent,start].join('-')),sport:sportName(e.strSport||sport),league:e.strLeague||'',country:e.strCountry||'',venue:e.strVenue||'',start:start,state:state,statusText:e.strStatus||e.strProgress||'',clock:e.strProgress||'',period:null,
        home:{name:e.strHomeTeam||'',short:'',logo:e.strHomeTeamBadge||'',score:hs},away:{name:e.strAwayTeam||'',short:'',logo:e.strAwayTeamBadge||'',score:as},eventName:e.strEvent||'',source:'TheSportsDB'
      }
    })
  }

  function fetchJSON(url,timeout){
    var controller=new AbortController();var timer=setTimeout(function(){controller.abort()},timeout||6500);
    return fetch(url,{cache:'no-store',mode:'cors',signal:controller.signal}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).finally(function(){clearTimeout(timer)})
  }

  function fetchESPN(){
    var date=localESPNDate();
    return Promise.allSettled(ESPN.map(function(meta){
      var join=meta[2].indexOf('?')>-1?'&':'?';
      return fetchJSON(meta[2]+join+'dates='+date+'&limit=100',7000).then(function(j){return normalizeESPN(j,meta)})
    })).then(function(results){var out=[];results.forEach(function(r){if(r.status==='fulfilled')out=out.concat(r.value)});return out})
  }

  function fetchTDB(){
    var date=localDateKey();
    return Promise.allSettled(TDB_SPORTS.map(function(s){
      var url='https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d='+encodeURIComponent(date)+'&s='+encodeURIComponent(s);
      return fetchJSON(url,7500).then(function(j){return normalizeTDB(j,s)})
    })).then(function(results){var out=[];results.forEach(function(r){if(r.status==='fulfilled')out=out.concat(r.value)});return out})
  }

  function dedupe(events){
    var seen=new Map();
    events.forEach(function(e){
      var key=[sportName(e.sport),String(e.home&&e.home.name||'').toLowerCase(),String(e.away&&e.away.name||'').toLowerCase(),Math.round((e.start||0)/600000)].join('|');
      var old=seen.get(key);
      if(!old||e.source==='ESPN'||(!old.home.logo&&e.home.logo))seen.set(key,e)
    });
    return Array.from(seen.values())
  }

  function sortEvents(arr){
    return arr.sort(function(a,b){var sr=stateRank(a.state)-stateRank(b.state);if(sr)return sr;return (a.start||0)-(b.start||0)})
  }

  function filtered(){var arr=allEvents;if(activeFilter!=='All')arr=arr.filter(function(e){return sportName(e.sport)===activeFilter});return arr}
  function liveEvents(){return allEvents.filter(function(e){return e.state==='live'})}

  function logoHTML(url,name){
    if(url)return '<img src="'+esc(url)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.parentNode.innerHTML=\'<span class=&quot;sw-logo-fallback&quot;>'+esc(initials(name))+'</span>\'">';
    return '<span class="sw-logo-fallback">'+esc(initials(name))+'</span>'
  }

  function stateText(e,withDot){
    if(e.state==='live')return (withDot?'<i class="sw-live-dot"></i>':'')+(e.clock||e.statusText||'LIVE');
    if(e.state==='done')return e.statusText||'FINAL';
    return fmtDate(e.start)+' · '+fmtTime(e.start)
  }

  function clockText(e){
    if(e.state!=='live')return stateText(e,false);
    if(e.clock)return e.clock;
    if(!e.start)return 'LIVE';
    var sec=Math.max(0,Math.floor((Date.now()-e.start)/1000));
    var mins=Math.floor(sec/60),s=sec%60;
    return mins+':'+pad(s)
  }

  function cardHTML(e){
    var hasTeams=e.home&&e.away&&(e.home.name||e.away.name);
    var cls='sw-card '+(e.state==='live'?'live':'');
    if(!hasTeams){return '<article class="'+cls+'" data-event="'+esc(e.id)+'"><div class="sw-card-top"><span class="sw-card-sport"><span>'+iconFor(e.sport)+'</span>'+esc(sportName(e.sport))+'</span><span class="sw-card-state">'+stateText(e,true)+'</span></div><p class="sw-league">'+esc(e.league||e.country||'Worldwide')+'</p><div class="sw-event-only"><span class="big-icon">'+iconFor(e.sport)+'</span><b>'+esc(e.eventName||e.league||sportName(e.sport))+'</b><span>'+esc(e.venue||e.country||'')+'</span></div></article>'}
    return '<article class="'+cls+'" data-event="'+esc(e.id)+'">'+
      '<div class="sw-card-top"><span class="sw-card-sport"><span>'+iconFor(e.sport)+'</span>'+esc(sportName(e.sport))+'</span><span class="sw-card-state">'+stateText(e,true)+'</span></div>'+ 
      '<p class="sw-league" title="'+esc(e.league)+'">'+esc(e.league||e.country||'Worldwide')+'</p>'+ 
      '<div class="sw-teams">'+teamRow(e.home,e.country)+teamRow(e.away,e.country)+'</div>'+ 
      '<div class="sw-card-foot"><span class="sw-card-clock" data-clock="'+esc(e.id)+'">'+esc(clockText(e))+'</span><span class="sw-country">'+esc(e.venue||e.country||e.source||'')+'</span></div></article>'
  }
  function teamRow(t,country){return '<div class="sw-team-row"><span class="sw-team-logo">'+logoHTML(t.logo,t.name)+'</span><span class="sw-team-name"><b title="'+esc(t.name)+'">'+esc(t.name||'Team')+'</b><small>'+esc(country||'')+'</small></span><strong class="sw-team-score">'+(t.score===null?'—':esc(t.score))+'</strong></div>'}

  function featureHTML(e){
    if(!feature)return;
    if(!e){feature.hidden=true;return}
    feature.hidden=false;
    feature.className='sw-feature '+(e.state==='live'?'live':'');
    feature.setAttribute('data-event',e.id);
    var h=e.home||{name:e.eventName||sportName(e.sport),logo:'',score:null},a=e.away||{name:'',logo:'',score:null};
    var scores=(h.score!==null||a.score!==null)?'<div class="sw-scoreline"><span>'+(h.score===null?'—':esc(h.score))+'</span><i></i><span>'+(a.score===null?'—':esc(a.score))+'</span></div>':'<div class="sw-scoreline"><span>VS</span></div>';
    feature.innerHTML='<div class="sw-feature-head"><div class="sw-feature-league"><span>'+iconFor(e.sport)+'</span><b>'+esc(e.league||sportName(e.sport))+'</b></div><div class="sw-feature-status '+(e.state==='live'?'live':e.state==='done'?'post':'pre')+'">'+stateText(e,true)+'</div></div>'+ 
      featureTeam(h,e.country)+
      '<div class="sw-feature-score">'+scores+'<span class="sw-clock" data-feature-clock="'+esc(e.id)+'">'+esc(clockText(e))+'</span><span class="sw-feature-note">'+esc(e.venue||e.country||e.source||'')+'</span></div>'+ 
      featureTeam(a,e.country)
  }
  function featureTeam(t,country){return '<div class="sw-feature-team"><span class="sw-feature-logo">'+logoHTML(t.logo,t.name)+'</span><h3>'+esc(t.name||'Event')+'</h3><small>'+esc(country||'')+'</small></div>'}

  function buildTabs(){
    if(!tabs)return;var sports=['All'].concat(Array.from(new Set(allEvents.map(function(e){return sportName(e.sport)}))).sort());
    tabs.innerHTML=sports.map(function(s){return '<button class="sw-tab '+(s===activeFilter?'active':'')+'" type="button" data-sport="'+esc(s)+'"><span class="emoji">'+(s==='All'?'✦':iconFor(s))+'</span>'+esc(s==='All'?'All Sports':s)+'</button>'}).join('');
    tabs.querySelectorAll('.sw-tab').forEach(function(b){b.addEventListener('click',function(){activeFilter=b.dataset.sport;renderLimit=24;render()})})
  }

  function render(){
    var arr=filtered();
    buildTabs();
    if(count)count.innerHTML='<strong>'+arr.length+'</strong> events';
    if(liveCountEl)liveCountEl.innerHTML='<strong>'+liveEvents().length+'</strong> live';
    var hero=arr.find(function(e){return e.state==='live'&&e.home&&e.away})||arr.find(function(e){return e.home&&e.away})||arr[0];
    featureHTML(hero);
    if(grid)grid.innerHTML=arr.slice(0,renderLimit).map(cardHTML).join('');
    if(empty){empty.hidden=!!arr.length;if(!arr.length)empty.innerHTML='<strong>No events in this filter right now.</strong><small>Try All Sports or refresh the worldwide feed.</small>'}
    if(moreBtn)moreBtn.parentElement.hidden=arr.length<=renderLimit;
    detectScoreChanges(arr);
  }

  function detectScoreChanges(arr){
    arr.forEach(function(e){
      if(!e.home||!e.away)return;var key=e.id,score=(e.home.score==null?'':e.home.score)+'-'+(e.away.score==null?'':e.away.score),old=previousScores.get(key);
      if(!firstLoad&&old&&old!==score&&e.state==='live'&&sportName(e.sport)==='Football')showGoal(e,old,score);
      previousScores.set(key,score)
    });
    firstLoad=false
  }

  function showGoal(e,oldScore,newScore){
    var overlay=document.querySelector('.sw-goal');if(!overlay)return;
    var who='GOAL';
    var oldParts=oldScore.split('-').map(Number),newParts=newScore.split('-').map(Number);
    if(newParts[0]>oldParts[0])who=e.home.name;if(newParts[1]>oldParts[1])who=e.away.name;
    overlay.querySelector('b').textContent=who;overlay.querySelector('span').textContent=newScore;overlay.classList.add('on');
    setTimeout(function(){overlay.classList.remove('on')},2300)
  }

  function tickClocks(){
    document.querySelectorAll('[data-clock]').forEach(function(el){var e=allEvents.find(function(x){return x.id===el.dataset.clock});if(e)el.textContent=clockText(e)});
    document.querySelectorAll('[data-feature-clock]').forEach(function(el){var e=allEvents.find(function(x){return x.id===el.dataset.featureClock});if(e)el.textContent=clockText(e)})
  }

  function setUpdated(ok){if(!updated)return;var t=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});updated.textContent=(ok?'Updated · ':'Reconnecting · ')+t}

  function refresh(manual){
    if(refreshBtn)refreshBtn.classList.add('loading');
    Promise.allSettled([fetchESPN(),fetchTDB()]).then(function(res){
      var merged=[];res.forEach(function(r){if(r.status==='fulfilled')merged=merged.concat(r.value)});
      if(!merged.length)throw new Error('No feeds');
      allEvents=sortEvents(dedupe(merged));
      setUpdated(true);render();
      var delay=liveEvents().length?8000:45000;
      clearTimeout(networkTimer);networkTimer=setTimeout(refresh,delay)
    }).catch(function(){setUpdated(false);clearTimeout(networkTimer);networkTimer=setTimeout(refresh,30000)}).finally(function(){if(refreshBtn)refreshBtn.classList.remove('loading')})
  }

  if(refreshBtn)refreshBtn.addEventListener('click',function(){clearTimeout(networkTimer);refresh(true)});
  if(moreBtn)moreBtn.addEventListener('click',function(){renderLimit+=24;render()});
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(networkTimer)}else{refresh()}});
  clockTimer=setInterval(tickClocks,1000);
  refresh();
})();
