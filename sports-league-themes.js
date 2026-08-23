/* League theme decorator for Match Center.
   Reads the already-rendered league/sport text and applies visual themes without changing sports data. */
(function(){
'use strict';
var root=document.getElementById('rkSportsPage');if(!root)return;

var LEAGUES=[
  [/premier league/i,'premier','♛'],
  [/champions league|uefa champions/i,'ucl','✦'],
  [/europa league/i,'europa','◆'],
  [/la ?liga/i,'laliga','⚽'],
  [/bundesliga/i,'bundesliga','◆'],
  [/serie a/i,'seriea','A'],
  [/ligue 1/i,'ligue1','◈'],
  [/major league soccer|\bmls\b/i,'mls','✦'],
  [/\bnba\b/i,'nba','🏀'],
  [/\bnfl\b/i,'nfl','🏈'],
  [/\bmlb\b/i,'mlb','⚾'],
  [/\bnhl\b/i,'nhl','🏒']
];
var SPORT_THEMES={
  'football':['football','⚽'],
  'basketball':['basketball','🏀'],
  'volleyball':['volleyball','🏐'],
  'rugby':['rugby','🏉'],
  'american football':['american-football','🏈'],
  'cricket':['cricket','🏏'],
  'tennis':['tennis','🎾'],
  'motorsport':['motorsport','🏎'],
  'baseball':['baseball','⚾'],
  'ice hockey':['ice-hockey','🏒'],
  'golf':['golf','⛳'],
  'handball':['handball','◉']
};
function text(el,sel){var n=el.querySelector(sel);return(n&&n.textContent||'').trim()}
function themeFor(el){
  var league=text(el,'.sw-league')||text(el,'.sw-feature-league b');
  for(var i=0;i<LEAGUES.length;i++)if(LEAGUES[i][0].test(league))return{theme:LEAGUES[i][1],art:LEAGUES[i][2]};
  var sport=(text(el,'.sw-card-sport')||text(el,'.sw-feature-head')).replace(/^[^A-Za-z]+/,'').trim().toLowerCase();
  Object.keys(SPORT_THEMES).some(function(k){if(sport.indexOf(k)>-1){sport=k;return true}return false});
  var s=SPORT_THEMES[sport]||['football','✦'];return{theme:s[0],art:s[1]};
}
function mark(el,index){
  var v=themeFor(el);el.dataset.leagueTheme=v.theme;el.style.setProperty('--card-i',String(index||0));
  if(!el.querySelector('.sw-theme-art')){var art=document.createElement('span');art.className='sw-theme-art';art.setAttribute('aria-hidden','true');art.textContent=v.art;el.appendChild(art)}
  if(el.classList.contains('sw-card')&&!el.dataset.tiltBound){
    el.dataset.tiltBound='1';
    el.addEventListener('pointermove',function(e){
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      el.style.setProperty('--ry',((x-.5)*3.2).toFixed(2)+'deg');
      el.style.setProperty('--rx',((.5-y)*2.4).toFixed(2)+'deg');
      el.style.setProperty('--mx',(x*100).toFixed(1)+'%');el.style.setProperty('--my',(y*100).toFixed(1)+'%');
    });
    el.addEventListener('pointerleave',function(){el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg');el.style.setProperty('--mx','72%');el.style.setProperty('--my','18%')});
  }
}
function decorate(){
  root.querySelectorAll('.sw-card').forEach(function(el,i){mark(el,i)});
  var f=root.querySelector('.sw-feature');if(f&&!f.hidden)mark(f,0);
}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;decorate()})}
var obs=new MutationObserver(queue);var grid=root.querySelector('.sw-grid'),feature=root.querySelector('.sw-feature');if(grid)obs.observe(grid,{childList:true,subtree:true});if(feature)obs.observe(feature,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
})();
