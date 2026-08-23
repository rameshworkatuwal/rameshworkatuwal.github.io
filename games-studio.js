(function(){
'use strict';
function q(s,p){return (p||document).querySelector(s)}
function qa(s,p){return [].slice.call((p||document).querySelectorAll(s))}
var theater=q('#gameTheater'),closeBtn=q('#closeGameTheater'),theaterTitle=q('#theaterGameTitle'),theaterMeta=q('#theaterGameMeta'),ludo=q('#ludoGame'),snake=q('#snakeGame'),closeTimer=0;
function gameName(name){return name==='snake'?'Snake':'Ludo'}
function gameMeta(name){return name==='snake'?'Classic arcade · keyboard + touch':'Local multiplayer · 2–4 players'}
function selectExistingGame(name){if(ludo){ludo.hidden=name!=='ludo';ludo.classList.toggle('game-enter',name==='ludo')}if(snake){snake.hidden=name!=='snake';snake.classList.toggle('game-enter',name==='snake')}if(name==='snake')setTimeout(function(){window.dispatchEvent(new Event('resize'))},80)}
function openGame(name){if(!theater)return;clearTimeout(closeTimer);selectExistingGame(name);if(theaterTitle)theaterTitle.textContent=gameName(name);if(theaterMeta)theaterMeta.textContent=gameMeta(name);theater.hidden=false;document.body.classList.add('game-playing');theater.dataset.game=name;requestAnimationFrame(function(){theater.classList.add('is-open');requestAnimationFrame(function(){window.dispatchEvent(new Event('resize'))})});try{history.replaceState(null,'','#'+name)}catch(e){}}
function closeGame(){if(!theater)return;theater.classList.remove('is-open');document.body.classList.remove('game-playing');clearTimeout(closeTimer);closeTimer=setTimeout(function(){theater.hidden=true},250);try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
qa('.game-cover[data-game]').forEach(function(card){card.addEventListener('click',function(e){if(e.target.closest('a'))return;openGame(card.getAttribute('data-game'))});card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openGame(card.getAttribute('data-game'))}})});if(closeBtn)closeBtn.addEventListener('click',closeGame);window.addEventListener('keydown',function(e){if(e.key==='Escape'&&theater&&!theater.hidden)closeGame()});
var cards=qa('.game-cover,.rail-card');if(!matchMedia('(prefers-reduced-motion:reduce)').matches){cards.forEach(function(card,i){card.animate([{opacity:0,transform:'translateY(10px) scale(.995)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:420+i*45,delay:35+i*40,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'})})}
var hash=(location.hash||'').slice(1).toLowerCase();if(hash==='ludo'||hash==='snake')setTimeout(function(){openGame(hash)},100);
})();
