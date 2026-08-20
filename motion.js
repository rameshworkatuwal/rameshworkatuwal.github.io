/* Motion bootstrap: preserves the performance motion core and applies tiny page-specific cleanup. */
(function(){
  'use strict';
  function loadCore(){
    var s=document.createElement('script');
    s.src='motion-core.js?v=20260820-cleanup';
    s.defer=true;
    document.head.appendChild(s);
  }
  function cleanupPortfolioHint(){
    var hint=document.querySelector('.portfolio-panel-hint');
    if(hint) hint.remove();
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',cleanupPortfolioHint,{once:true});
  }else{
    cleanupPortfolioHint();
  }
  loadCore();
})();
