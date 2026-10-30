// Version metadata is authoritative; never borrow facts from another version.
export const specificationFields = {
  category:'玩法类型', dimension:'画面维度', perspective:'视角与布局',
  core_gameplay:'核心玩法', core_experience:'核心体验', controls:'操作方式',
  game_loop:'游戏流程', content:'内容规模', progression:'奖励与成长', save:'存档方式',
  rules:'目标、规则与结算数值', systems:'玩法系统与相互作用', ui_flow:'界面流程与反馈',
  level_design:'场景、关卡与难度设计', verification:'已验证流程与未覆盖范围', evidence:'事实依据与定位',
};
export function specificationMarkdown(title, version, fallback='') {
  const facts=version.game_profile || version.report?.game_profile;
  if(!facts || !Object.keys(specificationFields).some(k=>facts[k]))return fallback;
  const blocks=[`# ${title} 游戏规格说明书`, `版本：${version.id}`];
  for(const [key,label] of Object.entries(specificationFields))blocks.push(`## ${label}`, typeof facts[key]==='string' && facts[key].trim() || '未登记');
  const pictures=Array.isArray(facts.illustrations)?facts.illustrations:[];
  if(pictures.length)blocks.push('## 实际运行图解');
  for(const [i,p] of pictures.entries()){
    if(!/^screenshots\/[A-Za-z0-9_-]+\.(png|jpg|webp)$/.test(p.path) || typeof p.caption!=='string')continue;
    blocks.push(`![实机图 ${i+1}](/api/versions/${encodeURIComponent(version.id)}/specification-images/${p.path})`, `图 ${i+1}：${p.caption}`);
  }
  return blocks.join('\n\n')+'\n';
}
