"""Private service configuration and explicit live probes."""
import json
import os
import threading
import time
import urllib.request
import urllib.error
from pathlib import Path
from urllib.parse import urlsplit
from .service import ApiError, require


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def ai_config(path=None):
    path = Path(path or os.environ.get('REPLICA_SERVICE_CONFIG', Path(__file__).resolve().parents[1] / 'data/services.json'))
    saved = json.loads(path.read_text('utf-8')).get('ai', {}) if path.exists() else {}
    # An explicitly configured platform provider takes precedence as a whole.
    if saved:
        return saved
    return {k: os.environ.get(v, '') for k, v in [('base_url', 'REPLICA_AI_BASE_URL'), ('api_key', 'REPLICA_AI_API_KEY'), ('model', 'REPLICA_AI_MODEL')]}


class ServiceRegistry:
    def __init__(self, path):
        self.path = Path(path)
        self.lock = threading.RLock()
        self.checks = {}
        self.executor = None

    def configs(self):
        return json.loads(self.path.read_text('utf-8')) if self.path.exists() else {}

    def config(self, kind):
        require(kind in ('wechat', 'ai'), '服务不存在', 404)
        return ai_config(self.path) if kind == 'ai' else self.configs().get(kind, {})

    def public(self):
        with self.lock:
            result = []
            for kind in ('wechat', 'ai'):
                c = self.config(kind)
                if kind=='wechat' and self.executor and not c.get('base_url'):
                    health=self.executor.health()
                    result.append(dict(id=kind,base_url='',model='',has_key=False,status='在线' if health['ready'] else '异常',detail=health['detail'],checked_at=time.time(),backend='builtin'))
                    continue
                from .ai_provider import codex_binary
                backend=c.get('backend','auto')
                configured = bool(c.get('base_url') and (kind != 'ai' or c.get('model') and c.get('api_key'))) or kind=='ai' and backend!='api' and bool(codex_binary())
                check = self.checks.get(kind, {})
                if kind=='ai':
                    from .ai_provider import config_signature
                    try:
                        recent=json.loads(self.path.with_name('ai-health.json').read_text('utf-8'))
                        if recent.get('signature')==config_signature(c) and recent.get('time',0)>check.get('time',0):check=recent
                    except (OSError,ValueError):pass
                fresh = time.time() - check.get('time', 0) < 300
                status = ('在线' if check.get('ok') else '异常') if configured and fresh else ('待检测' if configured else '未配置')
                result.append(dict(id=kind, backend=backend, base_url=c.get('base_url', ''), model=c.get('model', ''), has_key=bool(c.get('api_key')), status=status, detail=check.get('detail', '') if fresh else ('检测结果已过期，请重新检测' if check else '等待实际调用检测'), checked_at=check.get('time')))
            return result

    def save(self, kind, body):
        with self.lock:
            old = self.config(kind)
            require(isinstance(body, dict), '配置必须是对象')
            base = str(body.get('base_url', '')).strip().rstrip('/')
            backend=body.get('backend','api' if kind=='ai' else 'auto')
            require(backend in ('auto','api','codex','builtin','wxapkg_v1'),'无效服务模式')
            require(kind=='wechat' or backend!='wxapkg_v1','原包转换模式仅适用于转换服务')
            if kind=='ai' and backend=='codex' or kind=='wechat' and backend=='builtin':
                data=self.configs();data[kind]={'backend':backend}
                self.path.parent.mkdir(parents=True,exist_ok=True)
                tmp=self.path.with_suffix('.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False),'utf-8');os.replace(tmp,self.path)
                self.checks.pop(kind,None)
                return self.public()
            p = urlsplit(base)
            require(p.hostname and (p.scheme == 'https' or p.scheme == 'http' and p.hostname in ('localhost', '127.0.0.1', '::1')) and not p.username and not p.password and not p.query and not p.fragment, '地址需为 HTTPS，或本机 HTTP 地址，不可包含凭证、查询参数或片段')
            key = str(body.get('api_key', '')).strip() or old.get('api_key', '')
            if body.get('clear_key'): key = ''
            require(not any(x in key for x in ('\r', '\n')), '密钥格式无效')
            c = dict(base_url=base, api_key=key,backend=backend)
            if kind == 'ai':
                c['model'] = str(body.get('model', '')).strip()
                require(c['model'] and key, '请填写模型名称和 API Key')
            data = self.configs()
            data[kind] = c
            self.path.parent.mkdir(parents=True, exist_ok=True)
            tmp = self.path.with_suffix('.tmp')
            tmp.write_text(json.dumps(data, ensure_ascii=False), 'utf-8')
            os.replace(tmp, self.path)
            self.checks.pop(kind, None)
        return self.public()

    def test(self, kind):
        with self.lock:
            c = dict(self.config(kind))
        if kind=='wechat' and self.executor and not c.get('base_url'):
            return self.public()
        if kind=='ai' and c.get('backend','auto')!='api':
            from .ai_provider import complete
            try:
                value,provider=complete([{'role':'user','content':'Return a JSON object with ok set to true.'}],c,180)
                ok=value.get('ok') is True
                detail=('本机 Codex' if provider=='codex' else 'AI API')+' 实际调用'+('成功' if ok else '响应无效')
            except Exception:
                ok=False;detail='AI 调用失败或超时，请检查本机 Codex 登录、额度及网络，或配置 API'
            with self.lock:
                if c==self.config(kind):self.checks[kind]=dict(ok=ok,detail=detail,time=time.time())
            return self.public()
        require(c.get('base_url'), '请先配置服务地址')
        if kind == 'ai': require(c.get('api_key') and c.get('model'), '请先配置模型和 API Key')
        headers = {'Content-Type': 'application/json'}
        if c.get('api_key'): headers['Authorization'] = 'Bearer ' + c['api_key']
        body = None
        suffix = '/health'
        if kind == 'ai':
            suffix = '/chat/completions'
            body = json.dumps(dict(model=c['model'], messages=[dict(role='user', content='Return a JSON object with ok set to true.')], response_format={'type': 'json_object'}, max_tokens=32)).encode()
        ok = False
        try:
            request = urllib.request.Request(c['base_url'] + suffix, data=body, headers=headers)
            with urllib.request.build_opener(NoRedirect).open(request, timeout=15) as response:
                data = json.loads(response.read(1024 * 1024))
            if kind == 'ai':
                content = json.loads(data['choices'][0]['message']['content'])
                ok = isinstance(content, dict) and content.get('ok') is True
            else:
                if c.get('backend')=='wxapkg_v1':
                    ok=data.get('ok') is True and data.get('service')=='wechat-web-converter'
                    if ok:
                        probe=urllib.request.Request(c['base_url']+'/v1/jobs',headers=headers)
                        with urllib.request.build_opener(NoRedirect).open(probe,timeout=15) as response:
                            ok=isinstance(json.loads(response.read(1024*1024)).get('jobs'),list)
                else:
                    ok = data.get('ok') is True and data.get('ready') is True and 'wechat_to_web' in data.get('capabilities', [])
            detail = '实际调用成功' if ok else '服务响应未满足接口要求'
        except urllib.error.HTTPError as e:
            detail = f'服务返回 HTTP {e.code}'
        except (urllib.error.URLError, TimeoutError, OSError):
            detail = '连接失败或超时，请检查地址、网络和证书'
        except (ValueError, KeyError, IndexError, TypeError, AttributeError):
            detail = '服务返回格式不兼容'
        with self.lock:
            if c == self.config(kind):
                self.checks[kind] = dict(ok=ok, detail=detail, time=time.time())
        return self.public()
