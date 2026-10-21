/* Exact captured URL bindings only. Unknown network requests remain observable. */
(()=>{
 const map=window.localRemoteResources||{};
 function resolve(value){
  if(typeof value!=='string')return value;
  const mapped=map[value]||map[new URL(value,location.href).href];
  return mapped?new URL(mapped,document.baseURI).href:value;
 }
 const fetchOriginal=window.fetch;
 window.fetch=function(input,options){
  if(typeof input==='string')input=resolve(input);
  else if(input instanceof URL)input=resolve(input.href);
  else if(input instanceof Request&&map[input.url])input=new Request(resolve(input.url),input);
  return fetchOriginal.call(this,input,options);
 };
 const open=XMLHttpRequest.prototype.open;
 XMLHttpRequest.prototype.open=function(method,url,...args){return open.call(this,method,resolve(String(url)),...args)};
 for(const klass of [HTMLImageElement,HTMLMediaElement]){
  const descriptor=Object.getOwnPropertyDescriptor(klass.prototype,'src');
  if(descriptor?.set)Object.defineProperty(klass.prototype,'src',{...descriptor,set(value){descriptor.set.call(this,resolve(value))}});
 }
})();
