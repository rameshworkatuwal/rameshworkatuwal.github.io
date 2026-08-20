(function(){
'use strict';
var enabled=true,ctx=null,lastMsg='';
function getCtx(){if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(ctx.state==='suspended')ctx.resume();return ctx}
function osc(freq,dur,vol,type,delay,slide){if(!enabled)return;var c=getCtx();if(!c)return;var t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02)}
function noise(dur,vol,delay){if(!enabled)return;var c=getCtx();if(!c)return;var len=Math.max(1,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,len,c.sampleRate),data=buf.getChannelData(0);for(var i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);var src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter(),t=c.currentTime+(delay||0);src.buffer=buf;f.type='highpass';f.frequency.value=900;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(c.destination);src.start(t);src.stop(t+dur)}
function rollSound(){noise(.08,.018,0);noise(.08,.02,.09);noise(.09,.023,.18);noise(.1,.026,.29);osc(170,.06,.014,'triangle',0,135);osc(200,.06,.015,'triangle',.11,155);osc(235,.08,.017,'triangle',.24,178)}
function landSound(v){osc(330+v*45,.08,.027,'triangle',0);osc(510+v*32,.1,.021,'sine',.045)}
function moveSound(){osc(430,.05,.018,'triangle',0,520)}
function captureSound(){osc(260,.12,.034,'square',0,130);noise(.11,.015,.02);osc(120,.15,.023,'sawtooth',.05,78)}
function homeSound(){osc(620,.1,.03,'sine',0);osc(820,.12,.032,'sine',.08);osc(1120,.18,.03,'triangle',.17)}
function winSound(){[523,659,784,1046].forEach(function(f,i){osc(f,.22,.035,i===3?'triangle':'sine',i*.09)})}
var roll=document.getElementById('rollDice'),face=document.getElementById('diceFace'),sound=document.getElementById('soundToggle'),msg=document.getElementById('turnMessage'),layer=document.getElementById('tokensLayer');
if(sound)sound.addEventListener('click',function(){enabled=sound.getAttribute('aria-pressed')!=='false';if(enabled)getCtx()});
if(roll)roll.addEventListener('click',function(){if(enabled){getCtx();rollSound()}},{capture:true});
if(layer)layer.addEventListener('click',function(e){if(e.target.closest('.ludo-token.movable'))moveSound()},{capture:true});
if(face){var mo=new MutationObserver(function(){var v='⚀⚁⚂⚃⚄⚅'.indexOf(face.textContent)+1;if(v>0&&!document.getElementById('rollDice').classList.contains('rolling'))landSound(v)});mo.observe(face,{childList:true,characterData:true,subtree:true})}
if(msg){lastMsg=msg.textContent;var mo2=new MutationObserver(function(){var t=msg.textContent||'';if(t===lastMsg)return;lastMsg=t;if(/wins/i.test(t))winSound();else if(/captur/i.test(t))captureSound();else if(/home/i.test(t))homeSound()});mo2.observe(msg,{childList:true,subtree:true})}
})();
