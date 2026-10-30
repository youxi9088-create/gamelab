// Runs in the browser DOM; ancestor state matters for hidden portal containers.
function frameState(node){
 const reasons=[];
 for(let el=node;el;el=el.parentElement){
  const style=getComputedStyle(el);
  if(el.hidden)reasons.push('hidden');
  if(el.hasAttribute('inert'))reasons.push('inert');
  if(el.getAttribute('aria-hidden')==='true')reasons.push('aria-hidden');
  if(style.display==='none')reasons.push('display-none');
  if(style.visibility==='hidden'||style.visibility==='collapse')reasons.push('visibility-hidden');
  if(Number(style.opacity)===0)reasons.push('opacity-zero');
 }
 const rect=node.getBoundingClientRect();
 if(rect.width<=0||rect.height<=0)reasons.push('empty-bounds');
 return {url:node.src,title:node.title,visible:reasons.length===0,hidden_reasons:[...new Set(reasons)],width:rect.width,height:rect.height};
}
module.exports={frameState};
