(function(){
'use strict';
function q(s,p){return (p||document).querySelector(s)}
function qa(s,p){return [].slice.call((p||document).querySelectorAll(s))}

var theater=q('#gameTheater');
var closeBtn=q('#closeGameTheater');
var theaterTitle=q('#theaterGameTitle');
var theaterMeta=q('#theaterGameMeta');
var ludo=q('#ludoGame');
var snake=q('#snakeGame');
var closeTimer=0;

function gameName(name){return name==='snake'?'Snake':'Ludo'}
function gameMeta(name){return name==='snake'?'Classic arcade · keyboard + touch':'Local multiplayer · 2–4 players'}

function selectExistingGame(name){
  var picker=q('.game-pick[data-game="'+name+'"]');
  if(picker){picker.click();return}
  if(ludo)ludo.hidden=name!=='ludo';
  if(snake)snake.hidden=name!=='snake';
}

function openGame(name){
  if(!theater)return;
  clearTimeout(closeTimer);
  selectExistingGame(name);
  if(theaterTitle)theaterTitle.textContent=gameName(name);
  if(theaterMeta)theaterMeta.textContent=gameMeta(name);
  theater.hidden=false;
  document.body.classList.add('game-playing');
  theater.dataset.game=name;
  requestAnimationFrame(function(){
    theater.classList.add('is-open');
    requestAnimationFrame(function(){window.dispatchEvent(new Event('resize'))});
  });
  try{history.replaceState(null,'','#'+name)}catch(e){}
  if(name==='snake')setTimeout(function(){window.dispatchEvent(new Event('resize'))},100);
}

function closeGame(){
  if(!theater)return;
  theater.classList.remove('is-open');
  document.body.classList.remove('game-playing');
  clearTimeout(closeTimer);
  closeTimer=setTimeout(function(){theater.hidden=true},250);
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
}

qa('[data-launch-game]').forEach(function(el){
  el.addEventListener('click',function(e){
    e.preventDefault();
    openGame(el.getAttribute('data-launch-game')||'ludo');
  });
});
qa('.game-cover[data-game]').forEach(function(card){
  card.addEventListener('click',function(e){
    if(e.target.closest('a'))return;
    openGame(card.getAttribute('data-game'));
  });
  card.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();openGame(card.getAttribute('data-game'))}
  });
});
if(closeBtn)closeBtn.addEventListener('click',closeGame);
if(theater)theater.addEventListener('click',function(e){
  if(e.target&&e.target.hasAttribute('data-theater-dismiss'))closeGame();
});
window.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&theater&&!theater.hidden)closeGame();
});

/* A tiny, single-run entrance stagger. No continuous bouncing. */
var cards=qa('.game-cover,.rail-card');
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  cards.forEach(function(card,i){
    card.animate([
      {opacity:0,transform:'translateY(14px)'},
      {opacity:1,transform:'translateY(0)'}
    ],{duration:480+i*55,delay:50+i*55,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
  });
}

/* Shared deep link: #ludo / #snake opens the theater instead of scrolling. */
var hash=(location.hash||'').slice(1).toLowerCase();
if(hash==='ludo'||hash==='snake')setTimeout(function(){openGame(hash)},120);
})();
