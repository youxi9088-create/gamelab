"""Shared final-package policy; detection never edits or certifies gameplay."""
import re
from pathlib import Path
from html.parser import HTMLParser
from .resource_audit import javascript_tokens, external_request_findings, audit

FEATURES=('leaderboard','multiplayer','advertising','payments')
INSTRUCTIONS='''最终交付必须为独立单机产物：移除排行榜、联网匹配/房间/联机、广告和充值/真实货币购买的入口、初始化、调用与依赖。保留本地计分、真实单人/人机玩法、普通游戏内资源与本地存档。不得仅隐藏按钮或拦截请求，不得伪造登录、广告完成、支付成功、服务器数据或奖励。必要静态素材应真实本地化，不能把素材 CDN 当业务接口删除。纯联机核心没有可验证的单机实现时明确阻断。读取相关源码后，在工作副本进行精确修改，原始和历史版本不变。重启后实际试玩并检查菜单、核心操作、结算、刷新及请求。返回 offline_features，含 leaderboard/multiplayer/advertising/payments 四项；每项 {status:"removed"或"absent",reason:"源码及实测依据",evidence:["实际已读文件路径"]}。仅有模型声明不能通过，平台还会审计最终文件与真实网络记录。未处理完则如实保持 pending。'''
CALLS={
 'leaderboard':{'showLeaderboard','getLeaderboard','submitLeaderboardScore','openLeaderboard'},
 'multiplayer':{'joinRoom','joinOrCreate','createRoom','startMatchmaking','findMatch'},
 'advertising':{'showRewardedAd','showInterstitialAd','createRewardedVideoAd','createInterstitialAd','commercialBreak','rewardedBreak','adBreak'},
 'payments':{'requestPayment','requestMidasPayment','purchaseProduct','purchaseItem','launchBillingFlow'},
}
LABELS={
 'leaderboard':r'排行榜|在线排行|leaderboards?',
 'multiplayer':r'联机|在线匹配|创建房间|加入房间|multiplayer|online match|join room|create room',
 'advertising':r'观看广告|看广告|watch ad|watch video.*reward|rewarded ad',
 'payments':r'充值|真实货币购买|in.app purchase|buy with real money|top.?up',
}
IGNORED={'evidence','verification','screenshots','platform-delivery','supply-delivery','web-original'}


class Controls(HTMLParser):
    def __init__(self):super().__init__();self.depth=0;self.labels=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('button','a','option'):self.depth+=1
    def handle_endtag(self,tag):
        if tag in ('button','a','option'):self.depth=max(0,self.depth-1)
    def handle_data(self,data):
        if self.depth:self.labels.append(data.strip())


def feature_findings(files):
    rows=[]
    for path,name in files:
        if set(Path(name).parts)&IGNORED or path.suffix.lower() not in ('.html','.htm','.js','.mjs'):continue
        if path.stat().st_size>4_000_000:continue
        text=path.read_text('utf-8',errors='replace');labels=[]
        if path.suffix.lower() in ('.html','.htm'):
            p=Controls();p.feed(text);labels=p.labels
            sources=[m[1] for m in re.finditer(r'<script\b[^>]*>(.*?)</script\s*>',text,re.I|re.S)]
        else:sources=[text]
        for source in sources:
            tokens=javascript_tokens(source)
            for i,(kind,value,pos) in enumerate(tokens):
                if kind!='word':continue
                if value in ('textContent','innerText') and i+2<len(tokens) and tokens[i+1][1]=='=' and tokens[i+2][0]=='quoted':labels.append(tokens[i+2][1])
                if i+1>=len(tokens) or tokens[i+1][1]!='(' or (i and tokens[i-1][1]=='function'):continue
                for feature,calls in CALLS.items():
                    if value in calls:rows.append({'code':'OFFLINE_FEATURE_REMAINS','feature':feature,'file':name,'symbol':value})
        for label in labels:
            for feature,pattern in LABELS.items():
                if re.fullmatch(pattern,label,re.I):rows.append({'code':'OFFLINE_FEATURE_REMAINS','feature':feature,'file':name,'control':label[:80]})
    return rows


def inspect(root,runtime=None,review=None):
    root=Path(root);runtime=runtime or {};review=review or {}
    files=[(p,p.relative_to(root).as_posix()) for p in root.rglob('*') if p.is_file() and not set(p.relative_to(root).parts)&IGNORED]
    findings=feature_findings(files)+external_request_findings(files)
    refs=audit(root)
    for row in refs.get('backend_endpoints',[]):
        findings.append({'code':'BACKEND_DEPENDENCY','file':row['file']})
    for key in ('external','blocked_external','required_external','blocked_external_requests'):
        if runtime.get(key):findings.append({'code':'OBSERVED_EXTERNAL_REQUEST','evidence':key,'count':len(runtime[key])})
    if (runtime.get('adblock') or {}).get('blocked_count'):
        findings.append({'code':'ADS_FILTERED_NOT_REMOVED','evidence':'adblock.blocked_count'})
    missing=[]
    for feature in FEATURES:
        item=review.get(feature) if isinstance(review,dict) else None
        evidence=item.get('evidence') if isinstance(item,dict) else None
        valid=(isinstance(item,dict) and item.get('status') in ('removed','absent') and bool(item.get('reason'))
               and isinstance(evidence,list) and evidence and all(isinstance(n,str) and not Path(n).is_absolute()
               and (root/n).resolve().is_relative_to(root.resolve()) and (root/n).is_file() for n in evidence))
        if not valid:missing.append(feature)
    environment=(runtime.get('environment')=='deployment' or runtime.get('environment')=='local-artifact' and runtime.get('network_observation_complete') is True)
    observed=runtime.get('passed') is True and environment and bool(runtime.get('actions')) and not runtime.get('diagnostic_only')
    return {'policy_revision':'2026-11-04-offline-1','status':'needs_work' if findings else 'pending' if missing or not observed else 'verified',
            'findings':findings[:100],'finding_count':len(findings),'unreviewed_features':missing,
            'runtime_observed':observed,'scope':'最终工作副本静态审计及本轮实测范围；非全关卡证明，人工验收独立。'}
