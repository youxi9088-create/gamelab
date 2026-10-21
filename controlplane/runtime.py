"""Shared local Node discovery; explicit configuration never silently falls back."""
import os
import shutil
from pathlib import Path


def node_binary():
    explicit = os.environ.get('NODE_BINARY')
    if explicit:
        return shutil.which(explicit) or (explicit if Path(explicit).is_file() else None)
    found = shutil.which('node')
    if found:
        return found
    candidates = [Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe']
    if os.environ.get('LOCALAPPDATA'):
        candidates.append(Path(os.environ['LOCALAPPDATA'])/'door-runtime/node/node.exe')
    return next((str(p) for p in candidates if p.is_file()), None)
