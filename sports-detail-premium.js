/* Premium match-detail runtime enhancements. */
(function(){
'use strict';
var content=document.getElementById('matchDrawerContent');
var drawerLeague=document.getElementById('drawerLeague');
if(!content)return;
var selectedEvent='';
var headshotCache=new Map();
var headshotRequest='';
var ESPN_MAP=[[/premier league|english premier/i,'soccer/eng.1'],[/laliga|la liga|spanish/i,'soccer/esp.1'],[/bundesliga|german/i,'soccer/ger.1'],[/serie a|italian/i,'soccer/ita.1'],[/ligue 1|french/i,'soccer/fra.1'],[/champions league/i,'soccer/uefa.champions'],[/europa league/i,'soccer/uefa.europa'],[/conference league/i,'soccer/uefa.europa.conf'],[/major league soccer|\bmls\b/i,'soccer/usa.1'],[/\bnba\b/i,'basketball/nba'],[/\bwnba\b/i,'basketball/wnba'],[/\bnfl\b/i,'football/nfl'],[/\bmlb\b/i,'baseball/mlb'],[/\bnhl\b/i,'hockey/nhl']];
var ICONS={
  'Match Info':'<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 3v4M16 3v4M4 9h16"/></svg>',
  'Venue Weather':'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13"/><path d="M8 19h10a3 3 0 0 0 0-6 5 5 0 0 0-9.5 1.5A2.5 2.5 0 0 0 8 19z"/></svg>',
  'Recent Form':'<svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19V2"/></svg>',
  'Match Officials':'<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M9 12l3 2 3-2"/></svg>',
  'League Standing':'<svg viewBox="0 0 24 24"><path d="M4 20h16M6 17h3V9H6zM11 17h3V4h-3zM16 17h3v-6h-3z"/></svg>',
  'Team Availability':'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  'Latest Match Events':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  'Match Timeline':'<svg viewBox="0 0 24 24"><path d="M6 4v16M6 7h8l2 2-2 2H6M6 15h5l2 2-2 2H6"/></svg>',
  'Data Sources':'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>',
  'Win Probability':'<svg viewBox="0 0 24 24"><path d="M4 18l5-5 4 3 7-9"/><path d="M15 7h5v5"/></svg>'
};
function clean(v){return String(v||'').trim()}
function initials(name){return clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(function(x){return x.charAt(0)}).join('').toUpperCase()||'?'}
function iconFor(title){return ICONS[title]||'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4M12 16h.01"/></svg>'}
function espnPath(name){for(var i=0;i<ESPN_MAP.length;i++)if(ESPN_MAP[i][0].test(name||''))return ESPN_MAP[i][1];return''}
function captureEvent(target){var n=target&&target.closest&&target.closest('[data-event]');if(n&&n.dataset.event){selectedEvent=n.dataset.event;headshotCache.clear();headshotRequest=''}}
document.addEventListener('pointerdown',function(e){captureEvent(e.target)},true);
document.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')captureEvent(e.target)},true);
function decorateTitles(root){
  (root||document).querySelectorAll('.mc3-card-title h3').forEach(function(h){
    if(h.dataset.mc4Done)return;h.dataset.mc4Done='1';
    var title=clean(h.textContent),wrap=document.createElement('span');wrap.className='mc4-title-wrap';
    var ico=document.createElement('i');ico.className='mc4-title-icon';ico.innerHTML=iconFor(title);
    h.parentNode.insertBefore(wrap,h);wrap.appendChild(ico);wrap.appendChild(h);
    var card=wrap.closest('.mc3-card');
    if(card){if(title==='Match Info')card.classList.add('mc4-card-info');if(title==='Venue Weather')card.classList.add('mc4-card-weather');if(title==='Recent Form')card.classList.add('mc4-card-form');if(title==='Lineups')card.classList.add('mc4-overview-lineups')}
  });
}
function rowIcon(label){label=label.toLowerCase();if(/venue|stadium/.test(label))return'<svg viewBox="0 0 24 24"><path d="M4 9l8-5 8 5v8l-8 3-8-3z"/><path d="M8 10v6M16 10v6M4 9h16"/></svg>';if(/location|area/.test(label))return'<svg viewBox="0 0 24 24"><path d="M12 21s6-5 6-11a6 6 0 1 0-12 0c0 6 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></svg>';if(/status/.test(label))return'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';if(/season|round|stage/.test(label))return'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>';if(/competition/.test(label))return'<svg viewBox="0 0 24 24"><path d="M8 4h8v4c0 3-2 5-4 5s-4-2-4-5zM6 6H3c0 4 2 6 5 6M18 6h3c0 4-2 6-5 6M12 13v4M8 21h8M10 17h4"/></svg>';if(/temperature|feels/.test(label))return'<svg viewBox="0 0 24 24"><path d="M10 5a2 2 0 0 1 4 0v8a4 4 0 1 1-4 0z"/><path d="M12 7v8"/></svg>';if(/wind/.test(label))return'<svg viewBox="0 0 24 24"><path d="M3 8h11a2 2 0 1 0-2-2M3 12h16a2 2 0 1 1-2 2M3 16h8"/></svg>';return'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4M12 16h.01"/></svg>'}
function decorateRows(root){
  (root||document).querySelectorAll('.mc3-info-row').forEach(function(row){
    if(row.dataset.mc4Done)return;var s=row.querySelector('span');if(!s)return;row.dataset.mc4Done='1';var label=clean(s.textContent);s.classList.add('mc4-row-label');var i=document.createElement('i');i.className='mc4-row-icon';i.innerHTML=rowIcon(label);s.insertBefore(i,s.firstChild);
  });
}
function avatarFace(name,url){var box=document.createElement('span');box.className='mc4-player-face';box.dataset.playerName=name.toLowerCase();if(url){var img=document.createElement('img');img.src=url;img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.onerror=function(){box.innerHTML='<span>'+initials(name)+'</span>'};box.appendChild(img)}else box.innerHTML='<span>'+initials(name)+'</span>';return box}
function setFace(box,name,url){if(!box||!url)return;box.innerHTML='';var img=document.createElement('img');img.src=url;img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.onerror=function(){box.innerHTML='<span>'+initials(name)+'</span>'};box.appendChild(img)}
function applyHeadshots(){content.querySelectorAll('.mc4-player-face').forEach(function(box){var name=box.dataset.playerName||'',url=headshotCache.get(name);if(url&&box.querySelector('span'))setFace(box,name,url)})}
function fetchHeadshots(){
  if(!selectedEvent||!/^espn-/.test(selectedEvent))return;
  var league=clean(drawerLeague&&drawerLeague.textContent),path=espnPath(league);if(!path)return;
  var id=selectedEvent.replace(/^espn-/,''),key=path+'|'+id;if(headshotRequest===key)return;headshotRequest=key;
  fetch('https://site.api.espn.com/apis/site/v2/sports/'+path+'/summary?event='+encodeURIComponent(id),{cache:'no-store',mode:'cors'}).then(function(r){if(!r.ok)throw new Error('summary');return r.json()}).then(function(sum){
    var rosters=sum&&sum.rosters;if(!Array.isArray(rosters))return;
    rosters.forEach(function(team){var all=team.roster||team.athletes||[];all.forEach(function(entry){var a=entry.athlete||entry,name=clean(a.displayName||a.fullName||a.shortName),url=a.headshot&&a.headshot.href||a.headshot&&a.headshot.url||a.photo||a.image||'';if(name&&url)headshotCache.set(name.toLowerCase(),url)})});
    applyHeadshots();
  }).catch(function(){});
}
function decorateLineups(root){
  (root||document).querySelectorAll('.mc3-lineup').forEach(function(card){
    var head=card.querySelector('.mc3-lineup-head');if(head&&!head.dataset.mc4Done){head.dataset.mc4Done='1';var strong=head.querySelector('strong');if(strong){var wrap=document.createElement('div');wrap.className='mc4-lineup-team';strong.parentNode.insertBefore(wrap,strong);wrap.appendChild(strong);var teamName=clean(strong.textContent);var rootMC=card.closest('.match-center-v3'),team=null;if(rootMC){var names=Array.from(rootMC.querySelectorAll('.mc3-team-name'));var idx=Array.from(card.parentNode.children).indexOf(card);var target=names[idx]||names[0];if(target){var teamBox=target.closest('.mc3-team');var img=teamBox&&teamBox.querySelector('.mc3-crest img');team={logo:img&&img.src||'',name:teamName}}}var badge=document.createElement('span');badge.className='mc4-team-badge';badge.innerHTML=team&&team.logo?'<img src="'+team.logo+'" alt="">':'<span>'+initials(teamName)+'</span>';wrap.insertBefore(badge,strong)}}
    card.querySelectorAll('.mc3-player').forEach(function(row){if(row.dataset.mc4Done)return;row.dataset.mc4Done='1';var nameEl=row.querySelector('.mc3-player-name');if(!nameEl)return;var name=clean(nameEl.textContent),url=headshotCache.get(name.toLowerCase())||'';row.insertBefore(avatarFace(name,url),row.firstChild)})
  });
  fetchHeadshots();applyHeadshots();
}
function removeDuplicateOverviewLineup(root){(root||document).querySelectorAll('.mc3-card').forEach(function(card){var h=card.querySelector('.mc3-card-title h3');if(clean(h&&h.textContent)==='Lineups')card.classList.add('mc4-overview-lineups')})}
function enhance(root){decorateTitles(root);decorateRows(root);decorateLineups(root);removeDuplicateOverviewLineup(root)}
var pending=false;function queue(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;enhance(content)})}
var obs=new MutationObserver(queue);obs.observe(content,{childList:true,subtree:true});
queue();
})();
