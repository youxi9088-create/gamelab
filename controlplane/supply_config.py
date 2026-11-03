"""Server-only settings. Environment overrides an ignored local config file."""
import json
import os
import ipaddress
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

KEYS = ('SUPPLY_PLATFORM_BASE', 'SUPPLY_APP_ID', 'SUPPLY_APP_SECRET',
        'SUPPLY_ARCHIVE_DIR', 'SUPPLY_ARCHIVE_BASE_URL', 'SUPPLY_EXPECTED_FINGERPRINT',
        'SUPPLY_DELIVERY_MODE','SUPPLY_CS_TENANT_ID','SUPPLY_CS_AUTHORIZATION')
SECRET_KEYS={'SUPPLY_APP_SECRET','SUPPLY_CS_AUTHORIZATION'}
DEFAULT_FILE = Path(__file__).resolve().parents[1]/'data'/'supply-config.json'


def settings():
    path = Path(os.getenv('SUPPLY_CONFIG_FILE', str(DEFAULT_FILE)))
    try:
        data = json.loads(path.read_text(encoding='utf-8-sig'))
        if not isinstance(data, dict):
            raise ValueError()
    except FileNotFoundError:data={}
    except OSError:data={'_config_error':'CONFIG_FILE_UNREADABLE'}
    except ValueError:data={'_config_error':'CONFIG_FILE_INVALID'}
    return {**data, **{key: os.environ[key].strip() for key in KEYS if key in os.environ}}


def readiness(config=None):
    config = settings() if config is None else config
    mode=config.get('SUPPLY_DELIVERY_MODE') or 'static'
    required=KEYS[:3]+(('SUPPLY_CS_TENANT_ID','SUPPLY_CS_AUTHORIZATION') if mode=='cs' else ('SUPPLY_ARCHIVE_DIR','SUPPLY_ARCHIVE_BASE_URL'))
    missing = [key for key in required if not isinstance(config.get(key), str) or not config[key].strip()]
    errors = []
    if config.get('_config_error'):errors.append(config['_config_error'])
    if mode not in ('static','cs'):errors.append('SUPPLY_DELIVERY_MODE_INVALID')
    if config.get('_invalid'):
        errors.append('CONFIG_FILE_INVALID')
    for key in ('SUPPLY_PLATFORM_BASE', 'SUPPLY_ARCHIVE_BASE_URL'):
        if mode=='cs' and key=='SUPPLY_ARCHIVE_BASE_URL':continue
        if key in missing:
            continue
        try:
            url = urlsplit(config[key])
            lan=False
            if key=='SUPPLY_PLATFORM_BASE' and config.get('SUPPLY_ALLOW_LAN_HTTP') is True and url.scheme=='http':
                try:lan=any(ipaddress.ip_address(url.hostname) in ipaddress.ip_network(net) for net in ('10.0.0.0/8','172.16.0.0/12','192.168.0.0/16'))
                except ValueError:pass
            if ((url.scheme != 'https' and not lan) or not url.hostname or (not lan and url.port not in (None,443)) or url.username or url.query or url.fragment
                    or (key == 'SUPPLY_PLATFORM_BASE' and url.path not in ('', '/'))):
                errors.append(key+'_INVALID')
        except ValueError:
            errors.append(key+'_INVALID')
    if 'SUPPLY_APP_ID' not in missing and not config['SUPPLY_APP_ID'].startswith('sup_'):
        errors.append('SUPPLY_APP_ID_INVALID')
    if mode=='static' and 'SUPPLY_ARCHIVE_DIR' not in missing:
        path = Path(config['SUPPLY_ARCHIVE_DIR'])
        if not path.is_absolute():
            errors.append('SUPPLY_ARCHIVE_DIR_NOT_ABSOLUTE')
    return {'configured': not missing and not errors, 'missing': missing, 'errors': errors,'delivery_mode':mode}


def secure_config_file(path):
    """Keep credentials private while allowing the deployed service to read."""
    path=Path(path)
    if os.name=='nt':
        sid=subprocess.check_output(['whoami','/user','/fo','csv','/nh'],text=True).strip().split(',')[-1].strip('"')
        grants={'S-1-5-18':'F','S-1-5-32-544':'F','S-1-5-19':'R'}
        grants[sid]='F'
        subprocess.run(['icacls',str(path),'/inheritance:r','/grant:r',*[('*'+s+':'+right) for s,right in grants.items()]],check=True,capture_output=True)
    else:path.chmod(0o600)
