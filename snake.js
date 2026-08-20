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
 if(type==='eat'){osc(420,.08,.035,'triangle');osc(690,.12,.032,'sine',.035);osc(910,.12,.025,'triangle',.08)}
 else if(type==='start'){osc(250,.08,.025,'sine');osc(390,.08,.03,'triangle',.06);osc(590,.12,.03,'sine',.12)}
 else if(type==='hit'){osc(125,.18,.05,'sawtooth');osc(82,.3,.035,'square',.055)}
 else if(type==='turn'){osc(205,.03,.008,'triangle')}
 else if(type==='best'){osc(520,.09,.035,'sine');osc(720,.1,.036,'sine',.08);osc(970,.16,.03,'triangle',.16)}
}

function resize(){var r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
function spawnFood(){do{food={x:Math.floor(Math.random()*GRID),y:Math.floor(Math.random()*GRID)}}while(snake.some(function(p){return p.x===food.x&&p.y===food.y}))}
function resetState(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10},{x:7,y:10},{x:6,y:10}];dir='right';nextDir='right';score=0;step=105;scoreEl.textContent='0';statusEl.textContent='READY';spawnFood();draw()}
function start(){if(!running){resetState();running=true}paused=false;overlay.classList.add('is-hidden');statusEl.textContent='LIVE';pauseBtn.textContent='Pause';ensureAudio();sfx('start');last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function togglePause(){if(!running)return;paused=!paused;pauseBtn.textContent=paused?'Resume':'Pause';statusEl.textContent=paused?'PAUSED':'LIVE';if(!paused){last=performance.now();raf=requestAnimationFrame(loop)}}
function gameOver(){running=false;paused=false;statusEl.textContent='GAME OVER';overlay.classList.remove('is-hidden');overlay.querySelector('h3').textContent='Game Over';overlay.querySelector('p').textContent='Score '+score+' · press Start to run again.';startBtn.textContent='Start Again';sfx('hit');if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('rk_snake_best',String(best))}catch(e){}setTimeout(function(){sfx('best')},260)}}
function setDir(n){if(opposite[dir]===n)return;nextDir=n;sfx('turn')}
function update(){dir=nextDir;var d=DIR[dir],head={x:snake[0].x+d[0],y:snake[0].y+d[1]};if(head.x<0||head.y<0||head.x>=GRID||head.y>=GRID||snake.some(function(p,i){return i>0&&p.x===head.x&&p.y===head.y})){gameOver();return}snake.unshift(head);if(head.x===food.x&&head.y===food.y){score++;scoreEl.textContent=score;step=Math.max(60,105-score*1.8);spawnFood();sfx('eat');if(boardWrap&&boardWrap.animate)boardWrap.animate([{filter:'brightness(1)'},{filter:'brightness(1.13) saturate(1.08)'},{filter:'brightness(1)'}],{duration:280,easing:'ease-out'})}else snake.pop()}

function roundedPath(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

function drawApple(cx,cy,s){
 ctx.save();
 ctx.shadowBlur=s*.55;ctx.shadowColor='rgba(218,28,30,.45)';
 var g=ctx.createRadialGradient(cx-s*.23,cy-s*.3,s*.05,cx,cy,s*.58);g.addColorStop(0,'#ff9691');g.addColorStop(.22,'#f54b3f');g.addColorStop(.72,'#ce1c17');g.addColorStop(1,'#8c0e0b');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx-s*.18,cy,s*.34,0,Math.PI*2);ctx.arc(cx+s*.18,cy,s*.34,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.strokeStyle='#5d3a12';ctx.lineWidth=Math.max(2,s*.06);ctx.beginPath();ctx.moveTo(cx,cy-s*.28);ctx.quadraticCurveTo(cx+s*.04,cy-s*.48,cx+s*.1,cy-s*.58);ctx.stroke();
 ctx.fillStyle='#6da81f';ctx.beginPath();ctx.ellipse(cx+s*.17,cy-s*.5,s*.18,s*.08,-.5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.62)';ctx.beginPath();ctx.ellipse(cx-s*.17,cy-s*.18,s*.08,s*.13,-.6,0,Math.PI*2);ctx.fill();
 ctx.restore();
}

function bodyAngle(i){
 var p=snake[i],prev=snake[Math.min(i+1,snake.length-1)];
 var nx=snake[Math.max(0,i-1)];
 var dx=(nx.x-prev.x),dy=(nx.y-prev.y);
 return Math.atan2(dy,dx);
}

function drawBodySegment(cx,cy,s,i){
 var angle=bodyAngle(i),tail=i===snake.length-1;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
 var w=s*(tail?.62:.9),h=s*(tail?.48:.72);
 ctx.shadowBlur=s*.22;ctx.shadowColor='rgba(14,34,6,.35)';
 var g=ctx.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'#b5dc3e');g.addColorStop(.22,'#84bb1f');g.addColorStop(.68,'#5b8f0d');g.addColorStop(1,'#364f07');
 roundedPath(-w/2,-h/2,w,h,h*.48);ctx.fillStyle=g;ctx.fill();
 ctx.shadowBlur=0;
 ctx.strokeStyle='rgba(48,71,8,.6)';ctx.lineWidth=Math.max(1,s*.025);roundedPath(-w/2,-h/2,w,h,h*.48);ctx.stroke();
 ctx.fillStyle='rgba(220,226,42,.72)';roundedPath(-w*.43,h*.02,w*.86,h*.34,h*.2);ctx.fill();
 ctx.strokeStyle='rgba(65,92,13,.28)';ctx.lineWidth=Math.max(.8,s*.018);
 for(var k=-2;k<=2;k++){ctx.beginPath();ctx.arc(k*w*.16,-h*.12,s*.045,0,Math.PI*2);ctx.stroke()}
 ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(-w*.12,-h*.23,w*.24,h*.08,0,0,Math.PI*2);ctx.fill();
 ctx.restore();
}

function drawHead(cx,cy,s){
 var ang={right:0,left:Math.PI,up:-Math.PI/2,down:Math.PI/2}[dir]||0;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);
 ctx.shadowBlur=s*.42;ctx.shadowColor='rgba(31,76,8,.5)';
 var g=ctx.createLinearGradient(-s*.45,-s*.42,s*.45,s*.4);g.addColorStop(0,'#b9e24b');g.addColorStop(.35,'#8ec526');g.addColorStop(.78,'#65980f');g.addColorStop(1,'#355806');
 ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(s*.03,0,s*.53,s*.38,0,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.strokeStyle='rgba(53,76,8,.65)';ctx.lineWidth=Math.max(1,s*.028);ctx.stroke();
 ctx.fillStyle='#d6d733';ctx.beginPath();ctx.ellipse(-s*.03,s*.18,s*.39,s*.14,0,0,Math.PI*2);ctx.fill();
 function eye(y){ctx.fillStyle='#e9d741';ctx.beginPath();ctx.ellipse(s*.24,y,s*.13,s*.12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0c0d08';ctx.beginPath();ctx.ellipse(s*.28,y,s*.064,s*.08,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.92)';ctx.beginPath();ctx.arc(s*.3,y-s*.025,s*.022,0,Math.PI*2);ctx.fill()}
 eye(-s*.21);eye(s*.21);
 ctx.fillStyle='#21330b';ctx.beginPath();ctx.arc(s*.5,-s*.105,s*.025,0,Math.PI*2);ctx.arc(s*.5,s*.105,s*.025,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ef3a52';ctx.lineWidth=Math.max(1.4,s*.035);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s*.5,0);ctx.lineTo(s*.79,0);ctx.lineTo(s*.91,-s*.08);ctx.moveTo(s*.79,0);ctx.lineTo(s*.91,s*.08);ctx.stroke();
 ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(-s*.08,-s*.19,s*.2,s*.065,-.1,0,Math.PI*2);ctx.fill();
 ctx.restore();
}

function draw(){
 var w=canvas.clientWidth||canvas.width,h=canvas.clientHeight||canvas.height;if(!w||!h)return;ctx.clearRect(0,0,w,h);
 var cell=Math.min(w,h)/GRID,ox=(w-cell*GRID)/2,oy=(h-cell*GRID)/2;
 var floor=ctx.createLinearGradient(0,0,w,h);floor.addColorStop(0,'rgba(117,137,55,.20)');floor.addColorStop(.5,'rgba(65,89,31,.11)');floor.addColorStop(1,'rgba(24,42,15,.18)');ctx.fillStyle=floor;ctx.fillRect(0,0,w,h);
 if(food)drawApple(ox+(food.x+.5)*cell,oy+(food.y+.5)*cell,cell*.92);
 for(var i=snake.length-1;i>=1;i--){var p=snake[i];drawBodySegment(ox+(p.x+.5)*cell,oy+(p.y+.5)*cell,cell,i)}
 if(snake[0])drawHead(ox+(snake[0].x+.5)*cell,oy+(snake[0].y+.5)*cell,cell*1.08);
}

function loop(t){if(!running||paused)return;if(t-last>=step){last=t;update();draw()}if(running)raf=requestAnimationFrame(loop)}
window.addEventListener('keydown',function(e){var map={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};if(map[e.key]){e.preventDefault();setDir(map[e.key])}if(e.code==='Space'){e.preventDefault();togglePause()}});
dpad.forEach(function(b){b.addEventListener('click',function(){setDir(b.dataset.dir)})});
startBtn.addEventListener('click',start);pauseBtn.addEventListener('click',togglePause);restartBtn.addEventListener('click',function(){running=false;start()});
if(boardWrap){var sx=0,sy=0,swiping=false;boardWrap.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY;swiping=true},{passive:true});boardWrap.addEventListener('pointerup',function(e){if(!swiping)return;swiping=false;var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;setDir(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))},{passive:true});boardWrap.addEventListener('pointermove',function(e){if(matchMedia('(hover:hover) and (pointer:fine)').matches){var r=boardWrap.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;boardWrap.style.transform='perspective(1200px) rotateX('+(-y*4).toFixed(2)+'deg) rotateY('+(x*5).toFixed(2)+'deg)'}},{passive:true});boardWrap.addEventListener('pointerleave',function(){swiping=false;boardWrap.style.transform='perspective(1200px) rotateX(0deg) rotateY(0deg)'},{passive:true})}
window.addEventListener('resize',resize,{passive:true});resetState();requestAnimationFrame(resize);
})();
