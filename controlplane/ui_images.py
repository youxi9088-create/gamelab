"""Cached UI thumbnails only; original game assets and screenshots stay unchanged."""
import hashlib
import io
import os
import uuid
from pathlib import Path


def thumbnail(source, width, cache):
    from PIL import Image, ImageOps
    source = Path(source)
    width = max(120, min(1600, int(width)))
    info = source.stat()
    if info.st_size > 25*1024*1024:
        raise ValueError('UI thumbnail source exceeds limit')
    key = hashlib.sha256(f'{source.resolve()}:{info.st_mtime_ns}:{info.st_size}:{width}:1'.encode()).hexdigest()
    cache = Path(cache)
    cache.mkdir(parents=True, exist_ok=True)
    target = cache/(key+'.webp')
    if not target.exists():
        with Image.open(source) as image:
            if image.width*image.height > 40_000_000:
                raise ValueError('UI thumbnail pixel limit exceeded')
            image = ImageOps.exif_transpose(image)
            image.thumbnail((width, width), Image.Resampling.LANCZOS)
            image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
            out = io.BytesIO()
            image.save(out, format='WEBP', quality=80, method=4)
        temporary = cache/(key+'.'+uuid.uuid4().hex+'.tmp')
        try:
            temporary.write_bytes(out.getvalue())
            os.replace(temporary, target)
        finally:
            temporary.unlink(missing_ok=True)
    return target.read_bytes(), 'image/webp', key
