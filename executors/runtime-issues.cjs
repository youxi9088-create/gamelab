// Structured evidence, not an acceptance override. URLs in messages omit secrets.
function publicURL(value){try{const u=new URL(value);return u.origin+u.pathname}catch{return String(value).split(/[?#]/)[0]}}
function runtimeIssues(report){
 const issues=[];
 if(report.readiness)issues.push({code:'RUNTIME_NOT_READY',observation:report.readiness,next_action:'依据场景、可交互按钮与加载提示分析初始化阻断；就绪不代表玩法已验证'});
 const navigation=[...(report.navigation_attempts||[]),...(report.navigation||[])].filter(x=>!x.allowed);
 if(navigation.length)issues.push({code:'RUNTIME_NAVIGATION',urls:[...new Set(navigation.map(x=>publicURL(x.url)))],next_action:'检查实际跳转与宿主契约；站点授权和登录限制需要真实授权，不可伪造环境'});
 if(report.errors?.length)issues.push({code:'RUNTIME_SCRIPT_ERROR',count:report.errors.length,next_action:'依据异常堆栈定位宿主或运行错误并重新验证'});
 if(report.required_external?.length)issues.push({code:'EXTERNAL_STATIC_RESOURCE',urls:[...new Set(report.required_external.map(publicURL))],next_action:'按 resource_requests 的编号分析并本地化公开静态资源；保留原始材料后重新验证'});
 if(report.missing?.length)issues.push({code:'LOCAL_RESOURCE_MISSING',paths:[...new Set(report.missing.map(publicURL))],next_action:'沿原始来源补齐实际缺失文件并重新验证'});
 return issues;
}
function offlineFailure(report){
 return 'Offline check failed: 离线运行验证未通过：'+runtimeIssues(report).map(x=>({RUNTIME_NAVIGATION:'发生非预期页面跳转',RUNTIME_SCRIPT_ERROR:'运行脚本异常 '+x.count+' 项',EXTERNAL_STATIC_RESOURCE:'仍依赖外部静态资源 '+x.urls?.length+' 项（'+x.urls?.slice(0,3).join('、')+'）',LOCAL_RESOURCE_MISSING:'缺少本地资源 '+x.paths?.length+' 项'}[x.code])).join('；')+'。具体证据见 evidence/runtime.json';
}
module.exports={runtimeIssues,offlineFailure};
