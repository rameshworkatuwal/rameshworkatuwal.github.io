(function(){
'use strict';
function q(s,p){return (p||document).querySelector(s)}
function qa(s,p){return [].slice.call((p||document).querySelectorAll(s))}

function launchGame(name){
  var picker=q('.game-pick[data-game="'+name+'"]');
  if(picker) picker.click();
  var target=q(name==='snake'?'#snakeGame':'#ludoGame');
  if(target){
    setTimeout(function(){
      var y=target.getBoundingClientRect().top+window.scrollY-86;
      window.scrollTo({top:y,behavior:'smooth'});
    },55);
  }
}

qa('[data-launch-game]').forEach(function(btn){
  btn.addEventListener('click',function(){
    launchGame(btn.getAttribute('data-launch-game'));
  });
});

/* Lightweight pointer depth — transform only, no layout churn. */
qa('[data-premium-card]').forEach(function(card){
  card.addEventListener('pointermove',function(e){
    if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
    var r=card.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width-.5;
    var y=(e.clientY-r.top)/r.height-.5;
    card.style.setProperty('--card-ry',(x*2.2).toFixed(2)+'deg');
    card.style.setProperty('--card-rx',(-y*1.7).toFixed(2)+'deg');
  },{passive:true});
  card.addEventListener('pointerleave',function(){
    card.style.setProperty('--card-ry','0deg');
    card.style.setProperty('--card-rx','0deg');
  },{passive:true});
});

var premiumDice=q('#premiumDice');
function previewRoll(){
  if(!premiumDice || matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  premiumDice.classList.remove('roll-preview');
  void premiumDice.offsetWidth;
  premiumDice.classList.add('roll-preview');
  setTimeout(function(){premiumDice.classList.remove('roll-preview')},850);
}
if(premiumDice){
  premiumDice.addEventListener('click',previewRoll);
  var ludoCard=premiumDice.closest('.premium-ludo-card');
  if(ludoCard)ludoCard.addEventListener('pointerenter',function(){
    if(!ludoCard.dataset.rolledOnce){ludoCard.dataset.rolledOnce='1';previewRoll()}
  },{passive:true});
}

/* If a game hash was shared, go straight to its playable area. */
var hash=(location.hash||'').replace('#','');
if(hash==='ludo'||hash==='snake'){
  setTimeout(function(){launchGame(hash)},180);
}
})();
