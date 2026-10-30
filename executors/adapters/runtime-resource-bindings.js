/* Exact observed static URLs only. No API/network-success emulation. */
(()=>{
 const map=window.runtimeResourceBindings||{};
 const resolve=value=>{
  try {const url=new URL(String(value),document.baseURI).href;return map[url]?new URL(map[url],document.baseURI).href:value;}
  catch{return value;}
 };
 const nativeFetch=window.fetch;
 window.fetch=function(input,options){
  const method=String(options?.method||(input instanceof Request?input.method:'GET')).toUpperCase();
  if(method==='GET'){
   if(input instanceof Request){const target=resolve(input.url);if(target!==input.url)input=new Request(target,input);}
   else if(typeof input==='string'||input instanceof URL)input=resolve(String(input));
  }
  return nativeFetch.call(this,input,options);
 };
 const nativeOpen=XMLHttpRequest.prototype.open;
 XMLHttpRequest.prototype.open=function(method,url,...args){return nativeOpen.call(this,method,String(method).toUpperCase()==='GET'?resolve(String(url)):url,...args)};
 const attrs=new Map([[HTMLScriptElement,'src'],[HTMLImageElement,'src'],[HTMLMediaElement,'src'],[HTMLSourceElement,'src'],[HTMLLinkElement,'href']]);
 const css=value=>String(value).replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/gi,(_m,_q,url)=>'url('+JSON.stringify(resolve(url.trim()))+')');
 const setProperty=CSSStyleDeclaration.prototype.setProperty;
 CSSStyleDeclaration.prototype.setProperty=function(name,value,priority){return setProperty.call(this,name,css(value),priority)};
 for(const name of ['background','backgroundImage','cssText']){
  const descriptor=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,name);
  if(descriptor?.set)Object.defineProperty(CSSStyleDeclaration.prototype,name,{...descriptor,set(value){descriptor.set.call(this,css(value))}});
 }
 // Chromium exposes many CSS properties as named instance properties.
 const wrapped=new WeakSet();
 for(const klass of [HTMLElement,SVGElement]){
  const descriptor=Object.getOwnPropertyDescriptor(klass.prototype,'style');
  if(descriptor?.get)Object.defineProperty(klass.prototype,'style',{...descriptor,get(){
   const style=descriptor.get.call(this);
   if(!wrapped.has(style)){
    wrapped.add(style);
    for(const [name,property] of [['background','background'],['backgroundImage','background-image']])
     Object.defineProperty(style,name,{configurable:true,get(){return this.getPropertyValue(property)},set(value){setProperty.call(this,property,css(value),'')}});
   }
   return style;
  }});
 }
 for(const [klass,attr] of attrs){
  const descriptor=Object.getOwnPropertyDescriptor(klass.prototype,attr);
  if(descriptor?.set)Object.defineProperty(klass.prototype,attr,{...descriptor,set(value){descriptor.set.call(this,resolve(value))}});
 }
 const original=Element.prototype.setAttribute;
 Element.prototype.setAttribute=function(name,value){
  if(String(name).toLowerCase()==='style')value=css(value);
  for(const [klass,attr] of attrs)if(this instanceof klass&&String(name).toLowerCase()===attr){value=resolve(value);break;}
  return original.call(this,name,value);
 };
})();
