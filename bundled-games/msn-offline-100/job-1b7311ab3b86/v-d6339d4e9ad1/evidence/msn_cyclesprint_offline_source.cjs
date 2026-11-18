// Exact-range source edits; no native code execution or SDK facade.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json'));
const P=lib('@babel/parser'),T=lib('@babel/traverse').default;
const b=path.resolve('deployment-packages/msn-capture-100'),root=path.join(b,'msn-en-us/originals/9mvq9gxf024k'),dir=path.join(b,'source-analysis/cyclesprint');
const source=fs.readFileSync(path.join(root,'js/main.js'),'utf8'),tree=P.parse(source),edits=[];
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function add(n,text,reason){edits.push({start:n.start,end:n.end,text,reason});}
T(tree,{CallExpression(q){const n=q.node;if(n.callee.type==='Identifier'){
 if(['showMoreGames','showDisplayAd','hideDisplayAd','hideMoreGames','checkMoreGames'].includes(n.callee.name))add(n,'void 0','Retire actual external advertisement/cross-promotion consumer');
 if(n.callee.name==='getLang')add(n,'(navigator.language||"en").toLowerCase().split("-")[0]','Read real browser language at original locale consumer, without SDK');
 }else if(n.callee.type==='MemberExpression'&&n.callee.object.name==='window'&&n.callee.property.name==='open')add(n,'void 0','Retire original provider outbound credits hyperlink');
},ConditionalExpression(q){const text=source.slice(q.node.test.start,q.node.test.end);if(text==='platform.name!==null&&platform.name.toLowerCase()==="safari"')add(q.node.test,'/Safari/.test(navigator.userAgent)&&!/Chrome|Chromium|Edg/.test(navigator.userAgent)','Use actual browser UA for viewport choice; no provider global');
},ReferencedIdentifier(q){if(q.node.name==='s_bOnline'&&!q.scope.hasBinding('s_bOnline'))add(q.node,'navigator.onLine','Use actual browser network capability in original sound-error branch');}});
const sorted=edits.sort((a,b)=>a.start-b.start);for(let i=1;i<sorted.length;i++)if(sorted[i-1].end>sorted[i].start)throw Error('Overlapping source edits');
let runtime=source;for(const e of [...sorted].reverse())runtime=runtime.slice(0,e.start)+e.text+runtime.slice(e.end);P.parse(runtime);
function topFunctions(text){const out={};T(P.parse(text),{FunctionDeclaration(q){if(!q.getFunctionParent())out[q.node.id.name]=text.slice(q.node.start,q.node.end);}});return out;}
const original=topFunctions(source),next=topFunctions(runtime),changed=Object.keys(original).filter(k=>original[k]!==next[k]);
const protectedNames=['CGame','CController','CCyclist','CBackgroundController','CRoadTile','CStaminaController','CStaminaItem','CRadarController','CLeaderboardController','CTutorialPanel','CTournamentSelection','CButTournament','CPreloader','CEditorPanel'];
for(const n of protectedNames)if(!original[n]||original[n]!==next[n])throw Error('Protected native function changed '+n);
if(changed.some(k=>!['sizeHandler','CMenu','CMain','CCreditsPanel'].includes(k)))throw Error('Unexpected native function modification '+changed);
fs.writeFileSync(path.join(dir,'offline-main.js'),runtime);
fs.writeFileSync(path.join(dir,'source-fidelity.json'),JSON.stringify({native_id:'9mvq9gxf024k',original_sha256:sha(source),runtime_sha256:sha(runtime),source_edits:sorted,changed_functions:changed,protected_functions:protectedNames.map(name=>({name,sha256:sha(original[name]),byte_exact:true})),original_functions:Object.keys(original).length,unchanged_functions:Object.keys(original).filter(k=>original[k]===next[k]).length,SDK_facade:false,fake_identity_or_reward:false,native_or_SDK_executed_locally:false},null,2));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<script\b[^>]*src="https?:[^>]*><\/script>/gi,'').replace(/<link\b[^>]*(?:href="https?:|rel="manifest")[^>]*>/gi,'');
let index=0;
html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(all,attrs,body)=>{
 if(!body.trim())return all;
 if(body.includes('var s_bApiReady'))return '';
 if(!body.includes('function startGame'))return all;
 const a=P.parse(body),drop=[];
 T(a,{IfStatement(q){if(q.node.test.type==='Identifier'&&q.node.test.name==='s_bAPILoaded')drop.push({start:q.node.start,end:q.node.end,text:''});},FunctionDeclaration(q){if(q.node.id.name==='loadSw')drop.push({start:q.node.start,end:q.node.end,text:''});},CallExpression(q){const n=q.node;if(n.callee.type==='MemberExpression'&&n.callee.object.name==='document'&&n.callee.property.name==='addEventListener'){
  const event=n.arguments[0]?.value;if(['DOMContentLoaded','save_score','show_interlevel_ad'].includes(event))drop.push({start:n.start,end:n.end,text:'void 0'});
 }} });
 let out=body;for(const e of drop.sort((a,b)=>b.start-a.start))out=out.slice(0,e.start)+e.text+out.slice(e.end);
 out+='\ndocument.addEventListener("DOMContentLoaded",startGame,{once:true});\n';P.parse(out);index++;return '<script>'+out+'</script>';
});
if(index!==1||/s_bApiReady|s_bAPILoaded|callAd\(|saveScore\(|scheduleNotificationAsync|serviceWorker\.register|src="https?:/.test(html))throw Error('Platform entry consumer remains');
fs.writeFileSync(path.join(dir,'offline-index.html'),html);
console.log(JSON.stringify({edits:edits.length,changed,protected:protectedNames.length,unchanged_functions:Object.keys(original).length-changed.length,HTML_platform_wait_retired:true}));
