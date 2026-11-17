// Presentation adapter: retain reward actions, remove advertising surfaces.
window.installAdFreeUI=function(cc){
 const hidden=new Set(['markAd','markVideo','adlogo','xiaomi_adlogo','nativeBanner','nativeCusAd','nativeArea','btnMore','btn_download','fishLevelUpBanner','getGoldBanner','getTunaBanner','uiAirDropPage']);
 const icons=/^(?:icon[_-]?(?:ad|video)|(?:ad|video)[_-]?icon|video|ad_logo)$/i;
 const seen=new WeakSet();
 const rewardButtons=/^(?:btnADGet|btnAdUnlock|btn_watchAd)$/i;
 function cleanRewardButton(node){
  if(seen.has(node))return;seen.add(node);
  const sprite=node.getComponent(cc.Sprite);if(!sprite)return;
  const button=node.getComponent(cc.Button);if(button)button.transition=0;
  const bounds=node.getComponent(cc.UITransform);if(!bounds)return;
  const labels=node.getComponentsInChildren(cc.Label);
  const canvas=document.createElement('canvas');canvas.width=400;canvas.height=150;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#ffb528';ctx.strokeStyle='#955114';ctx.lineWidth=6;ctx.beginPath();ctx.roundRect(4,4,392,142,18);ctx.fill();ctx.stroke();
  const caption=labels.find(label=>label.string?.trim())?.string||(/unlock/i.test(node.name)?'解锁':'领取');
  ctx.fillStyle='#603110';ctx.font='bold 64px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text(caption),200,75,370);
  const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(canvas);const frame=new cc.SpriteFrame();frame.texture=texture;
  sprite.type=cc.Sprite.Type.SIMPLE;sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;sprite.spriteFrame=frame;
  for(const label of labels)label.node.active=false;
 }
 function text(s){return s.replace(/金币不足，\n观看视频可以免费领取噢！/g,'金币不足，\n可以直接领取补给！').replace(/观看视频，?/g,'').replace(/看视频|视频获得/g,'直接领取').replace(/观看广告|看广告/g,'直接领取').replace(/广告/g,'奖励');}
 function visit(node){
  if(rewardButtons.test(node.name))cleanRewardButton(node);
  if(hidden.has(node.name)||icons.test(node.name)){if(node.active)node.active=false;return;}
  for(const component of node.components||node._components||[]){if(typeof component.string==='string'&&/广告|视频/.test(component.string))component.string=text(component.string);}
  for(const child of node.children||[])if(child.active)visit(child);
 }
 cc.director.on(cc.Director.EVENT_BEFORE_DRAW,()=>{const scene=cc.director.getScene();if(scene)visit(scene)});
 document.documentElement.dataset.adMode='disabled';
};
