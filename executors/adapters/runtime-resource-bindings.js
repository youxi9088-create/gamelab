/* Exact observed static URLs only. No API/network-success emulation. */
(()=>{
 const map=window.runtimeResourceBindings||{};
 const resolve=value=>{
  try {const url=new URL(String(value),document.baseURI).href;return map[url]?new URL(map[url],location.origin).href:value;}
  catch{return value;}
 };
 const attrs=new Map([[HTMLScriptElement,'src'],[HTMLImageElement,'src'],[HTMLMediaElement,'src'],[HTMLSourceElement,'src'],[HTMLLinkElement,'href']]);
 for(const [klass,attr] of attrs){
  const descriptor=Object.getOwnPropertyDescriptor(klass.prototype,attr);
  if(descriptor?.set)Object.defineProperty(klass.prototype,attr,{...descriptor,set(value){descriptor.set.call(this,resolve(value))}});
 }
 const original=Element.prototype.setAttribute;
 Element.prototype.setAttribute=function(name,value){
  for(const [klass,attr] of attrs)if(this instanceof klass&&String(name).toLowerCase()===attr){value=resolve(value);break;}
  return original.call(this,name,value);
 };
})();
