/* Progressive fixture-layout enhancer. Keeps sports-live.js as the data/interaction source. */
(function(){
'use strict';
var root=document.getElementById('rkSportsPage');if(!root)return;
var grid=root.querySelector('.sw-grid');if(!grid)return;

var THEMES=[
  [/premier league/i,'premier'],[/champions league|uefa champions/i,'ucl'],[/europa league/i,'europa'],[/la ?liga/i,'laliga'],[/bundesliga/i,'bundesliga'],[/serie a/i,'seriea'],[/ligue 1/i,'ligue1'],[/major league soccer|\bmls\b/i,'mls'],[/\bnba\b/i,'nba'],[/\bnfl\b/i,'nfl'],[/\bmlb\b/i,'mlb'],[/\bnhl\b/i,'nhl'],[/volleyball/i,'volleyball'],[/rugby/i,'rugby'],[/cricket/i,'cricket'],[/basketball/i,'basketball'],[/american football|gfl/i,'american-football'],[/ice hockey|hockey/i,'ice-hockey'],[/baseball/i,'baseball'],[/motorsport|racing/i,'motorsport'],[/golf/i,'golf']
];
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function themeFor(name){for(var i=0;i<THEMES.length;i++)if(THEMES[i][0].test(name||''))return THEMES[i][1];return'football'}
function text(el,sel){var n=el.querySelector(sel);return(n&&n.textContent||'').trim()}
function imgSrc(el,sel){var n=el.querySelector(sel+' img');return n&&n.getAttribute('src')||''}
function initials(name){return String(name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(function(x){return x[0]}).join('').toUpperCase()||'?'}
function logoHTML(url,name,cls){return'<span class="'+cls+'">'+(url?'<img src="'+esc(url)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">':'<span class="sw-logo-fallback">'+esc(initials(name))+'</span>')+'</span>'}
function cardData(card){
  var teams=card.querySelectorAll('.sw-team-row');
  var h=teams[0],a=teams[1];
  var league=text(card,'.sw-league')||'Other competitions';
  var sport=(text(card,'.sw-card-sport')||'').replace(/^[^A-Za-z]+/,'').trim();
  var state=text(card,'.sw-card-state');
  var clock=text(card,'.sw-card-clock');
  var venue=text(card,'.sw-country');
  var leagueLogo=imgSrc(card,'.sw-mini-league-logo');
  var live=card.classList.contains('live');
  return{
    id:card.dataset.event||'',
    league:league,
    sport:sport,
    theme:card.dataset.leagueTheme||themeFor(league+' '+sport),
    leagueLogo:leagueLogo,
    state:state,
    clock:clock,
    venue:venue,
    live:live,
    home:h?{name:text(h,'.sw-team-name b'),sub:text(h,'.sw-team-name small'),logo:imgSrc(h,'.sw-team-logo'),score:text(h,'.sw-team-score')}:null,
    away:a?{name:text(a,'.sw-team-name b'),sub:text(a,'.sw-team-name small'),logo:imgSrc(a,'.sw-team-logo'),score:text(a,'.sw-team-score')}:null,
    original:card
  };
}
function featureData(){
  var f=root.querySelector('.sw-feature');if(!f||f.hidden)return null;
  var ts=f.querySelectorAll('.sw-feature-team');if(ts.length<2)return null;
  var hs=text(f,'.sw-scoreline span:first-child'),as=text(f,'.sw-scoreline span:last-child');
  var vs=text(f,'.sw-scoreline')==='VS'||(hs==='VS'&&as==='VS');
  var league=text(f,'.sw-feature-league b')||'Other competitions';
  return{
    id:f.dataset.event||'',league:league,sport:'',theme:f.dataset.leagueTheme||themeFor(league),leagueLogo:imgSrc(f,'.sw-league-logo'),state:text(f,'.sw-feature-status'),clock:text(f,'.sw-clock'),venue:text(f,'.sw-feature-note'),live:f.classList.contains('live'),
    home:{name:text(ts[0],'h3'),sub:text(ts[0],'small'),logo:imgSrc(ts[0],'.sw-feature-logo'),score:vs?'—':hs},
    away:{name:text(ts[1],'h3'),sub:text(ts[1],'small'),logo:imgSrc(ts[1],'.sw-feature-logo'),score:vs?'—':as},
    original:f
  };
}
function rowHTML(d,index){
  if(!d.home||!d.away){return'<article class="fixture-row" data-event="'+esc(d.id)+'" tabindex="0" role="button" style="animation-delay:'+(index*18)+'ms"><div class="fixture-event-only"><div><strong>'+esc(d.league)+'</strong><small>'+esc(d.state||d.clock||'')+'</small></div><div class="fixture-time">'+esc(d.clock||d.state||'')+'</div><span class="fixture-arrow">›</span></div></article>'}
  var pre=(d.home.score==='—'||d.home.score===''||d.away.score==='—'||d.away.score==='');
  var center=pre?'<div class="fixture-time">'+esc(d.clock||d.state||'TBA')+'</div><div class="fixture-date">'+esc(d.state||'')+'</div>':'<div class="fixture-score"><span>'+esc(d.home.score)+'</span><em>–</em><span>'+esc(d.away.score)+'</span></div>'+(d.live?'<div class="fixture-live"><i></i>'+esc(d.clock||'LIVE')+'</div>':'<div class="fixture-date">'+esc(d.state||d.clock||'')+'</div>');
  return'<article class="fixture-row '+(d.live?'is-live':'')+'" data-event="'+esc(d.id)+'" tabindex="0" role="button" style="animation-delay:'+(index*18)+'ms">'+
    '<div class="fixture-match">'+
      '<div class="fixture-team home"><div class="fixture-team-name"><span>'+esc(d.home.name||'Team')+'</span></div>'+logoHTML(d.home.logo,d.home.name,'fixture-crest')+'</div>'+
      '<div class="fixture-center">'+center+'</div>'+
      '<div class="fixture-team away">'+logoHTML(d.away.logo,d.away.name,'fixture-crest')+'<div class="fixture-team-name"><span>'+esc(d.away.name||'Team')+'</span></div></div>'+
      '<span class="fixture-arrow">›</span>'+
    '</div>'+
    '<div class="fixture-meta">'+(d.venue?'<span class="fixture-venue">'+esc(d.venue)+'</span>':'')+'</div>'+
  '</article>';
}
function build(){
  var raw=Array.from(grid.querySelectorAll(':scope > .sw-card')).map(cardData);
  var featured=featureData();
  if(featured && featured.id && !raw.some(function(x){return x.id===featured.id}))raw.unshift(featured);
  if(!raw.length)return;
  var groups=[];
  raw.forEach(function(d){var key=d.league||'Other competitions',g=groups.find(function(x){return x.key===key});if(!g){g={key:key,theme:d.theme,logo:d.leagueLogo,sport:d.sport,items:[]};groups.push(g)}g.items.push(d)});
  grid.innerHTML=groups.map(function(g,gi){return'<section class="fixture-league-section" data-league-theme="'+esc(g.theme)+'">'+
    '<header class="fixture-league-head"><div class="fixture-league-id">'+logoHTML(g.logo,g.key,'fixture-league-logo')+'<div class="fixture-league-copy"><strong>'+esc(g.key)+'</strong><small>'+(g.sport?esc(g.sport):'Fixtures')+'</small></div></div><span class="fixture-league-count">'+g.items.length+' '+(g.items.length===1?'match':'matches')+'</span></header>'+
    '<div class="fixture-list">'+g.items.map(function(d,i){return rowHTML(d,i)}).join('')+'</div></section>'}).join('');
  document.body.classList.add('fixture-enhanced');
  bindRows();
}
function bindRows(){
  grid.querySelectorAll('.fixture-row[data-event]').forEach(function(row){
    function go(){var id=row.dataset.event;if(!id)return;var source=document.querySelector('.sw-card[data-event="'+CSS.escape(id)+'"],.sw-feature[data-event="'+CSS.escape(id)+'"]');if(source&&typeof source.click==='function')source.click();else{var old=document.querySelector('[data-event="'+CSS.escape(id)+'"]');if(old&&old!==row)old.click()}}
    row.addEventListener('click',function(){
      var id=row.dataset.event;
      var hiddenSource=document.querySelector('.sw-feature[data-event="'+CSS.escape(id)+'"]');
      if(hiddenSource){hiddenSource.click();return}
      /* sports-live.js bound its original .sw-card click listeners before enhancement. We keep
         a detached reference via __rkOriginal below and invoke its click() safely. */
      var original=row.__rkOriginal;if(original){original.click()}
    });
    row.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();row.click()}});
  });
  /* Restore original click behavior by matching generated rows to stored cards. */
  lastOriginals.forEach(function(card){var id=card.dataset.event,row=grid.querySelector('.fixture-row[data-event="'+CSS.escape(id)+'"]');if(row)row.__rkOriginal=card});
}
var lastOriginals=[];
function captureAndBuild(){
  var originals=Array.from(grid.querySelectorAll(':scope > .sw-card'));
  if(originals.length)lastOriginals=originals;
  build();
}
var queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;captureAndBuild()})}
var obs=new MutationObserver(function(muts){
  var hasNative=false;
  muts.forEach(function(m){Array.from(m.addedNodes||[]).forEach(function(n){if(n.nodeType===1&&(n.matches&&n.matches('.sw-card')||n.querySelector&&n.querySelector('.sw-card')))hasNative=true})});
  if(hasNative)queue();
});
obs.observe(grid,{childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
})();
