/* Stable 3D dice renderer for Ludo */
(function(){
'use strict';
var cube=document.getElementById('diceCube'),face=document.getElementById('diceFace');if(!cube||!face)return;
function pip(pos){return'<i style="grid-area:'+pos+'"></i>'}
var map={1:['2/2'],2:['1/1','3/3'],3:['1/1','2/2','3/3'],4:['1/1','1/3','3/1','3/3'],5:['1/1','1/3','2/2','3/1','3/3'],6:['1/1','2/1','3/1','1/3','2/3','3/3']};
function add(cls,n){var s=document.createElement('span');s.className='v3-die-face '+cls;s.innerHTML=map[n].map(pip).join('');cube.appendChild(s)}
add('front',1);add('top',2);add('right',3);add('left',4);add('bottom',5);add('back',6);cube.dataset.value='1';
function sync(){var v='⚀⚁⚂⚃⚄⚅'.indexOf(face.textContent)+1;if(v>0)cube.dataset.value=String(v)}
new MutationObserver(sync).observe(face,{childList:true,characterData:true,subtree:true});sync();
})();
