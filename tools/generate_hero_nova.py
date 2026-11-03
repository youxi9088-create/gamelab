import base64
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "assets" / "hero-game-islands.png"
OUTPUT = ROOT / "web" / "assets" / "hero-nova-archipelago.png"
PROVENANCE = ROOT / "web" / "assets" / "hero-nova-archipelago.json"
PROMPT = """以参考图的像素艺术群岛为基础，重绘一张高品质的 16:9 网站首页头图。
保留左侧生活岛屿、右侧赛车岛屿和连接两岛的桥梁，中央保留大面积通透的蓝色海面留白，便于叠加白色标题。
画面具有清晰的近景、中景、远景层次，加入少量白云、远景热气球和海面帆船，水波与反光细节丰富，色彩清新鲜明但中央区域略暗，确保文字可读。
像素游戏插画风格，细节精致，边缘干净，不要任何文字、字母、Logo、UI、边框或水印。"""


def main():
    key = os.environ.get("SENSENOVA_API_KEY")
    if not key:
        raise SystemExit("SENSENOVA_API_KEY is required")
    image_data = base64.b64encode(SOURCE.read_bytes()).decode("ascii")
    response = requests.post(
        "https://token.sensenova.cn/v1/images/edits",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "User-Agent": "GameLab/1.0"},
        json={
            "model": "sensenova-u1.5-lite",
            "images": [{"image_url": f"data:image/png;base64,{image_data}"}],
            "prompt": PROMPT,
            "n": 1,
            "size": "2720x1536",
            "response_format": "b64_json",
            "output_format": "png",
            "watermark": False,
            "prompt_extend": True,
        },
        timeout=300,
    )
    if not response.ok:
        raise SystemExit(f"SenseNova request failed: HTTP {response.status_code}; {response.text[:500]}")
    payload = response.json()
    item = payload["data"][0]
    if item.get("b64_json"):
        content = base64.b64decode(item["b64_json"])
    elif item.get("url"):
        download = requests.get(item["url"], timeout=120)
        download.raise_for_status()
        content = download.content
    else:
        raise SystemExit("SenseNova response contained no image")
    OUTPUT.write_bytes(content)
    PROVENANCE.write_text(json.dumps({
        "asset": OUTPUT.name,
        "source_asset": SOURCE.name,
        "provider": "SenseNova",
        "model": "sensenova-u1.5-lite",
        "operation": "image_edit",
        "prompt": PROMPT,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"created": str(OUTPUT), "bytes": len(content), "model": "sensenova-u1.5-lite"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
