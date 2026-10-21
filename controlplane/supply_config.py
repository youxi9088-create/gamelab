"""Server-only settings. Environment overrides an ignored local config file."""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

KEYS = ('SUPPLY_PLATFORM_BASE', 'SUPPLY_APP_ID', 'SUPPLY_APP_SECRET',
        'SUPPLY_ARCHIVE_DIR', 'SUPPLY_ARCHIVE_BASE_URL', 'SUPPLY_EXPECTED_FINGERPRINT')
DEFAULT_FILE = Path(__file__).resolve().parents[1]/'data'/'supply-config.json'


def settings():
    path = Path(os.getenv('SUPPLY_CONFIG_FILE', str(DEFAULT_FILE)))
    try:
        data = json.loads(path.read_text(encoding='utf-8-sig')) if path.exists() else {}
        if not isinstance(data, dict):
            raise ValueError()
    except (OSError, ValueError):
        data = {'_invalid': True}
    return {**data, **{key: os.environ[key].strip() for key in KEYS if key in os.environ}}


def readiness(config=None):
    config = settings() if config is None else config
    missing = [key for key in KEYS[:5] if not isinstance(config.get(key), str) or not config[key].strip()]
    errors = []
    if config.get('_invalid'):
        errors.append('CONFIG_FILE_INVALID')
    for key in ('SUPPLY_PLATFORM_BASE', 'SUPPLY_ARCHIVE_BASE_URL'):
        if key in missing:
            continue
        try:
            url = urlsplit(config[key])
            if (url.scheme != 'https' or not url.hostname or url.port not in (None,443) or url.username or url.query or url.fragment
                    or (key == 'SUPPLY_PLATFORM_BASE' and url.path not in ('', '/'))):
                errors.append(key+'_INVALID')
        except ValueError:
            errors.append(key+'_INVALID')
    if 'SUPPLY_APP_ID' not in missing and not config['SUPPLY_APP_ID'].startswith('sup_'):
        errors.append('SUPPLY_APP_ID_INVALID')
    if 'SUPPLY_ARCHIVE_DIR' not in missing:
        path = Path(config['SUPPLY_ARCHIVE_DIR'])
        if not path.is_absolute():
            errors.append('SUPPLY_ARCHIVE_DIR_NOT_ABSOLUTE')
    return {'configured': not missing and not errors, 'missing': missing, 'errors': errors}
