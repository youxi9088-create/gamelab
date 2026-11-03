"""Static original-build evidence, independent of conversion adapters and outputs."""
import re
from html.parser import HTMLParser
from urllib.parse import urlsplit

LIBRARIES = {
    'three': r'(?:^|/)three(?:@|/|[.-](?:module|min|js))',
    'phaser': r'(?:^|/)phaser(?:@|/|[.-])',
    'pixi': r'(?:^|/)(?:pixi|pixi\.js)(?:@|/|[.-]|$)',
    'babylon': r'(?:^|/)babylon(?:js)?(?:@|/|[.-]|$)',
    'laya': r'(?:^|/)laya(?:air)?(?:@|/|[.-])',
    'cocos2': r'cocos2d-js',
    'cocos3': r'(?:^|/)cocos-js/cc(?:\.|/)',
    'defold': r'(?:^|/)dmloader\.js$',
    'unity': r'\.framework\.js$|UnityLoader\.js$',
    'godot': r'(?:^|/)godot(?:[.-]|/)',
}


class Scripts(HTMLParser):
    def __init__(self):
        super().__init__(); self.inside = False; self.code = []; self.urls = []
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.inside = True
            src = dict(attrs).get('src')
            if src: self.urls.append(src)
    def handle_endtag(self, tag):
        if tag == 'script': self.inside = False
    def handle_data(self, data):
        if self.inside: self.code.append(data)


def infer(acquisition, source_html=''):
    parser = Scripts(); parser.feed(source_html)
    urls = list(parser.urls)
    for row in acquisition.get('files', []):
        if row.get('script') or 'javascript' in row.get('contentType', ''):
            urls.append(row.get('sourceURL') or row.get('url', ''))
    code = '\n'.join(parser.code)
    code = re.sub(r'/\*.*?\*/|^\s*//[^\n]*', '', code, flags=re.S | re.M)
    # Include declared ES module/import-map URLs, never rendered page prose.
    urls.extend(re.findall(r'["\']((?:https?:)?//[^"\'\s]+)["\']', code))
    found = {engine for engine, pattern in LIBRARIES.items()
             if any(re.search(pattern, urlsplit(url).path, re.I) for url in urls)}
    markers = {
        'three': r'\bnew\s+THREE\.(?:Scene|WebGLRenderer)\s*\(',
        'phaser': r'\bnew\s+Phaser\.Game\s*\(',
        'pixi': r'\bnew\s+PIXI\.Application\s*\(',
        'babylon': r'\bnew\s+BABYLON\.(?:Engine|Scene)\s*\(',
        'defold': r'\bEngineLoader\.load\s*\(',
        'unity': r'\bcreateUnityInstance\s*\(',
        'cocos2': r'\b_CCSettings\s*=',
    }
    found.update(engine for engine, pattern in markers.items() if re.search(pattern, code))
    if not found and re.search(r'\.getContext\(\s*["\']2d["\']', code):
        found.add('canvas2d')
    return found
