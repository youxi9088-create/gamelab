const test=require('node:test'),assert=require('node:assert/strict');
const {references,permits}=require('../executors/static-resource-evidence.cjs');
test('literal asset evidence preserves query and resolves relative paths',()=>{
 const urls=references('fetch("https://cdn.example/level.glb?v=2"); load("../scene.data.br"); fetch("https://api.example/login");','https://game.example/js/main.js');
 assert.deepEqual([...urls],['https://cdn.example/level.glb?v=2','https://game.example/scene.data.br']);
 const req=(url,method='GET',type='fetch')=>({url:()=>url,method:()=>method,resourceType:()=>type});
 assert.equal(permits(req('https://cdn.example/level.glb?v=2'),urls),true);
 assert.equal(permits(req('https://cdn.example/level.glb?v=3'),urls),false);
 assert.equal(permits(req('https://cdn.example/level.glb?v=2','POST'),urls),false);
 assert.equal(permits(req('https://cdn.example/level.glb?v=2','GET','document'),urls),false);
});
test('dynamic expressions and credentials do not become asset evidence',()=>{
 assert.equal(references('`https://cdn.example/${name}.glb` "https://user:pass@cdn.example/a.bin" "data:application/json,{}"','https://game.example/').size,0);
 const urls=references('`https://cdn.example/${name}.glb`','https://game.example/');
 assert.equal(permits({url:()=> 'https://cdn.example/player.glb',method:()=> 'GET',resourceType:()=> 'fetch'},urls),false);
});
