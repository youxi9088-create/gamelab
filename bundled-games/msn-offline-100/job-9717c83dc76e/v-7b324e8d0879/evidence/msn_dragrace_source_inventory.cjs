// Parse source only; never evaluate native code or SDKs.
const fs=require('fs'),path=require('path'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json'));
const P=lib('@babel/parser'),T=lib('@babel/traverse').default;
const b=path.resolve('deployment-packages/msn-capture-100'),src=path.join(b,'msn-en-us/originals/9nkxlf5z9lkd');
const s=fs.readFileSync(path.join(src,'js/game.js'),'utf8'),a=P.parse(s),files=new Set(),units=[];
T(a,{StringLiteral(q){if(/^(assets|js)\/[^?]*\.(png|jpg|json|js|ogg|mp3|ttf|isr)$/.test(q.node.value))files.add(q.node.value);},
 FunctionDeclaration(q){if(q.node.start>1000000)units.push({type:q.node.type,name:q.node.id.name,start:q.node.start,end:q.node.end,source:s.slice(q.node.start,q.node.end)});},
 VariableDeclarator(q){const n=q.node;if(n.start>1000000&&n.id.type==='Identifier'&&n.init&&s.slice(n.start,n.end).length<40000)units.push({type:n.type,name:n.id.name,start:n.start,end:n.end,source:s.slice(n.start,n.end)});},
 ClassDeclaration(q){if(q.node.start>1000000)units.push({type:q.node.type,name:q.node.id.name,start:q.node.start,end:q.node.end,source:s.slice(q.node.start,q.node.end)});}
});
for(let i=1;i<=4;i++)for(let j=1;j<=8;j++)for(const ext of ['png','json'])files.add(`assets/gfx/cars/c0${i}_0${j}.${ext}`);
for(const f of ['assets/fnt/gamefont.ttf','assets/fnt/menufont.ttf','assets/gfx/rotate_screen.png'])files.add(f);
const dir=path.join(b,'source-analysis/dragrace');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'source-units.json'),JSON.stringify(units,null,2));
fs.writeFileSync(path.join(b,'dragrace-native-assets-plan.json'),JSON.stringify({native_id:'9nkxlf5z9lkd',assets:[...files].sort(),source_only:true,source:'All literal source paths plus original four by eight car-atlas loop and two HTML font URLs. No game executed.'},null,2));
console.log(JSON.stringify({source_units:units.length,assets:files.size,service_units:units.filter(x=>/ad|event|track|log|helper|save/i.test(x.name)).map(x=>({name:x.name,start:x.start,bytes:x.end-x.start}))}));
