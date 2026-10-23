// Patch background display changes without restarting controls or embedded pages.
const key = node => node.nodeType !== 1 ? '' : node.id ? `id:${node.id}` :
  [...node.attributes].filter(a => a.name.startsWith('data-') && !['data-busy','data-motion','data-page'].includes(a.name))
    .sort((a,b)=>a.name.localeCompare(b.name)).map(a=>`${a.name}:${a.value}`).join('|');
const compatible = (a,b) => a && a.nodeType===b.nodeType && a.nodeName===b.nodeName && key(a)===key(b);

function patchNode(current, desired) {
  if(current.nodeType!==1){if(current.nodeValue!==desired.nodeValue)current.nodeValue=desired.nodeValue;return;}
  if(current.dataset.busy==='true')return;
  for(const attr of [...current.attributes]) {
    if(current.tagName==='DETAILS' && attr.name==='open')continue;
    if(['value','checked'].includes(attr.name) && current.matches('input,textarea,select'))continue;
    if(!desired.hasAttribute(attr.name) && !['tabindex','role','aria-label'].includes(attr.name))current.removeAttribute(attr.name);
  }
  for(const attr of desired.attributes) {
    if(current.tagName==='DETAILS' && attr.name==='open')continue;
    if(['value','checked'].includes(attr.name) && current.matches('input,textarea,select'))continue;
    if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
  }
  if(!current.matches('iframe,textarea,input'))patchChildren(current,desired);
}

function patchChildren(root, desired) {
  let index=0;
  for(const next of [...desired.childNodes]) {
    let current=root.childNodes[index];
    if(!compatible(current,next)) {
      const found=key(next) ? [...root.childNodes].slice(index+1).find(n=>compatible(n,next)) : null;
      if(found){root.insertBefore(found,current||null);current=found;}
      else {root.insertBefore(next.cloneNode(true),current||null);index++;continue;}
    }
    patchNode(current,next);index++;
  }
  while(root.childNodes.length>index)root.lastChild.remove();
}

export function patchHTML(root, html) {
  const template=document.createElement('template');template.innerHTML=html;
  patchChildren(root,template.content);
}
