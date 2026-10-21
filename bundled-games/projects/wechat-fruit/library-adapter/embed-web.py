"""Run from the source project root after pnpm build --target web --minify."""
from pathlib import Path
import base64,json
dest=Path('dist/web')
assets={p.relative_to(dest).as_posix():base64.b64encode(p.read_bytes()).decode() for p in (dest/'assets').rglob('*') if p.is_file()}
(dest/'embedded-assets.js').write_text('globalThis.__GAME_ASSETS='+json.dumps(assets)+';',encoding='utf-8')
p=dest/'index.html'
html=p.read_text(encoding='utf-8')
if 'embedded-assets.js' not in html:
    html=html.replace('<script src="game.js">','<script src="embedded-assets.js"></script>\n<script src="game.js">')
p.write_text(html,encoding='utf-8')
print('Embedded',len(assets),'assets for sandbox playback')
