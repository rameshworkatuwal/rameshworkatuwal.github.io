/* Dynamic league theme bridge for fixture groups + full-screen Match Center. */
(function(){
'use strict';

var drawer=document.getElementById('matchDrawer');
var content=document.getElementById('matchDrawerContent');
if(!drawer||!content)return;

var THEMES=[
  [/premier league/i,'premier'],
  [/champions league|uefa champions/i,'ucl'],
  [/europa league/i,'europa'],
  [/conference league/i,'conference'],
  [/world cup|fifa world cup/i,'worldcup'],
  [/euro 20|uefa euro/i,'euro'],
  [/la\s*liga|laliga|spanish/i,'laliga'],
  [/bundesliga|german bundesliga/i,'bundesliga'],
  [/serie a|italian serie/i,'seriea'],
  [/ligue 1|french ligue/i,'ligue1'],
  [/championship|efl championship/i,'championship'],
  [/major league soccer|\bmls\b/i,'mls'],
  [/indian premier league|\bipl\b/i,'ipl'],
  [/\bnba\b/i,'nba'],
  [/\bnfl\b/i,'nfl'],
  [/\bmlb\b/i,'mlb'],
  [/\bnhl\b/i,'nhl'],
  [/american football|\bgfl\b/i,'american-football'],
  [/basketball/i,'basketball'],
  [/cricket/i,'cricket'],
  [/volleyball/i,'volleyball'],
  [/rugby/i,'rugby'],
  [/tennis/i,'tennis'],
  [/formula\s*1|\bf1\b|motorsport|racing/i,'motorsport'],
  [/baseball/i,'baseball'],
  [/ice hockey|hockey/i,'ice-hockey'],
  [/golf/i,'golf'],
  [/handball/i,'handball'],
  [/football|soccer/i,'football']
];

function getTheme(name,sport){
  var key=(name||'')+' '+(sport||'');
  for(var i=0;i<THEMES.length;i++)if(THEMES[i][0].test(key))return THEMES[i][1];
  return 'football';
}

function removeArt(root){
  if(!root)return;
  root.querySelectorAll('.rk-league-watermark,.rk-league-ring').forEach(function(n){n.remove()});
}

function applyMatchTheme(root){
  if(!root)return;
  var leagueEl=root.querySelector('.mc3-comp strong');
  var sportEl=root.querySelector('.mc3-comp span');
  var league=(leagueEl&&leagueEl.textContent||'').trim();
  var sport=(sportEl&&sportEl.textContent||'').trim();
  var theme=getTheme(league,sport);

  root.dataset.leagueTheme=theme;
  drawer.dataset.leagueTheme=theme;

  removeArt(root);
  var hero=root.querySelector('.mc3-hero');
  if(!hero)return;

  var ring=document.createElement('span');
  ring.className='rk-league-ring';
  ring.setAttribute('aria-hidden','true');
  hero.appendChild(ring);

  var logo=root.querySelector('.mc3-comp-logo img');
  if(logo&&logo.getAttribute('src')){
    var mark=document.createElement('span');
    mark.className='rk-league-watermark';
    mark.setAttribute('aria-hidden','true');
    var img=document.createElement('img');
    img.alt='';
    img.src=logo.src;
    img.decoding='async';
    img.referrerPolicy='no-referrer';
    mark.appendChild(img);
    hero.appendChild(mark);
  }
}

function syncFixtureTheme(section){
  if(!section||section.dataset.leagueTheme)return;
  var name=section.querySelector('.fixture-league-copy strong');
  var sport=section.querySelector('.fixture-league-copy small');
  section.dataset.leagueTheme=getTheme(name&&name.textContent,sport&&sport.textContent);
}

function applyAll(){
  document.querySelectorAll('.fixture-league-section').forEach(syncFixtureTheme);
  var root=content.querySelector('.match-center-v3');
  if(root)applyMatchTheme(root);
}

var scheduled=false;
function queue(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(function(){scheduled=false;applyAll()});
}

var obs=new MutationObserver(queue);
obs.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});
else queue();
})();
