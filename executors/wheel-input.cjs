'use strict';
async function applyWheel(page,action) {
  const bounds=page.viewportSize(),x=action.x,y=action.y;
  const dx=action.delta_x??0,dy=action.delta_y,ticks=action.ticks??1;
  if(![x,y,dx,dy].every(Number.isFinite)||x<0||y<0||x>bounds.width||y>bounds.height||Math.abs(dx)>1200||Math.abs(dy)>1200||(!dx&&!dy)||!Number.isInteger(ticks)||ticks<1||ticks>12)
    throw new Error('Invalid wheel input: coordinates, delta or ticks out of bounds');
  await page.mouse.move(x,y);
  for(let i=0;i<ticks;i++){
    await page.mouse.wheel(dx,dy);
    await page.waitForTimeout(20);
  }
}
module.exports={applyWheel};
