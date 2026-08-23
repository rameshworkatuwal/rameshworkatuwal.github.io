/* Sports runtime enhancements
   - removes Market Info and Broadcast cards
   - upgrades Match Officials with real referee portraits when a trustworthy Wikimedia thumbnail exists
   - ticks visible live match clocks every second between provider refreshes
*/
(function(){
'use strict';

var portraitCache=new Map();
var clockState=new WeakMap();

function clean(s){return String(s||'').trim()}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function normalizeName(s){return clean(s).replace(/\s+/g,' ')}

function removeUnwantedCards(root){
  (root||document).querySelectorAll('.mc3-card').forEach(function(card){
    var h=card.querySelector('.mc3-card-title h3');
    var title=clean(h&&h.textContent).toLowerCase();
    if(title==='market info'||title==='broadcast')card.remove();
  });
}

function parseOfficialsCard(card){
  var rows=Array.from(card.querySelectorAll('.mc3-info-row'));
  if(!rows.length)return null;
  var list=rows.map(function(r){
    return {role:clean(r.querySelector('span')&&r.querySelector('span').textContent)||'Official',name:clean(r.querySelector('b')&&r.querySelector('b').textContent)};
  }).filter(function(x){return x.name});
  if(!list.length)return null;
  return {referee:list[0],all:list};
}

function wikipediaPortrait(name){
  name=normalizeName(name);
  if(!name)return Promise.resolve(null);
  if(portraitCache.has(name))return portraitCache.get(name);
  var q=encodeURIComponent(name+' referee');
  var search='https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch='+q+'&gsrlimit=5&prop=pageimages|info&pithumbsize=700&inprop=url&format=json&origin=*';
  var p=fetch(search,{cache:'force-cache',mode:'cors'}).then(function(r){if(!r.ok)throw new Error('wiki');return r.json()}).then(function(j){
    var pages=j&&j.query&&j.query.pages?Object.keys(j.query.pages).map(function(k){return j.query.pages[k]}):[];
    var needle=name.toLowerCase().replace(/[^a-z0-9 ]/g,'');
    var exact=pages.find(function(x){var t=String(x.title||'').toLowerCase().replace(/[^a-z0-9 ]/g,'');return t===needle||t.indexOf(needle)>-1||needle.indexOf(t)>-1});
    var hit=exact||pages.find(function(x){return x.thumbnail&&x.thumbnail.source});
    if(!hit||!hit.thumbnail||!hit.thumbnail.source)return null;
    return {url:hit.thumbnail.source,page:hit.fullurl||('https://en.wikipedia.org/wiki/'+encodeURIComponent(String(hit.title||'').replace(/ /g,'_'))),title:hit.title||name};
  }).catch(function(){return null});
  portraitCache.set(name,p);
  return p;
}

function avatarHTML(){
  return '<div class="mc3-referee-avatar" aria-hidden="true"><i class="hair"></i><i class="head"></i><i class="neck"></i><i class="body"></i></div>';
}

function officialsHTML(info,portrait){
  var ref=info.referee;
  var rows=info.all.slice(1,7).map(function(x){return '<div class="mc3-official-row"><span>'+esc(x.role)+'</span><b>'+esc(x.name)+'</b></div>'}).join('');
  var visual=portrait?'<img class="mc3-referee-photo" src="'+esc(portrait.url)+'" alt="'+esc(ref.name)+'" loading="lazy" referrerpolicy="no-referrer">':avatarHTML();
  var credit=portrait?'<div class="mc3-ref-photo-credit">Portrait: Wikimedia / Wikipedia · '+esc(portrait.title)+'</div>':'<div class="mc3-ref-photo-credit">Portrait unavailable — dimensional referee avatar shown instead.</div>';
  return '<div class="mc3-officials-layout">'+
    '<div class="mc3-referee-visual"><i class="mc3-referee-orbit"></i>'+visual+'<span class="mc3-referee-badge">Match Official</span></div>'+
    '<div class="mc3-officials-copy"><span class="mc3-officials-eyebrow">Match Referee</span><h3 class="mc3-officials-name">'+esc(ref.name)+'</h3><div class="mc3-officials-sub">Official crew published for this fixture</div><div class="mc3-officials-list">'+rows+'</div>'+credit+'</div></div>';
}

function upgradeOfficials(root){
  (root||document).querySelectorAll('.mc3-card').forEach(function(card){
    if(card.dataset.rkOfficials==='1')return;
    var h=card.querySelector('.mc3-card-title h3');
    if(clean(h&&h.textContent).toLowerCase()!=='match officials')return;
    var info=parseOfficialsCard(card);if(!info)return;
    card.dataset.rkOfficials='1';
    card.classList.add('mc3-officials-card');
    card.innerHTML=officialsHTML(info,null);
    wikipediaPortrait(info.referee.name).then(function(portrait){
      if(!card.isConnected||!portrait)return;
      card.innerHTML=officialsHTML(info,portrait);
    });
  });
}

function parseFootballClock(text){
  text=clean(text);
  var m=text.match(/(\d{1,3})(?:[:'](\d{1,2}))?/);
  if(!m)return null;
  var min=parseInt(m[1],10),sec=m[2]?parseInt(m[2],10):0;
  if(!Number.isFinite(min)||!Number.isFinite(sec))return null;
  return Math.max(0,min*60+Math.min(59,sec));
}
function parseMMSS(text){
  var m=clean(text).match(/(\d{1,3}):(\d{2})/);if(!m)return null;
  return parseInt(m[1],10)*60+parseInt(m[2],10);
}
function fmtElapsed(total){total=Math.max(0,total|0);return Math.floor(total/60)+':'+String(total%60).padStart(2,'0')}
function fmtCountdown(total){total=Math.max(0,total|0);return Math.floor(total/60)+':'+String(total%60).padStart(2,'0')}
function rowSport(row){
  var section=row.closest('.fixture-league-section');
  var league=clean(section&&section.querySelector('.fixture-league-copy strong')&&section.querySelector('.fixture-league-copy strong').textContent).toLowerCase();
  var sport=clean(section&&section.querySelector('.fixture-league-copy small')&&section.querySelector('.fixture-league-copy small').textContent).toLowerCase();
  return league+' '+sport;
}
function countdownSport(key){return /basketball|nba|wnba|american football|nfl|ice hockey|nhl|handball/.test(key)}
function footballSport(key){return /football|soccer|premier|liga|bundesliga|serie a|ligue|champions league|europa|conference/.test(key)&&!/american football/.test(key)}

function seedFixtureClock(row){
  if(!row.classList.contains('is-live'))return;
  var el=row.querySelector('.fixture-live')||row.querySelector('.fixture-time');if(!el)return;
  var key=rowSport(row),raw=clean(el.textContent),total=null,mode='elapsed';
  if(countdownSport(key)){total=parseMMSS(raw);mode='down'}
  else if(footballSport(key)){total=parseFootballClock(raw);mode='up'}
  else {total=parseMMSS(raw);mode='up'}
  if(total==null)return;
  var old=clockState.get(el);
  if(!old||old.raw!==raw.replace(/\s+/g,' ')||Math.abs(old.total-total)>8){clockState.set(el,{raw:raw.replace(/\s+/g,' '),total:total,mode:mode,last:Date.now()})}
  el.setAttribute('data-rk-live-clock','1');
}

function seedDetailClock(root){
  var status=(root||document).querySelector('.mc3-status.live');if(!status)return;
  var raw=clean(status.textContent),total=parseFootballClock(raw)||parseMMSS(raw);if(total==null)return;
  var old=clockState.get(status);if(!old||Math.abs(old.total-total)>8)clockState.set(status,{raw:raw,total:total,mode:'up',last:Date.now()});
  status.setAttribute('data-rk-live-clock','1');
}

function tickClocks(){
  document.querySelectorAll('.fixture-row.is-live').forEach(seedFixtureClock);
  seedDetailClock(document);
  clockState.forEach&&clockState.forEach(function(){});
  document.querySelectorAll('[data-rk-live-clock="1"]').forEach(function(el){
    var st=clockState.get(el);if(!st)return;
    var now=Date.now(),steps=Math.floor((now-st.last)/1000);if(steps<=0)return;
    st.last+=steps*1000;
    st.total=st.mode==='down'?Math.max(0,st.total-steps):st.total+steps;
    var txt=st.mode==='down'?fmtCountdown(st.total):fmtElapsed(st.total);
    if(el.classList.contains('fixture-live'))el.innerHTML='<i></i><span data-rk-seconds>'+txt+'</span>';
    else if(el.classList.contains('mc3-status'))el.innerHTML='<i></i><span data-rk-seconds>'+txt+'</span>';
    else el.textContent=txt;
  });
}

/* WeakMap cannot be iterated; all ticking is driven from live DOM nodes. */
function enhance(root){removeUnwantedCards(root);upgradeOfficials(root);document.querySelectorAll('.fixture-row.is-live').forEach(seedFixtureClock);seedDetailClock(root)}

var observer=new MutationObserver(function(muts){
  var roots=[];muts.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)roots.push(n)})});
  roots.forEach(enhance);enhance(document);
});
observer.observe(document.body,{childList:true,subtree:true});

enhance(document);
setInterval(tickClocks,250);
})();
