"""Conservative discovery hints, not runtime or conversion verification."""
import re
from html.parser import HTMLParser
from urllib.parse import urlsplit


class RuntimeHints(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.scripts = []
        self.flash = False
        self.inline = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and attrs.get('type', '').lower() in ('', 'text/javascript', 'application/javascript', 'module'):
            self.scripts.append(attrs.get('src', ''))
            self.inline = ''
        if tag in ('object', 'embed'):
            path = urlsplit(attrs.get('data') or attrs.get('src') or '').path.lower()
            self.flash |= path.endswith('.swf') or attrs.get('type') == 'application/x-shockwave-flash'

    def handle_data(self, data):
        if self.inline is not None:
            self.inline += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.inline is not None:
            self.scripts.append(self.inline)
            self.inline = None


def classify(html='', metadata=None):
    """Only inspect supplied material; do not fetch, execute, or guess by domain."""
    hints = RuntimeHints(html)
    code = '\n'.join(hints.scripts)
    matches = []

    def add(platform, technology, evidence):
        value = (platform, technology)
        if not any((m['platform'], m['technology']) == value for m in matches):
            matches.append(dict(platform=platform, technology=technology, evidence=evidence))

    if re.search(r'\bcreateUnityInstance\s*\(|\bUnityLoader\s*\.\s*instantiate\s*\(', code):
        add('Web', 'Unity WebGL', '页面脚本含 Unity WebGL 启动调用')
    if hints.flash:
        add('Web', 'Flash / SWF', '页面 object/embed 声明 SWF 资源')
    if re.search(r'\bEngine\.load\s*\(', code) and re.search(r'dmloader\.js', code):
        add('Web', 'Defold HTML5', '页面包含 Defold 加载器及启动调用')
    if re.search(r'\bWebAssembly\.(?:instantiate|instantiateStreaming)\s*\(', code) and not matches:
        add('Web', 'WebAssembly / 引擎待识别', '页面脚本含 WebAssembly 实例化调用')
    if re.search(r'\bnew\s+Phaser\.Game\s*\(', code):
        add('Web', 'H5 / Phaser', '页面脚本含 Phaser.Game 初始化')
    if re.search(r'\bcc\.game\.run\s*\(', code):
        add('Web', 'H5 / Cocos', '页面脚本含 cc.game.run 启动调用')
    metadata = metadata or {}
    declared = []
    for field in ('gamePlatform', 'operatingSystem', 'runtimePlatform'):
        value = metadata.get(field, [])
        declared.extend(v for v in (value if isinstance(value, list) else [value]) if isinstance(v, str))
    for value in declared:
        text = value.strip().lower()
        evidence = '来源游戏结构化平台声明：' + value[:120]
        if text in ('html5', 'html 5', 'h5'):
            add('Web', 'H5', evidence)
        elif text in ('web', 'browser', 'web browser', 'browser game'):
            # Generic Web declarations cannot identify the underlying technology.
            if not any(m['platform'] == 'Web' for m in matches):
                add('Web', '技术待识别', evidence)
        elif text in ('wechat', 'weixin', '微信', '微信小游戏', '微信小程序'):
            add('微信小游戏', '技术待识别', evidence)
        elif text in ('android', 'ios', 'windows', 'macos', 'mac os', 'linux'):
            add('原生 / 客户端', value[:80], evidence)
    # Specific runtime evidence refines generic declarations.
    if any(m['platform'] == 'Web' and m['technology'] not in ('H5', '技术待识别') for m in matches):
        matches = [m for m in matches if not (m['platform'] == 'Web' and m['technology'] in ('H5', '技术待识别'))]
    elif any(m['technology'] == 'H5' for m in matches):
        matches = [m for m in matches if not (m['platform'] == 'Web' and m['technology'] == '技术待识别')]
    return dict(status='hint' if matches else 'unknown', matches=matches,
                label='、'.join(dict.fromkeys(m['platform'] + ' · ' + m['technology'] for m in matches)) or '待识别',
                basis='页面线索，未经运行验证' if matches else '未发现明确平台或运行技术线索；介绍页和 iframe 本身不足以判定',
                version=1)
