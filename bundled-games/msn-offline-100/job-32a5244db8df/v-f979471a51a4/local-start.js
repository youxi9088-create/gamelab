"use strict";
window.gameStart();
document.addEventListener("visibilitychange",function(){if(document.hidden){window.fastPause();}else{window.fastResume();}});
