(function(){
'use strict';
function q(s,p){return (p||document).querySelector(s)}
function qa(s,p){return [].slice.call((p||document).querySelectorAll(s))}
var ludo=q('#ludoGame'),snake=q('#snakeGame'),picks=qa('.game-pick'),stage=q('.ludo-stage'),board=q('#ludoBoard'),cube=q('#diceCube'),face=q('#diceFace'),roll=q('#rollDice');
function show(which){var a=which==='snake'?snake:ludo,b=which==='snake'?ludo:snake;if(a){a.hidden=false;a.classList.remove('game-enter');void a.offsetWidth;a.classList.add('game-enter')}if(b)b.hidden=true;picks.forEach(function(x){x.classList.toggle('is-active',x.dataset.game===which)});try{history.replaceState(null,'','#'+which)}catch(e){}if(which==='snake')setTimeout(function(){window.dispatchEvent(new Event('resize'))},80)}
picks.forEach(function(b){b.addEventListener('click',function(){show(b.dataset.game)})});
var hash=(location.hash||'').replace('#','');if(hash==='snake')show('snake');
function dot(pos){return '<i style="grid-area:'+pos+'"></i>'}
function makeFace(cls,n){var map={1:['2/2'],2:['1/1','3/3'],3:['1/1','2/2','3/3'],4:['1/1','1/3','3/1','3/3'],5:['1/1','1/3','2/2','3/1','3/3'],6:['1/1','2/1','3/1','1/3','2/3','3/3']};var s=document.createElement('span');s.className='dice-3d-face '+cls;s.innerHTML=map[n].map(dot).join('');return s}
if(cube){cube.style.setProperty('--dice-size',(cube.getBoundingClientRect().width||58)+'px');cube.dataset.value='1';cube.appendChild(makeFace('front',1));cube.appendChild(makeFace('right',2));cube.appendChild(makeFace('top',3));cube.appendChild(makeFace('bottom',4));cube.appendChild(makeFace('left',5));cube.appendChild(makeFace('back',6));
 var mo=new MutationObserver(function(){var t=face&&face.textContent||'⚀',v='⚀⚁⚂⚃⚄⚅'.indexOf(t)+1;if(v>0)cube.dataset.value=String(v)});if(face)mo.observe(face,{childList:true,characterData:true,subtree:true})}
if(stage&&board){stage.addEventListener('pointermove',function(e){if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;var r=board.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;stage.classList.add('is-tilting');board.style.setProperty('--board-ry',(x*4.5).toFixed(2)+'deg');board.style.setProperty('--board-rx',(-y*3.4).toFixed(2)+'deg')},{passive:true});stage.addEventListener('pointerleave',function(){stage.classList.remove('is-tilting');board.style.setProperty('--board-ry','0deg');board.style.setProperty('--board-rx','0deg')},{passive:true})}
var turnName=q('#turnName');if(turnName&&board){var mo2=new MutationObserver(function(){board.dataset.turn=(turnName.textContent||'').split(' ')[0].toLowerCase()});mo2.observe(turnName,{childList:true,subtree:true});board.dataset.turn=(turnName.textContent||'red').toLowerCase()}
if(roll){roll.addEventListener('pointerdown',function(){roll.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(2px) scale(.985)'},{transform:'translateY(0) scale(1)'}],{duration:220,easing:'ease-out'})})}
})();
