const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
let score=0,target={x:280,y:170};
function draw(){ctx.clearRect(0,0,560,340);ctx.fillStyle='#b8fa67';ctx.beginPath();ctx.arc(target.x,target.y,28,0,Math.PI*2);ctx.fill();document.getElementById('score').textContent=score>=10?'完成！点击重新开始':`得分 ${score} / 10`;}
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*560/r.width,y=(e.clientY-r.top)*340/r.height;if(score<10&&Math.hypot(x-target.x,y-target.y)<28){score++;target={x:40+Math.random()*480,y:40+Math.random()*260};draw();}});
document.getElementById('restart').onclick=()=>{score=0;target={x:280,y:170};draw();};draw();
