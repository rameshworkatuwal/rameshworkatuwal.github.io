(function(){
'use strict';

var COLORS=['red','green','yellow','blue'];
var NAMES={red:'Red',green:'Green',yellow:'Yellow',blue:'Blue'};
var TONES={red:'#ff4d67',green:'#29d69a',yellow:'#ffbf3f',blue:'#4da2ff'};
var RGB={red:'255,77,103',green:'41,214,154',yellow:'255,191,63',blue:'77,162,255'};
var SAFE=[0,8,13,21,26,34,39,47];

/* A real 15x15 Ludo track: 52 shared cells + six coloured home-lane cells. */
var PATH=[
 [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
 [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
 [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
 [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]
];
var START={red:0,green:13,yellow:26,blue:39};
var LANES={
 red:[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
 green:[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
 yellow:[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
 blue:[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]]
};
var MAX_PROGRESS=57; // 0..51 outer path; 52..57 home lane.
var PIPS={
 1:['2/2'],2:['1/1','3/3'],3:['1/1','2/2','3/3'],4:['1/1','1/3','3/1','3/3'],5:['1/1','1/3','2/2','3/1','3/3'],6:['1/1','2/1','3/1','1/3','2/3','3/3']
};

var state={players:4,turn:0,roll:null,rolled:false,busy:false,sound:true,winner:null,tokens:{}};
var board=document.getElementById('ludoBoard');
if(!board)return;
var cells=document.getElementById('boardCells'),layer=document.getElementById('tokensLayer'),rollBtn=document.getElementById('rollDice'),cube=document.getElementById('diceCube'),face=document.getElementById('diceFace'),hint=document.getElementById('diceHint'),turnName=document.getElementById('turnName'),turnDot=document.getElementById('turnDot'),turnMessage=document.getElementById('turnMessage'),scoreStack=document.getElementById('scoreStack'),playerCount=document.getElementById('playerCount'),newGame=document.getElementById('newGame'),soundToggle=document.getElementById('soundToggle'),goalFlare=document.getElementById('goalFlare');

function activeColors(){return COLORS.slice(0,state.players)}
function currentColor(){return activeColors()[state.turn]}
function rgba(c,a){return'rgba('+RGB[c]+','+a+')'}
function tone(c){return TONES[c]}
function sleep(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
function randomDie(){
  try{if(window.crypto&&window.crypto.getRandomValues){var a=new Uint32Array(1);window.crypto.getRandomValues(a);return(a[0]%6)+1}}catch(e){}
  return Math.floor(Math.random()*6)+1;
}
function cellAt(coord,cls){var d=document.createElement('div');d.className=cls;d.style.gridColumn=(coord[0]+1);d.style.gridRow=(coord[1]+1);return d}

function buildBoard(){
  cells.innerHTML='';
  PATH.forEach(function(c,i){
    var cls='path-cell';
    if(SAFE.indexOf(i)>=0)cls+=' safe';
    Object.keys(START).forEach(function(color){if(i===START[color])cls+=' start-'+color});
    var d=cellAt(c,cls);d.dataset.path=i;cells.appendChild(d);
  });
  COLORS.forEach(function(color){LANES[color].forEach(function(c,i){var d=cellAt(c,'lane-cell '+color);d.dataset.lane=color+'-'+i;cells.appendChild(d)})});
  document.querySelectorAll('.home-dots').forEach(function(z){z.innerHTML='<i></i><i></i><i></i><i></i>'});
}
function initTokens(){
  state.tokens={};
  COLORS.forEach(function(color){state.tokens[color]=[];for(var i=0;i<4;i++)state.tokens[color].push({id:color+'-'+i,color:color,index:i,progress:-1,finished:false})});
}
function homeDotPosition(token){
  var zone=document.querySelector('.home-zone[data-color="'+token.color+'"]'),dots=zone&&zone.querySelectorAll('.home-dots i'),br=board.getBoundingClientRect();
  if(!dots||!dots[token.index])return{x:br.width/2,y:br.height/2};
  var r=dots[token.index].getBoundingClientRect();return{x:r.left-br.left+r.width/2,y:r.top-br.top+r.height/2};
}
function gridPosition(coord){var br=board.getBoundingClientRect();return{x:(coord[0]+.5)*br.width/15,y:(coord[1]+.5)*br.height/15}}
function tokenPosition(token){
  if(token.progress<0)return homeDotPosition(token);
  if(token.progress<=51)return gridPosition(PATH[(START[token.color]+token.progress)%52]);
  return gridPosition(LANES[token.color][Math.min(5,token.progress-52)]);
}
function canMove(token,roll){if(!roll||token.finished)return false;if(token.progress<0)return roll===6;return token.progress+roll<=MAX_PROGRESS}
function movableTokens(){var c=currentColor();return(state.tokens[c]||[]).filter(function(t){return canMove(t,state.roll)})}

function createToken(token){
  var b=document.createElement('button');b.type='button';b.className='ludo-token '+token.color+(token.finished?' finished':'');b.dataset.id=token.id;b.setAttribute('aria-label',NAMES[token.color]+' token '+(token.index+1));
  var p=tokenPosition(token);b.style.left=p.x+'px';b.style.top=p.y+'px';
  if(state.rolled&&!state.busy&&canMove(token,state.roll))b.classList.add('movable');
  b.addEventListener('click',function(){if(b.classList.contains('movable'))moveToken(token)});return b;
}
function renderTokens(){
  layer.innerHTML='';activeColors().forEach(function(color){state.tokens[color].forEach(function(token){layer.appendChild(createToken(token))})});spreadStacked();
}
function spreadStacked(){
  var buckets={};layer.querySelectorAll('.ludo-token').forEach(function(el){var key=Math.round(parseFloat(el.style.left))+'-'+Math.round(parseFloat(el.style.top));(buckets[key]||(buckets[key]=[])).push(el)});
  Object.keys(buckets).forEach(function(k){var arr=buckets[k];if(arr.length<2)return;arr.forEach(function(el,i){var a=Math.PI*2*i/arr.length,r=Math.min(10,5+arr.length);el.style.marginLeft=(Math.cos(a)*r)+'px';el.style.marginTop=(Math.sin(a)*r)+'px'})});
}
function setTurnMessage(t){turnMessage.textContent=t}
function updatePanel(){
  var c=currentColor();turnName.textContent=NAMES[c];turnDot.style.background=tone(c);turnDot.style.boxShadow='0 0 0 7px '+rgba(c,.09)+',0 0 20px '+rgba(c,.3);
  scoreStack.innerHTML='';activeColors().forEach(function(color,i){var row=document.createElement('div');row.className='player-score'+(i===state.turn?' active':'');var dot=document.createElement('i');dot.style.background=tone(color);var b=document.createElement('b');b.textContent=NAMES[color];var s=document.createElement('span');s.textContent=state.tokens[color].filter(function(t){return t.finished}).length+'/4 home';row.append(dot,b,s);scoreStack.appendChild(row)});
  rollBtn.disabled=!!(state.busy||state.rolled||state.winner);renderTokens();
}

function drawDice(n){
  cube.dataset.value=String(n);cube.querySelectorAll('.v3-die-face,.dice-face-visual').forEach(function(x){x.remove()});
  var visual=document.createElement('span');visual.className='dice-face-visual';visual.setAttribute('aria-hidden','true');
  PIPS[n].forEach(function(pos){var p=document.createElement('i');p.className='pip';p.style.gridArea=pos;visual.appendChild(p)});cube.appendChild(visual);
  face.textContent='⚀⚁⚂⚃⚄⚅'.charAt(n-1);
}
function resetDice(){drawDice(1);hint.textContent='Tap to roll';rollBtn.classList.remove('rolling','roll-landed')}
function beep(freq,duration){if(!state.sound)return;try{var A=window.AudioContext||window.webkitAudioContext;beep.ctx=beep.ctx||new A();if(beep.ctx.state==='suspended')beep.ctx.resume();var o=beep.ctx.createOscillator(),g=beep.ctx.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.032,beep.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,beep.ctx.currentTime+duration);o.connect(g);g.connect(beep.ctx.destination);o.start();o.stop(beep.ctx.currentTime+duration)}catch(e){}}

function nextTurn(extra){
  if(state.winner)return;
  state.roll=null;state.rolled=false;
  if(!extra)state.turn=(state.turn+1)%state.players;
  resetDice();setTurnMessage(extra?'Bonus turn — roll again.':'Roll the dice.');updatePanel();
}
async function rollDice(){
  if(state.busy||state.rolled||state.winner)return;
  state.busy=true;rollBtn.disabled=true;rollBtn.classList.remove('roll-landed');rollBtn.classList.add('rolling');setTurnMessage('Rolling...');
  var result=randomDie();
  /* Animate intermediate faces visually, but only result becomes game state. */
  for(var i=0;i<8;i++){drawDice(randomDie());await sleep(62+i*6)}
  state.roll=result;drawDice(result);state.rolled=true;state.busy=false;rollBtn.classList.remove('rolling');void rollBtn.offsetWidth;rollBtn.classList.add('roll-landed');hint.textContent='Rolled '+result;beep(320+result*48,.12);
  var moves=movableTokens();
  if(!moves.length){setTurnMessage(result===6?'No token can move — roll again.':'No legal move. Next player.');updatePanel();await sleep(700);nextTurn(result===6);return}
  setTurnMessage(moves.length===1?'Move the glowing token.':'Choose a glowing token.');updatePanel();
}
function sharedRingIndex(token){return token.progress>=0&&token.progress<=51?(START[token.color]+token.progress)%52:null}
function captureAt(token){
  var ring=sharedRingIndex(token),captured=[];if(ring==null||SAFE.indexOf(ring)>=0)return captured;
  activeColors().forEach(function(color){if(color===token.color)return;state.tokens[color].forEach(function(other){if(sharedRingIndex(other)===ring){other.progress=-1;other.finished=false;captured.push(other)}})});return captured;
}
async function animateTokenSteps(token,from,to){
  var el=layer.querySelector('[data-id="'+token.id+'"]');if(!el)return;
  el.classList.add('step-moving');
  if(from<0){token.progress=0;var p0=tokenPosition(token);el.style.left=p0.x+'px';el.style.top=p0.y+'px';await sleep(210)}
  else{
    for(var p=from+1;p<=to;p++){token.progress=p;var pos=tokenPosition(token);el.style.left=pos.x+'px';el.style.top=pos.y+'px';beep(410+(p%4)*24,.035);await sleep(115)}
  }
  el.classList.remove('step-moving');
}
async function moveToken(token){
  if(state.busy||!state.rolled||!canMove(token,state.roll))return;
  state.busy=true;updatePanel();var roll=state.roll,from=token.progress,to=from<0?0:from+roll;
  await animateTokenSteps(token,from,to);
  var captured=captureAt(token),finished=false;
  if(captured.length){beep(205,.18);captured.forEach(function(t){var e=layer.querySelector('[data-id="'+t.id+'"]');if(e)e.classList.add('captured')});await sleep(260)}
  if(token.progress===MAX_PROGRESS&&!token.finished){token.finished=true;finished=true;goalFlare.classList.remove('go');void goalFlare.offsetWidth;goalFlare.classList.add('go');beep(760,.2)}
  var allHome=state.tokens[token.color].every(function(t){return t.finished});state.busy=false;renderTokens();
  if(allHome){state.winner=token.color;setTurnMessage(NAMES[token.color]+' wins the game!');turnName.textContent=NAMES[token.color]+' Wins';hint.textContent='Start a new game';rollBtn.disabled=true;updatePanel();celebrate(token.color);return}
  nextTurn(roll===6||captured.length>0||finished);
}
function celebrate(color){
  for(var i=0;i<34;i++){var p=document.createElement('i');p.style.position='absolute';p.style.zIndex='50';p.style.left='50%';p.style.top='50%';p.style.width='7px';p.style.height='7px';p.style.borderRadius='2px';p.style.background=i%2?tone(color):'#fff';p.style.pointerEvents='none';board.appendChild(p);var a=Math.random()*Math.PI*2,d=90+Math.random()*260,dx=Math.cos(a)*d,dy=Math.sin(a)*d;p.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) rotate('+(Math.random()*720)+'deg) scale(.2)',opacity:0}],{duration:900+Math.random()*700,easing:'cubic-bezier(.1,.7,.2,1)'}).onfinish=function(){this.effect.target.remove()}}
}
function reset(){
  state.players=Math.max(2,Math.min(4,parseInt(playerCount.value,10)||4));state.turn=0;state.roll=null;state.rolled=false;state.busy=false;state.winner=null;initTokens();resetDice();setTurnMessage('Roll the dice to start.');updatePanel();
}

rollBtn.addEventListener('click',rollDice);newGame.addEventListener('click',reset);playerCount.addEventListener('change',reset);soundToggle.addEventListener('click',function(){state.sound=!state.sound;soundToggle.textContent=state.sound?'Sound On':'Sound Off';soundToggle.setAttribute('aria-pressed',String(state.sound))});
window.addEventListener('resize',function(){if(!state.busy)renderTokens()},{passive:true});

buildBoard();reset();
})();
