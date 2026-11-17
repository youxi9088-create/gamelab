// Parse preserved source only; never import or execute the real game.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),parser=lib('@babel/parser'),traverse=lib('@babel/traverse').default,generate=lib('@babel/generator').default;
const root='deployment-packages/direct-games/job-c8efbf50be33',out=root+'/mission-source-proof-20261117';fs.mkdirSync(out,{recursive:true});
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),rows=[];
for(const kind of ['original','work']){
 const source=fs.readFileSync(root+'/'+kind+'/index.js','utf8'),tree=parser.parse(source,{sourceType:'module'}),items=[];
 traverse(tree,{VariableDeclarator(p){if(!['YA','Ea','WD'].includes(p.node.id?.name))return;const n=p.node,id=n.id.name,code=source.slice(n.init.start,n.init.end);items.push({name:id,type:n.init.type,sha256:sha(code),bytes:Buffer.byteLength(code)});fs.writeFileSync(out+'/'+kind+'-'+id+'.js',code);},FunctionDeclaration(p){if(p.node.id?.name!=='WD')return;const n=p.node,code=source.slice(n.start,n.end);items.push({name:'WD',type:n.type,sha256:sha(code),bytes:Buffer.byteLength(code)});fs.writeFileSync(out+'/'+kind+'-WD.js',code);}});
 const canonical=[];
 for(const item of items){const code=fs.readFileSync(out+'/'+kind+'-'+item.name+'.js','utf8');const parsed=parser.parse(item.name==='WD'?code:'('+code+')',{sourceType:'module'});canonical.push({name:item.name,canonical_sha256:sha(generate(parsed,{compact:true,comments:false}).code)});if(item.name==='YA'){const cls=parsed.program.body[0].expression;for(const method of cls.body.body)if(method.key?.name==='load')canonical.push({name:'YA.load',canonical_sha256:sha(generate(method,{compact:true,comments:false}).code)});}}
 rows.push({kind,source_sha256:sha(source),items,canonical});
}
const a=rows[0].items,b=rows[1].items;const proof={runtime_executed:false,scope:'Static AST source identity and actual JSON loader, no mission substitution or game execution.',rows,unchanged_selected:a.map(x=>({name:x.name,unchanged:b.some(y=>y.name===x.name&&y.sha256===x.sha256)})),canonical_comparison:rows[0].canonical.map(x=>({name:x.name,unchanged:rows[1].canonical.some(y=>x.name===y.name&&x.canonical_sha256===y.canonical_sha256)})),observed_missing_mission_json:8,observed_missing_npc_audio:9,original_origin_probe:{attempted:2,statuses:[403,403],other15_not_requested:true}};
fs.writeFileSync(out+'/proof.json',JSON.stringify(proof,null,2));console.log(JSON.stringify(proof));
