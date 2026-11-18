const fs=require('fs'),path=require('path'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json'));
const P=lib('@babel/parser'),T=lib('@babel/traverse').default;
const b=path.resolve('deployment-packages/msn-capture-100'),root=path.join(b,'msn-en-us/originals/9mvq9gxf024k'),s=fs.readFileSync(path.join(root,'js/main.js'),'utf8'),a=P.parse(s),files=new Set(),parts={};
T(a,{StringLiteral(q){if(/^\.\/sprites\/.*\.(png|jpg)$/.test(q.node.value))files.add(q.node.value.slice(2));},AssignmentExpression(q){const n=q.node;if(n.left.type==='MemberExpression'&&n.left.object.name==='PART_CYCLIST'&&n.right.type==='ObjectExpression'){const info={};for(const p of n.right.properties){if(p.value.type==='NumericLiteral')info[p.key.name||p.key.value]=p.value.value;}parts[n.left.property.name]=info;}}});
for(let i=0;i<3;i++)for(const key of ['but_tournament','leader_badge','leader_map'])files.add(`sprites/${key}_${i}.png`);
for(let i=0;i<8;i++)files.add(`sprites/road_tiles/bound/bound_${i}.png`);
for(let i=0;i<7;i++)files.add(`sprites/logo_menu_${i}.png`);
for(const[key,info]of Object.entries(parts)){for(let t=0;t<info.num_types;t++)for(let n=0;n<info.num_spritesheet;n++)files.add(`sprites/cyclist/${key}/${key}_${t}-${n}.png`);if(key!=='cyclist_shadow')files.add(`sprites/cyclist/icon_${key}.png`);}
for(const key of ['press_but','soundtrack','energy','game_over','level_win','crowd_idle'])files.add(`sounds/${key}.mp3`);
for(const x of ['css/Montserrat-Black.woff2','css/Montserrat-Black.woff'])files.add(x);
const plan={native_id:'9mvq9gxf024k',entry:'https://codethislab.cdn.msnfun.com/9mvq9gxf024k/v7/index.html',files:[...files].sort(),parts,source_executed:false,derivation:'Original CSpriteLibrary literals and all explicit dynamic ranges; three tournaments/eight bounds/seven language logos/all PART_CYCLIST types and spritesheets/six original MP3/two CSS-declared fonts.'};
fs.writeFileSync(path.join(b,'cyclesprint-original-asset-plan.json'),JSON.stringify(plan,null,2));console.log(JSON.stringify({files:files.size,parts}));
