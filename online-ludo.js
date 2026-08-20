import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField, collection, query, where, orderBy, limit, onSnapshot, runTransaction, serverTimestamp, getDocs, writeBatch } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const COLORS=['red','green','yellow','blue'];
const NAMES={red:'Red',green:'Green',yellow:'Yellow',blue:'Blue'};
const START={red:1,green:14,yellow:27,blue:40};
const SAFE=[1,9,14,22,27,35,40,48];
const FACES=['⚀','⚁','⚂','⚃','⚄','⚅'];
const path=[];
for(let x=0;x<14;x++)path.push([x,0]);
for(let y=1;y<14;y++)path.push([13,y]);
for(let x=12;x>=0;x--)path.push([x,13]);
for(let y=12;y>=1;y--)path.push([0,y]);
const lanes={red:[[1,6],[2,6],[3,6],[4,6],[5,6],[6,6]],green:[[12,6],[11,6],[10,6],[9,6],[8,6],[7,6]],yellow:[[12,7],[11,7],[10,7],[9,7],[8,7],[7,7]],blue:[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]]};

const $=id=>document.getElementById(id);
const ui={
 signIn:$('googleSignIn'),signOut:$('googleSignOut'),avatar:$('authAvatar'),name:$('authName'),email:$('authEmail'),status:$('connectionStatus'),setup:$('setupNote'),
 create:$('createRoom'),join:$('joinRoom'),maxPlayers:$('maxPlayers'),joinCode:$('joinCode'),roomLive:$('roomLive'),roomCode:$('roomCodeText'),roomPlayers:$('roomPlayers'),copy:$('copyRoom'),share:$('shareRoom'),leave:$('leaveRoom'),start:$('startOnlineGame'),
 games:$('historyGames'),wins:$('historyWins'),rate:$('historyRate'),history:$('historyList'),wrap:$('onlineGameWrap'),roomBadge:$('onlineRoomBadge'),
 board:$('onlineLudoBoard'),cells:$('onlineBoardCells'),layer:$('onlineTokensLayer'),flare:$('onlineGoalFlare'),roll:$('onlineRollDice'),cube:$('onlineDiceCube'),face:$('onlineDiceFace'),hint:$('onlineDiceHint'),turnName:$('onlineTurnName'),turnDot:$('onlineTurnDot'),turnPhoto:$('onlineTurnPhoto'),turnMessage:$('onlineTurnMessage'),scores:$('onlineScoreStack'),sound:$('onlineSoundToggle'),invite:$('onlineInvite'),toast:$('toastStack')
};

const CFG=window.RK_FIREBASE||{};
const firebaseConfig={
 apiKey:CFG.API_KEY||'',
 authDomain:CFG.AUTH_DOMAIN||((CFG.PROJECT_ID||'')?CFG.PROJECT_ID+'.firebaseapp.com':''),
 projectId:CFG.PROJECT_ID||'',
 appId:CFG.APP_ID||undefined,
 messagingSenderId:CFG.MESSAGING_SENDER_ID||undefined,
 storageBucket:CFG.STORAGE_BUCKET||undefined
};
const configured=!!(firebaseConfig.apiKey&&firebaseConfig.projectId&&firebaseConfig.authDomain);
let app=null,auth=null,db=null,user=null,roomId='',room=null,roomUnsub=null,historyUnsub=null,soundOn=true,lastMoveVersion=-1;

function toast(msg,type=''){
 const el=document.createElement('div');el.className='online-toast '+type;el.textContent=msg;ui.toast.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(-5px)';setTimeout(()=>el.remove(),260)},3400);
}
function setStatus(text,good=false){ui.status.querySelector('span').textContent=text;ui.status.style.color=good?'#82ffc5':'';}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function initials(name){return String(name||'?').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'?';}
function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';crypto.getRandomValues(new Uint32Array(6)).forEach(n=>s+=chars[n%chars.length]);return s;}
function blankTokens(){const out={};COLORS.forEach(c=>{out[c]=Array.from({length:4},(_,i)=>({id:c+'-'+i,color:c,index:i,progress:-1,finished:false}))});return out;}
function freshGame(players){return {turn:0,roll:null,rolled:false,winner:null,tokens:blankTokens(),version:0,lastAction:'start',lastActor:'',updatedAt:Date.now(),playerCount:players.length};}
function rgba(color,a){const m={red:'255,77,103',green:'41,214,154',yellow:'255,191,63',blue:'77,162,255'};return `rgba(${m[color]},${a})`;}
function tone(color){return {red:'#ff4d67',green:'#29d69a',yellow:'#ffbf3f',blue:'#4da2ff'}[color];}
function playerForColor(color,r=room){return (r?.players||[]).find(p=>p.color===color);}
function activePlayers(r=room){return (r?.players||[]).slice().sort((a,b)=>COLORS.indexOf(a.color)-COLORS.indexOf(b.color));}
function myPlayer(){return (room?.players||[]).find(p=>p.uid===user?.uid);}
function myColor(){return myPlayer()?.color||'';}
function currentPlayer(r=room){const arr=activePlayers(r);return arr[(r?.game?.turn||0)%Math.max(1,arr.length)];}
function myTurn(){const p=currentPlayer();return !!(p&&user&&p.uid===user.uid&&room?.status==='playing'&&!room?.game?.winner);}
function canMove(token,roll){if(!roll||token.finished)return false;if(token.progress<0)return roll===6;return token.progress+roll<=57;}
function movableTokens(game,color){return (game.tokens?.[color]||[]).filter(t=>canMove(t,game.roll));}

function buildBoard(){
 ui.cells.innerHTML='';
 const cellAt=(coord,cls)=>{const d=document.createElement('div');d.className=cls;d.style.gridColumn=coord[0]+1;d.style.gridRow=coord[1]+1;return d};
 path.forEach((c,i)=>{const d=cellAt(c,'path-cell'+(SAFE.includes(i)?' safe':'')+(i===START.red?' start-red':'')+(i===START.green?' start-green':'')+(i===START.yellow?' start-yellow':'')+(i===START.blue?' start-blue':''));ui.cells.appendChild(d)});
 COLORS.forEach(color=>lanes[color].forEach(c=>ui.cells.appendChild(cellAt(c,'lane-cell '+color))));
 ui.board.querySelectorAll('.home-dots').forEach(z=>z.innerHTML='<i></i><i></i><i></i><i></i>');
}
function homeDotPosition(token){const zone=ui.board.querySelector(`.home-zone[data-color="${token.color}"]`),dots=zone.querySelectorAll('.home-dots i'),r=dots[token.index].getBoundingClientRect(),br=ui.board.getBoundingClientRect();return{x:r.left-br.left+r.width/2,y:r.top-br.top+r.height/2};}
function gridPosition(coord){const br=ui.board.getBoundingClientRect();return{x:(coord[0]+.5)*br.width/14,y:(coord[1]+.5)*br.height/14};}
function tokenPosition(token){if(token.progress<0)return homeDotPosition(token);if(token.progress<=51)return gridPosition(path[(START[token.color]+token.progress)%52]);if(token.progress<=57)return gridPosition(lanes[token.color][token.progress-52]);return gridPosition([6.5,6.5]);}
function spreadStacked(){const buckets={};ui.layer.querySelectorAll('.ludo-token').forEach(el=>{const key=Math.round(parseFloat(el.style.left))+'-'+Math.round(parseFloat(el.style.top));(buckets[key]||(buckets[key]=[])).push(el)});Object.values(buckets).forEach(arr=>{if(arr.length<2)return;arr.forEach((el,i)=>{const a=Math.PI*2*i/arr.length;el.style.marginLeft=Math.cos(a)*9+'px';el.style.marginTop=Math.sin(a)*9+'px'})});}
function renderTokens(){
 ui.layer.innerHTML='';if(!room?.game)return;
 activePlayers().forEach(p=>(room.game.tokens[p.color]||[]).forEach(token=>{const b=document.createElement('button');b.type='button';b.className='ludo-token '+token.color+(token.finished?' finished':'')+(p.uid===user?.uid?' you-token':'');b.dataset.id=token.id;b.setAttribute('aria-label',NAMES[token.color]+' token '+(token.index+1));const pos=tokenPosition(token);b.style.left=pos.x+'px';b.style.top=pos.y+'px';if(myTurn()&&p.uid===user.uid&&room.game.rolled&&canMove(token,room.game.roll))b.classList.add('movable');if(room.game.version!==lastMoveVersion&&room.game.lastToken===token.id)b.classList.add('remote-last');b.addEventListener('click',()=>moveToken(token.id));ui.layer.appendChild(b)}));spreadStacked();lastMoveVersion=room.game.version;
}
function renderScores(){ui.scores.innerHTML='';const cur=currentPlayer();activePlayers().forEach(p=>{const row=document.createElement('div');row.className='player-score'+(cur?.uid===p.uid?' active':'')+(p.uid===user?.uid?' is-you':'');const dot=document.createElement('i');dot.style.background=tone(p.color);const img=document.createElement('img');img.alt='';if(p.photo)img.src=p.photo;else{img.removeAttribute('src');img.style.background=rgba(p.color,.12)}const b=document.createElement('b');b.className='online-name';b.textContent=p.name+(p.uid===user?.uid?' (You)':'');const s=document.createElement('span');s.textContent=(room.game.tokens[p.color]||[]).filter(t=>t.finished).length+'/4 home';row.append(dot,img,b,s);ui.scores.appendChild(row)});}
function renderTurn(){
 if(!room?.game)return;const p=currentPlayer();if(!p)return;
 ui.turnName.textContent=p.name+(p.uid===user?.uid?' (You)':'');ui.turnDot.style.background=tone(p.color);ui.turnDot.style.boxShadow=`0 0 0 7px ${rgba(p.color,.09)},0 0 20px ${rgba(p.color,.3)}`;
 ui.turnPhoto.innerHTML=p.photo?`<img src="${esc(p.photo)}" alt="">`:esc(initials(p.name));
 const yours=myTurn();ui.roll.classList.toggle('not-yours',!yours||room.game.rolled);ui.roll.disabled=!yours||room.game.rolled;
 if(room.status!=='playing'){ui.turnMessage.textContent='Waiting for host to start.';ui.hint.textContent='Waiting…';return}
 if(room.game.winner){const wp=playerForColor(room.game.winner);ui.turnMessage.textContent=(wp?.name||NAMES[room.game.winner])+' won the match!';ui.hint.textContent='Match finished';return}
 if(yours){ui.turnMessage.textContent=room.game.rolled?'Choose one of your glowing tokens.':'Your turn — roll the dice.';ui.hint.textContent=room.game.rolled?'Rolled '+room.game.roll:'Tap to roll'}else{ui.turnMessage.textContent='Waiting for '+p.name+'…';ui.hint.textContent='Opponent turn'}
 ui.cube.dataset.value=String(room.game.roll||1);ui.face.textContent=FACES[(room.game.roll||1)-1];
}
function renderGame(){if(!room)return;ui.wrap.hidden=room.status==='waiting';ui.wrap.classList.toggle('game-enter',room.status==='playing');ui.roomBadge.textContent='ROOM '+room.id;ui.board.dataset.turn=currentPlayer()?.color||'';COLORS.forEach(c=>ui.board.querySelector(`.home-zone[data-color="${c}"]`)?.classList.toggle('is-disabled',!playerForColor(c)));renderTokens();renderScores();renderTurn();}
function renderRoom(){
 if(!room){ui.roomLive.classList.remove('on');ui.wrap.hidden=true;return}
 ui.roomLive.classList.add('on');ui.roomCode.textContent=room.id;ui.start.hidden=room.status!=='waiting';ui.start.disabled=!(room.hostUid===user?.uid&&room.players?.length>=2);
 ui.roomPlayers.innerHTML='';activePlayers().forEach(p=>{const row=document.createElement('div');row.className='room-player';row.innerHTML=`<div class="room-player-avatar">${p.photo?`<img src="${esc(p.photo)}" alt="">`:esc(initials(p.name))}</div><div class="room-player-copy"><b>${esc(p.name)}${p.uid===user?.uid?' (You)':''}</b><span>${p.uid===room.hostUid?'Host · ':''}${NAMES[p.color]} player</span></div><i class="room-color" style="background:${tone(p.color)}"></i>`;ui.roomPlayers.appendChild(row)});
 renderGame();
}
function renderAuth(u){
 user=u;ui.signIn.hidden=!!u;ui.signOut.hidden=!u;ui.create.disabled=!u||!configured;ui.join.disabled=!u||!configured;
 if(u){ui.name.textContent=u.displayName||'Player';ui.email.textContent=u.email||'Signed in';ui.avatar.innerHTML=u.photoURL?`<img src="${esc(u.photoURL)}" alt="">`:esc(initials(u.displayName));setStatus('ONLINE',true)}else{ui.name.textContent='Google account required';ui.email.textContent='Sign in to create or join private rooms.';ui.avatar.textContent='G';setStatus(configured?'SIGNED OUT':'SETUP')}
}
async function ensureProfile(){if(!user||!db)return;await setDoc(doc(db,'users',user.uid),{displayName:user.displayName||'Player',email:user.email||'',photoURL:user.photoURL||'',lastSeenAt:serverTimestamp()},{merge:true});}

async function roomExists(code){const s=await getDoc(doc(db,'rooms',code));return s.exists();}
async function uniqueCode(){for(let i=0;i<7;i++){const c=randomCode();if(!(await roomExists(c)))return c}throw new Error('Could not make a unique room code. Try again.');}
async function createRoom(){
 if(!user)return toast('Sign in with Google first.','error');
 try{ui.create.disabled=true;const code=await uniqueCode(),max=Math.max(2,Math.min(4,parseInt(ui.maxPlayers.value,10)||4));const p={uid:user.uid,name:user.displayName||'Player',photo:user.photoURL||'',color:'red',joinedAt:Date.now()};await setDoc(doc(db,'rooms',code),{id:code,hostUid:user.uid,status:'waiting',maxPlayers:max,players:[p],createdAt:serverTimestamp(),updatedAt:serverTimestamp(),game:freshGame([p])});joinRoomListener(code);toast('Room created. Share the code with friends.','good')}catch(e){toast(e.message||'Could not create room.','error')}finally{ui.create.disabled=!user}}
async function joinRoom(){
 if(!user)return toast('Sign in with Google first.','error');const code=String(ui.joinCode.value||'').trim().toUpperCase();if(code.length!==6)return toast('Enter the 6-character room code.','error');
 try{ui.join.disabled=true;const ref=doc(db,'rooms',code);await runTransaction(db,async tx=>{const snap=await tx.get(ref);if(!snap.exists())throw new Error('Room not found.');const r=snap.data();if(r.status!=='waiting')throw new Error('This match has already started.');const players=r.players||[];if(players.some(p=>p.uid===user.uid))return;if(players.length>=r.maxPlayers)throw new Error('Room is full.');const used=new Set(players.map(p=>p.color));const color=COLORS.find(c=>!used.has(c));players.push({uid:user.uid,name:user.displayName||'Player',photo:user.photoURL||'',color,joinedAt:Date.now()});tx.update(ref,{players,updatedAt:serverTimestamp()})});joinRoomListener(code);toast('Joined room '+code+'.','good')}catch(e){toast(e.message||'Could not join room.','error')}finally{ui.join.disabled=!user}}
function joinRoomListener(code){if(roomUnsub)roomUnsub();roomId=code;roomUnsub=onSnapshot(doc(db,'rooms',code),snap=>{if(!snap.exists()){room=null;roomId='';renderRoom();toast('Room closed.','error');return}room={...snap.data(),id:snap.id};renderRoom();},{error:e=>toast('Room connection lost: '+e.message,'error')});history.replaceState(null,'','online-ludo.html?room='+encodeURIComponent(code));}
async function leaveRoom(){
 if(!room||!user)return;try{const ref=doc(db,'rooms',room.id);await runTransaction(db,async tx=>{const snap=await tx.get(ref);if(!snap.exists())return;const r=snap.data(),players=(r.players||[]).filter(p=>p.uid!==user.uid);if(!players.length){tx.delete(ref);return}let hostUid=r.hostUid;if(hostUid===user.uid)hostUid=players[0].uid;tx.update(ref,{players,hostUid,updatedAt:serverTimestamp()})});if(roomUnsub)roomUnsub();roomUnsub=null;room=null;roomId='';renderRoom();history.replaceState(null,'','online-ludo.html');toast('Left the room.')}catch(e){toast(e.message,'error')}}
async function startMatch(){
 if(!room||room.hostUid!==user?.uid)return;try{await runTransaction(db,async tx=>{const ref=doc(db,'rooms',room.id),snap=await tx.get(ref);if(!snap.exists())throw new Error('Room missing.');const r=snap.data();if(r.status!=='waiting')return;if((r.players||[]).length<2)throw new Error('At least 2 players are required.');tx.update(ref,{status:'playing',game:freshGame(r.players||[]),startedAt:serverTimestamp(),updatedAt:serverTimestamp()})});toast('Match started!','good')}catch(e){toast(e.message,'error')}}

async function rollDice(){
 if(!myTurn()||room?.game?.rolled)return;
 ui.roll.classList.add('rolling');setTimeout(()=>ui.roll.classList.remove('rolling'),720);
 try{await runTransaction(db,async tx=>{const ref=doc(db,'rooms',room.id),snap=await tx.get(ref);if(!snap.exists())throw new Error('Room missing.');const r=snap.data(),g=r.game,players=(r.players||[]).slice().sort((a,b)=>COLORS.indexOf(a.color)-COLORS.indexOf(b.color)),cp=players[g.turn%players.length];if(r.status!=='playing'||g.winner||cp.uid!==user.uid||g.rolled)throw new Error('Not your turn.');const roll=1+Math.floor(Math.random()*6),ng={...g,roll,rolled:true,version:(g.version||0)+1,lastAction:'roll',lastActor:user.uid,updatedAt:Date.now()};const moves=movableTokens(ng,cp.color);if(!moves.length){ng.rolled=false;ng.roll=null;ng.turn=(ng.turn+1)%players.length;ng.lastAction='no-move'}tx.update(ref,{game:ng,updatedAt:serverTimestamp()})})}catch(e){toast(e.message,'error')}}
async function moveToken(tokenId){
 if(!myTurn()||!room?.game?.rolled)return;
 try{await runTransaction(db,async tx=>{const ref=doc(db,'rooms',room.id),snap=await tx.get(ref);if(!snap.exists())throw new Error('Room missing.');const r=snap.data(),g=JSON.parse(JSON.stringify(r.game)),players=(r.players||[]).slice().sort((a,b)=>COLORS.indexOf(a.color)-COLORS.indexOf(b.color)),cp=players[g.turn%players.length];if(r.status!=='playing'||g.winner||cp.uid!==user.uid||!g.rolled)throw new Error('Move unavailable.');const token=(g.tokens[cp.color]||[]).find(t=>t.id===tokenId);if(!token||!canMove(token,g.roll))throw new Error('Illegal move.');const roll=g.roll;token.progress=token.progress<0?0:token.progress+roll;let captured=false,finished=false;
 if(token.progress<=51){const ring=(START[token.color]+token.progress)%52;if(!SAFE.includes(ring)){players.forEach(p=>{if(p.color===token.color)return;(g.tokens[p.color]||[]).forEach(other=>{if(other.progress>=0&&other.progress<=51&&((START[other.color]+other.progress)%52)===ring){other.progress=-1;other.finished=false;captured=true}})})}}
 if(token.progress===57&&!token.finished){token.finished=true;finished=true}
 const allHome=(g.tokens[token.color]||[]).every(t=>t.finished);g.version=(g.version||0)+1;g.lastToken=token.id;g.lastActor=user.uid;g.lastAction=allHome?'win':captured?'capture':finished?'home':'move';g.updatedAt=Date.now();g.roll=null;g.rolled=false;
 if(allHome){g.winner=token.color}else if(!(roll===6||captured||finished)){g.turn=(g.turn+1)%players.length}
 tx.update(ref,{game:g,status:allHome?'finished':'playing',finishedAt:allHome?serverTimestamp():null,updatedAt:serverTimestamp()});});
 if(room?.game?.winner)celebrate(room.game.winner);
 }catch(e){toast(e.message,'error')}
}
function celebrate(color){ui.flare.classList.remove('go');void ui.flare.offsetWidth;ui.flare.classList.add('go');for(let i=0;i<24;i++){const p=document.createElement('i');p.style.cssText=`position:absolute;z-index:50;left:50%;top:50%;width:7px;height:7px;border-radius:2px;background:${i%2?tone(color):'#fff'};pointer-events:none`;ui.board.appendChild(p);const a=Math.random()*Math.PI*2,d=80+Math.random()*220;p.animate([{transform:'translate(-50%,-50%)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) rotate(${Math.random()*720}deg) scale(.2)`,opacity:0}],{duration:850+Math.random()*650,easing:'cubic-bezier(.1,.7,.2,1)'}).onfinish=()=>p.remove()}}

async function saveFinishedMatchIfNeeded(r){
 if(!user||r?.status!=='finished'||!r.game?.winner)return;const winner=playerForColor(r.game.winner,r),matchRef=doc(db,'users',user.uid,'matches',r.id),snap=await getDoc(matchRef);if(snap.exists())return;const mine=(r.players||[]).find(p=>p.uid===user.uid);if(!mine)return;await setDoc(matchRef,{roomId:r.id,game:'ludo',result:winner?.uid===user.uid?'win':'loss',winnerUid:winner?.uid||'',winnerName:winner?.name||'',players:(r.players||[]).map(p=>({uid:p.uid,name:p.name,color:p.color})),finishedAt:serverTimestamp(),createdAt:serverTimestamp()});}
function watchHistory(){
 if(historyUnsub)historyUnsub();if(!user){renderHistory([]);return}const q=query(collection(db,'users',user.uid,'matches'),orderBy('finishedAt','desc'),limit(30));historyUnsub=onSnapshot(q,s=>renderHistory(s.docs.map(d=>({id:d.id,...d.data()}))),()=>renderHistory([]));
}
function renderHistory(items){const wins=items.filter(x=>x.result==='win').length;ui.games.textContent=items.length;ui.wins.textContent=wins;ui.rate.textContent=items.length?Math.round(wins/items.length*100)+'%':'0%';if(!user){ui.history.innerHTML='<div class="history-empty">Sign in to see your match history.</div>';return}if(!items.length){ui.history.innerHTML='<div class="history-empty">No completed online matches yet.</div>';return}ui.history.innerHTML=items.map(x=>{const when=x.finishedAt?.toDate?x.finishedAt.toDate():null,others=(x.players||[]).filter(p=>p.uid!==user.uid).map(p=>p.name).join(', ')||'Online match';return `<div class="history-item"><div class="history-result ${x.result==='win'?'win':'loss'}">${x.result==='win'?'WIN':'LOSS'}</div><div class="history-copy"><b>${esc(others)}</b><span>Room ${esc(x.roomId||x.id)} · ${esc(x.game||'ludo')}</span></div><div class="history-date">${when?when.toLocaleDateString():''}</div></div>`}).join('');}

function copyCode(){if(!room)return;navigator.clipboard?.writeText(room.id).then(()=>toast('Room code copied.','good')).catch(()=>toast('Room code: '+room.id));}
async function shareRoom(){if(!room)return;const url=new URL(location.href);url.searchParams.set('room',room.id);const data={title:'Play Ludo with me',text:'Join my Ludo room '+room.id,url:url.toString()};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);toast('Invite link copied.','good')}}catch(e){}}
function addPointerTilt(){const stage=$('onlineLudoStage');if(!stage)return;stage.addEventListener('pointermove',e=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const r=ui.board.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;stage.classList.add('is-tilting');ui.board.style.setProperty('--board-rx',(-y*3.2).toFixed(2)+'deg');ui.board.style.setProperty('--board-ry',(x*4.2).toFixed(2)+'deg')});stage.addEventListener('pointerleave',()=>{stage.classList.remove('is-tilting');ui.board.style.setProperty('--board-rx','0deg');ui.board.style.setProperty('--board-ry','0deg')});}
function enhanceDice(){const cube=ui.cube;if(!cube||cube.querySelector('.dice-3d-face'))return;const pip=(n,pos)=>`<i style="grid-area:${pos}"></i>`;cube.insertAdjacentHTML('beforeend',`<span class="dice-3d-face front">${pip(1,'2/2')}</span><span class="dice-3d-face back">${pip(1,'1/1')}${pip(2,'1/3')}${pip(3,'2/1')}${pip(4,'2/3')}${pip(5,'3/1')}${pip(6,'3/3')}</span><span class="dice-3d-face right">${pip(1,'1/1')}${pip(2,'3/3')}</span><span class="dice-3d-face left">${pip(1,'1/1')}${pip(2,'1/3')}${pip(3,'2/2')}${pip(4,'3/1')}${pip(5,'3/3')}</span><span class="dice-3d-face top">${pip(1,'1/1')}${pip(2,'2/2')}${pip(3,'3/3')}</span><span class="dice-3d-face bottom">${pip(1,'1/1')}${pip(2,'1/3')}${pip(3,'3/1')}${pip(4,'3/3')}</span>`);}

async function init(){
 buildBoard();enhanceDice();addPointerTilt();renderAuth(null);
 ui.signIn.addEventListener('click',async()=>{if(!configured)return toast('Firebase setup is not finished yet.','error');try{const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await signInWithPopup(auth,provider)}catch(e){if(e.code==='auth/popup-blocked'||e.code==='auth/cancelled-popup-request')await signInWithRedirect(auth,new GoogleAuthProvider());else toast(e.message,'error')}});
 ui.signOut.addEventListener('click',()=>signOut(auth));ui.create.addEventListener('click',createRoom);ui.join.addEventListener('click',joinRoom);ui.leave.addEventListener('click',leaveRoom);ui.start.addEventListener('click',startMatch);ui.copy.addEventListener('click',copyCode);ui.share.addEventListener('click',shareRoom);ui.invite.addEventListener('click',shareRoom);ui.roll.addEventListener('click',rollDice);ui.sound.addEventListener('click',()=>{soundOn=!soundOn;ui.sound.textContent=soundOn?'Sound On':'Sound Off';ui.sound.setAttribute('aria-pressed',String(soundOn))});ui.joinCode.addEventListener('input',()=>ui.joinCode.value=ui.joinCode.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6));
 window.addEventListener('resize',renderTokens,{passive:true});
 if(!configured){ui.setup.classList.add('on');setStatus('SETUP');return}
 try{app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);await getRedirectResult(auth).catch(()=>null);onAuthStateChanged(auth,async u=>{renderAuth(u);if(u){await ensureProfile();watchHistory();const invite=new URLSearchParams(location.search).get('room');if(invite&&invite.length===6&&!roomId){ui.joinCode.value=invite.toUpperCase();toast('Invite loaded. Press Join when ready.')} }else{if(historyUnsub)historyUnsub();historyUnsub=null;renderHistory([]);if(roomUnsub)roomUnsub();roomUnsub=null;room=null;roomId='';renderRoom()}});setStatus('READY',true)}catch(e){ui.setup.classList.add('on');setStatus('ERROR');toast('Firebase could not start: '+e.message,'error')}
}

const roomObserver=new MutationObserver(()=>{if(room?.status==='finished')saveFinishedMatchIfNeeded(room).catch(()=>{})});roomObserver.observe(ui.wrap,{attributes:true,subtree:true,childList:true});
init();
