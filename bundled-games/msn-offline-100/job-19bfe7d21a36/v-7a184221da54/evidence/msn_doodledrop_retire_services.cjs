// Parse and edit original source. Do not load, evaluate or instantiate the game/SDK.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json')),P=lib('@babel/parser'),T=lib('@babel/traverse').default,G=lib('@babel/generator').default,t=lib('@babel/types');
const b='deployment-packages/msn-capture-100',out=b+'/source-analysis/doodledrop',file=b+'/msn-en-us/originals/9nmj2s1n0x52/main.172fad82.js';
const source=fs.readFileSync(file,'utf8'),ast=P.parse(source),before=new Map(),edits=[];
const hash=n=>crypto.createHash('sha256').update(G(n,{comments:false,compact:true}).code).digest('hex');
function parts(n){if(n?.type==='Identifier')return[n.name];if(n?.type==='ThisExpression')return['this'];if(n?.type==='MemberExpression')return[...parts(n.object),n.computed?n.property.value:n.property.name];return[];}
function name(p){for(let q=p;q;q=q.parentPath)if(q.isAssignmentExpression()&&q.node.right===p.node)return G(q.node.left).code;return p.node.id?.name||null;}
function erase(p,why){edits.push({start:p.node.start,end:p.node.end,reason:why});if(p.parentPath.isExpressionStatement())p.parentPath.remove();else if(p.parentPath.isSequenceExpression())p.remove();else p.replaceWith(t.unaryExpression('void',t.numericLiteral(0)));}
function body(p,code,why){edits.push({start:p.node.start,end:p.node.end,reason:why});p.node.right.body=P.parseExpression('function(){'+code+'}').body;}
T(ast,{Function(p){before.set(p.node,{hash:hash(p.node),start:p.node.start,name:name(p)});}});
const hook=new Set(['onGameStart','onGameRestart','onGamePause','onGameResume','onResultScreen','showStickyAds','hideStickyAds','onGameExit','setBase64Image','sendScore','createTournament','showBannerAds','showAd','submitScore','debugSDK','onGameLoading']);
const removeMethods=new Set(['createAdPanel','watchAd','closeAdPanel','SDKShare','showGameAd','showAdMenu','onRewardsAd','setAdMenu','setupAdWaitingContainer','SDKCreateTournament','SDKStartTournament','createTournamentPanels','createTournamentLoadingPanel','createTournamentHostPanel','createTournamentStartPanel','createTournamentListPanel','openTournamentPanel','closeAllTournamentPanels','onInterStitialAd']);
T(ast,{
 AssignmentExpression(p){const v=parts(p.node.left),method=v.at(-1);if(!v.includes('prototype')||!t.isFunctionExpression(p.node.right))return;
  if((p.node.start>1064000&&p.node.start<1068200&&hook.has(method))||removeMethods.has(method)){erase(p,'Remove actual advertising/telemetry/tournament provider or consumer method');p.skip();return;}
  if(method==='closeGame'){body(p,'this.goToMainMenu();','Ordinary exit directly uses original local main-menu transition, without interstitial callback');p.skip();return;}
  if(method==='setGameOverScreen'){
   const original=G(p.node.right.body,{compact:true,comments:false}).code;
   const old='s.SDKManager.isAdWatch?(n.default.lives=0,this.pauseContainer.setVisible(!1),this.rubixContainer.setVisible(!1),this.lifeContainer.setVisible(!1),this.starsContainer.setVisible(!1),this.showRetryMenu()):this.showAdMenu()';
   if(!original.includes(old))throw Error('Native game-over branch changed');
   body(p,original.slice(1,-1).replace(old,'(n.default.lives=0,this.pauseContainer.setVisible(!1),this.rubixContainer.setVisible(!1),this.lifeContainer.setVisible(!1),this.starsContainer.setVisible(!1),this.showRetryMenu())'),'Keep original3lives/revive; exhausted lives go to original retry result, remove rewarded extra life');return;
  }
 },
 CallExpression(p){const v=parts(p.node.callee),last=v.at(-1);
  if(v.includes('SDK')&&hook.has(last)){erase(p,'Remove actual service hook consumer; local score/save methods retained');return;}
  if(v[0]==='this'&&['createAdPanel','setAdMenu','setupAdWaitingContainer','createTournamentPanels'].includes(last)){erase(p,'Remove actual advertising/tournament UI construction call');return;}
  if(['on','off'].includes(last)&&p.node.arguments.some(a=>t.isFunctionExpression(a)&&/(?:this|t)\.(?:showGameAd|onRewardsAd)/.test(G(a).code))){erase(p,'Remove actual rewarded continue yes/no bindings');return;}
 },
 ConditionalExpression(p){if(G(p.node.test,{compact:true}).code==='s.default.SDK.isTournamentAfterGame'){edits.push({start:p.node.start,reason:'Remove online tournament branch; retain original ordinary menu visibility'});p.replaceWith(p.node.alternate);}},
 VariableDeclarator(p){if(t.isMemberExpression(p.node.init)&&G(p.node.init).code==='window.$msstart'){edits.push({start:p.node.start,reason:'Remove actual external SDK reference'});p.remove();}},
});
// Remove rewarded-use flags and unused service constructor fields, without touching local progression.
T(ast,{AssignmentExpression(p){const v=parts(p.node.left),key=v.at(-1);if(((v.includes('SDKManager')||p.node.start>1064000&&p.node.start<1068200)&&key==='isAdWatch')||(v[0]==='this'&&['displayAdPlacement','totalAdsWatched','totalAdsCount','canDebug','hasStarted','canShowInterstitialAd','isTournamentAfterGame'].includes(key)&&p.node.start>1060000&&p.node.start<1068000)){erase(p,'Remove retired service-only state');}},MemberExpression(p){if(!p.node.computed&&p.node.property.name==='SDK')p.node.property.name='localProgress';if(!p.node.computed&&p.node.property.name==='SDKManager')p.node.property.name='LocalProgress';if(!p.node.computed&&p.node.property.name==='onGameLoad')p.node.property.name='loadLocalProgress';}});
// The utils' unused createSDK export is a local class factory; rename its actual source export consistently.
T(ast,{MemberExpression(p){if(!p.node.computed&&['createSDK','msnSDK'].includes(p.node.property.name))p.node.property.name=p.node.property.name==='createSDK'?'createLocalProgress':'localProgress';}});
const surviving=new Set(),changed=[],unchanged=[];
T(ast,{Function(p){surviving.add(p.node);const prev=before.get(p.node);if(!prev)return;if(hash(p.node)===prev.hash)unchanged.push(prev);else changed.push(prev);}});
if(changed.some(x=>x.start<1050000))throw Error('Unexpected engine/bootstrap function mutation');
const code=G(ast,{comments:false,compact:true}).code;
if(/\$msstart|showAdsAsync|loadAdsAsync|submitGameResultsAsync|showDisplayAdsAsync|shareAsPost/.test(code))throw Error('Residual real external provider/consumer');
if(/\.showGameAd\(|\.onRewardsAd\(|\.showAdMenu\(|\.SDK\b|\.SDKManager\b/.test(code)){for(const m of code.matchAll(/\.showGameAd\(|\.onRewardsAd\(|\.showAdMenu\(|\.SDK\b|\.SDKManager\b/g))console.log(code.slice(m.index-80,m.index+140));throw Error('Residual retired consumer');}
P.parse(code);fs.writeFileSync(out+'/service-retired.main.js',code);
const receipt={source_only:true,native_or_SDK_executed:false,original_sha256:crypto.createHash('sha256').update(source).digest('hex'),derived_sha256:crypto.createHash('sha256').update(code).digest('hex'),edits,original_functions:before.size,unchanged_original_functions:unchanged.length,changed_original_functions:changed,removed_original_functions:[...before].filter(([n])=>!surviving.has(n)).map(([,v])=>v),scope:'Actual provider/consumer retirement. Original localStorage progression bodies retained; native local manager renamed, no fake SDK/ad success/reward. Original3lives/retry/gameplay/tutorial/skins/normal currency remain.'};
fs.writeFileSync(out+'/service-retirement-proof.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({edits:edits.length,original_functions:before.size,unchanged:unchanged.length,changed:changed.length,removed:receipt.removed_original_functions.length,changed_names:changed.map(x=>x.name)}));
