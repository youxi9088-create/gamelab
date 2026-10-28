// Executed in the page: engine readiness is not proof of completed gameplay.
function cocosReadiness(){
 const result={ready:false,scene:null,labels:0,buttons:0,loading:false,loading_texts:[]};
 const cc=window.cc,scene=cc?.director?.getScene();
 if(!scene)return result;
 result.scene=scene.name||'';
 function visit(node){
  if(!node.activeInHierarchy||node.opacity===0)return;
  const label=node.getComponent(cc.Label);
  if(label&&label.enabled!==false&&String(label.string||'').trim()){
   result.labels++;
   const text=String(label.string).trim();
   if(/加载中|loading\s*(?:\.{2,}|\d|$)/i.test(text)){
    result.loading=true;if(result.loading_texts.length<8)result.loading_texts.push(text.slice(0,120));
   }
  }
  const button=node.getComponent(cc.Button);
  if(button&&button.enabled!==false&&button.interactable&&node.width>0&&node.height>0){
   const canvas=cc.game?.canvas,rect=canvas?.getBoundingClientRect(),size=cc.winSize;
   if(rect?.width>0&&rect.height>0&&size?.width>0&&size.height>0){
    const point=node.convertToWorldSpaceAR(cc.v2(0,0));
    const x=rect.left+point.x/size.width*rect.width,y=rect.top+(1-point.y/size.height)*rect.height;
    if(x>=0&&x<innerWidth&&y>=0&&y<innerHeight)result.buttons++;
   }
  }
  for(const child of node.children||[])visit(child);
 }
 visit(scene);
 result.ready=!result.loading&&(result.labels>0||result.buttons>0);
 return result;
}
module.exports={cocosReadiness};
