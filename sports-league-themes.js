/* Clean league theme decorator for Match Center.
   Applies league/sport accent classes only; motion stays subtle and CSS-driven. */
(function(){
'use strict';
var root=document.getElementById('rkSportsPage');if(!root)return;

var LEAGUES=[
  [/premier league/i,'premier'],
  [/champions league|uefa champions/i,'ucl'],
  [/europa league/i,'europa'],
  [/la ?liga/i,'laliga'],
  [/bundesliga/i,'bundesliga'],
  [/serie a/i,'seriea'],
  [/ligue 1/i,'ligue1'],
  [/major league soccer|\bmls\b/i,'mls'],
  [/\bnba\b/i,'nba'],
  [/\bnfl\b/i,'nfl'],
  [/\bmlb\b/i,'mlb'],
  [/\bnhl\b/i,'nhl']
];
var SPORT_THEMES={
  'football':'football',
  'basketball':'basketball',
  'volleyball':'volleyball',
  'rugby':'rugby',
  'american football':'american-football',
  'cricket':'cricket',
  'tennis':'tennis',
  'motorsport':'motorsport',
  'baseball':'baseball',
  'ice hockey':'ice-hockey',
  'golf':'golf',
  'handball':'handball'
};
function text(el,sel){var n=el.querySelector(sel);return(n&&n.textContent||'').trim()}
function themeFor(el){
  var league=text(el,'.sw-league')||text(el,'.sw-feature-league b');
  for(var i=0;i<LEAGUES.length;i++)if(LEAGUES[i][0].test(league))return LEAGUES[i][1];
  var sport=(text(el,'.sw-card-sport')||text(el,'.sw-feature-head')).replace(/^[^A-Za-z]+/,'').trim().toLowerCase();
  var matched='football';
  Object.keys(SPORT_THEMES).some(function(k){if(sport.indexOf(k)>-1){matched=SPORT_THEMES[k];return true}return false});
  return matched;
}
function mark(el,index){
  el.dataset.leagueTheme=themeFor(el);
  el.style.setProperty('--card-i',String(index||0));
  el.style.removeProperty('--rx');
  el.style.removeProperty('--ry');
  el.style.removeProperty('--mx');
  el.style.removeProperty('--my');
  var art=el.querySelector('.sw-theme-art');if(art)art.remove();
}
function decorate(){
  root.querySelectorAll('.sw-card').forEach(function(el,i){mark(el,i)});
  var f=root.querySelector('.sw-feature');if(f&&!f.hidden)mark(f,0);
}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;decorate()})}
var obs=new MutationObserver(queue),grid=root.querySelector('.sw-grid'),feature=root.querySelector('.sw-feature');
if(grid)obs.observe(grid,{childList:true,subtree:true});
if(feature)obs.observe(feature,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
})();
