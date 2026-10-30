"""Evidence-backed optional visual resources, never script/SDK exemptions."""
import hashlib
import json
from pathlib import Path
from runtime_recovery import StaticRecovery

class OptionalResourceReview(StaticRecovery):
    def validate(self,args):
        if 'paths' in args:
            paths=args['paths']
            if not isinstance(paths,list) or not 1<=len(paths)<=20 or len(set(paths))!=len(paths):
                raise ValueError('paths须为1至20个不重复的具体资源路径')
            for path in paths:self.validate({'path':path,'reason':args.get('reason','')})
            return
        path=args.get('path');reason=args.get('reason','')
        if not isinstance(path,str) or path.startswith(('/', '\\')) or '..' in Path(path).parts or ':' in path or Path(path).suffix.lower() not in ('.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.woff','.woff2','.ttf','.mp3','.ogg','.wav'):
            raise ValueError('只支持已观察的非脚本视觉/音频资源，SDK、脚本、配置不可豁免')
        acq=json.loads((self.run/'web-acquisition.json').read_text('utf-8'))
        if not any(x.get('path')==path and x.get('http_status') in (404,410) for x in acq.get('unavailable',[])):
            raise ValueError('需要原站 404/410 证据，不能忽略本地漏抓或权限错误')
        runtime=json.loads((self.target/'evidence/runtime.json').read_text('utf-8'))
        if not any(str(p).split('?')[0].lstrip('/')==path for p in runtime.get('missing',[])):
            raise ValueError('必须是本轮实际缺失资源')
        if not isinstance(reason,str) or len(reason.strip())<20:raise ValueError('须说明引用用途、截图依据以及为何不影响当前引导/玩法')
        shot=self.target/'screenshots/failed.png'
        if not shot.is_file() or shot.is_symlink():raise ValueError('缺少本轮失败截图')

    def execute(self,args):
        self.validate(args);self.before={}
        p=self.run/'web-acquisition.json';acq=json.loads(p.read_text('utf-8'))
        if not acq.get('capture_key'):
            acq['capture_key']=hashlib.sha256(json.dumps({'url':acq.get('url'),'files':acq.get('files',[])},sort_keys=True).encode()).hexdigest()
        items=[]
        for path in args.get('paths',[args.get('path')]):
            item={'path':path,'reason':args['reason'],'capture_key':acq.get('capture_key'),
              'screenshot_sha256':hashlib.sha256((self.target/'screenshots/failed.png').read_bytes()).hexdigest(),
              'scope':'Current observed stage only; resource remains missing'}
            acq.setdefault('optional_resources',[]).append(item);items.append(item)
        raw=json.dumps(acq,ensure_ascii=False).encode()
        self.write(p,raw);self.write(self.target/'evidence/acquisition.json',raw)
        return items if 'paths' in args else items[0]

    def capability(self):
        return {'description':'依据原站 unavailable 404/410、本轮 missing、失败截图及源码引用，标记不影响当前阶段的非必需图片/字体/音频。arguments:{path:具体路径,reason:用途和截图依据}；同一明确回退机制可用paths:[1至20个具体路径]批量提交，每项仍须全部证据，任一不符整批拒绝。不能按扩展名猜测，不能用于SDK/脚本/配置；之后仍需原验证器及交互验证。',
                'validate':self.validate,'execute':self.execute,'rollback':self.rollback}
