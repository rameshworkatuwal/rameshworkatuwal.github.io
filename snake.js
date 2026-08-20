(function(){
'use strict';
var canvas=document.getElementById('snakeCanvas');if(!canvas)return;
var ctx=canvas.getContext('2d');
var overlay=document.getElementById('snakeOverlay');
var startBtn=document.getElementById('snakeStart');
var pauseBtn=document.getElementById('snakePause');
var restartBtn=document.getElementById('snakeRestart');
var scoreEl=document.getElementById('snakeScore');
var bestEl=document.getElementById('snakeBest');
var statusEl=document.getElementById('snakeStatus');
var boardWrap=document.querySelector('.snake-board-wrap');
var dpad=[].slice.call(document.querySelectorAll('.snake-dpad [data-dir]'));
var GRID=20,DIR={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},opposite={up:'down',down:'up',left:'right',right:'left'};
var snake,food,dir,nextDir,running=false,paused=false,score=0,last=0,step=105,raf=0,best=0,sound=true,audio=null;
try{best=parseInt(localStorage.getItem('rk_snake_best')||'0',10)||0}catch(e){}
bestEl.textContent=best;
function ensureAudio(){if(!audio){try{audio=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(audio.state==='suspended')audio.resume();return audio}
function sfx(type){if(!sound)return;var a=ensureAudio();if(!a)return;var now=a.currentTime;
 function osc(freq,dur,vol,wave,delay){var o=a.createOscillator(),g=a.createGain(),t=now+(delay||0);o.type=wave||'sine';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02)}
 if(type==='eat'){osc(540,.08,.04,'triangle');osc(820,.11,.035,'sine',.04)}
 else if(type==='start'){osc(320,.08,.03,'sine');osc(480,.08,.035,'sine',.07);osc(720,.12,.035,'triangle',.14)}
 else if(type==='hit'){osc(150,.18,.055,'sawtooth');osc(95,.28,.045,'square',.06)}
 else if(type==='turn'){osc(230,.035,.012,'triangle')}
 else if(type==='best'){osc(620,.09,.04,'sine');osc(820,.1,.04,'sine',.08);osc(1080,.16,.035,'triangle',.16)}
}
function resize(){var r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
function spawnFood(){do{food={x:Math.floor(Math.random()*GRID),y:Math.floor(Math.random()*GRID)}}while(snake.some(function(p){return p.x===food.x&&p.y===food.y}))}
function resetState(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10},{x:7,y:10}];dir='right';nextDir='right';score=0;step=105;scoreEl.textContent='0';statusEl.textContent='READY';spawnFood();draw()}
function start(){if(!running){resetState();running=true}paused=false;overlay.classList.add('is-hidden');statusEl.textContent='LIVE';pauseBtn.textContent='Pause';ensureAudio();sfx('start');last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function togglePause(){if(!running)return;paused=!paused;pauseBtn.textContent=paused?'Resume':'Pause';statusEl.textContent=paused?'PAUSED':'LIVE';if(!paused){last=performance.now();raf=requestAnimationFrame(loop)}}
function gameOver(){running=false;paused=false;statusEl.textContent='GAME OVER';overlay.classList.remove('is-hidden');overlay.querySelector('h3').textContent='Game Over';overlay.querySelector('p').textContent='Score '+score+' · press Start to run again.';startBtn.textContent='Start Again';sfx('hit');if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('rk_snake_best',String(best))}catch(e){}setTimeout(function(){sfx('best')},260)}}
function setDir(n){if(opposite[dir]===n)return;nextDir=n;sfx('turn')}
function update(){dir=nextDir;var d=DIR[dir],head={x:snake[0].x+d[0],y:snake[0].y+d[1]};if(head.x<0||head.y<0||head.x>=GRID||head.y>=GRID||snake.some(function(p,i){return i>0&&p.x===head.x&&p.y===head.y})){gameOver();return}snake.unshift(head);if(head.x===food.x&&head.y===food.y){score++;scoreEl.textContent=score;step=Math.max(60,105-score*1.8);spawnFood();sfx('eat');if(boardWrap&&boardWrap.animate)boardWrap.animate([{filter:'brightness(1)'},{filter:'brightness(1.12)'},{filter:'brightness(1)'}],{duration:260,easing:'ease-out'})}else snake.pop()}
function draw(){var w=canvas.clientWidth||canvas.width,h=canvas.clientHeight||canvas.height;if(!w||!h)return;ctx.clearRect(0,0,w,h);var cell=Math.min(w,h)/GRID,ox=(w-cell*GRID)/2,oy=(h-cell*GRID)/2;
 var g=ctx.createRadialGradient(w*.28,h*.18,10,w*.5,h*.5,w*.75);g.addColorStop(0,'rgba(38,214,255,.07)');g.addColorStop(1,'rgba(2,9,15,.02)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 if(food){var fx=ox+(food.x+.5)*cell,fy=oy+(food.y+.5)*cell;ctx.save();ctx.shadowBlur=22;ctx.shadowColor='#ff4d78';ctx.fillStyle='#ff527b';ctx.beginPath();ctx.arc(fx,fy,cell*.28,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.72)';ctx.beginPath();ctx.arc(fx-cell*.08,fy-cell*.09,cell*.07,0,Math.PI*2);ctx.fill();ctx.restore()}
 snake.forEach(function(p,i){var x=ox+p.x*cell,y=oy+p.y*cell,pad=cell*.09,r=cell*.28;ctx.save();ctx.shadowBlur=i===0?18:10;ctx.shadowColor=i===0?'#4dffa7':'rgba(77,224,255,.38)';var grad=ctx.createLinearGradient(x,y,x+cell,y+cell);grad.addColorStop(0,i===0?'#8affc4':'#45e8a2');grad.addColorStop(1,i===0?'#37dfff':'#2ba9e8');ctx.fillStyle=grad;roundRect(x+pad,y+pad,cell-pad*2,cell-pad*2,r);ctx.fill();ctx.fillStyle='rgba(255,255,255,.26)';roundRect(x+pad*1.5,y+pad*1.4,(cell-pad*3)*.52,(cell-pad*3)*.22,r);ctx.fill();ctx.restore()})}
function roundRect(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function loop(t){if(!running||paused)return;if(t-last>=step){last=t;update();draw()}if(running)raf=requestAnimationFrame(loop)}
window.addEventListener('keydown',function(e){var map={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};if(map[e.key]){e.preventDefault();setDir(map[e.key])}if(e.code==='Space'){e.preventDefault();togglePause()}});
dpad.forEach(function(b){b.addEventListener('click',function(){setDir(b.dataset.dir)})});
startBtn.addEventListener('click',start);pauseBtn.addEventListener('click',togglePause);restartBtn.addEventListener('click',function(){running=false;start()});
if(boardWrap){boardWrap.addEventListener('pointermove',function(e){if(matchMedia('(hover:hover) and (pointer:fine)').matches){var r=boardWrap.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;boardWrap.style.transform='perspective(1200px) rotateX('+(-y*4).toFixed(2)+'deg) rotateY('+(x*5).toFixed(2)+'deg)'}});boardWrap.addEventListener('pointerleave',function(){boardWrap.style.transform='perspective(1200px) rotateX(0deg) rotateY(0deg)'})}
window.addEventListener('resize',resize,{passive:true});resetState();requestAnimationFrame(resize);
})();
