"""Validated, hash-verified distribution for the shared supply outbox."""
import hashlib,json,secrets,shutil,urllib.parse,urllib.request
from pathlib import Path

UPLOAD_HOSTS={'cs.cn.ndhy.com','cs.base.ndhy.com','cs.101.com'}
DOWNLOAD_ORIGIN='https://cs.101.com'

def publish(archive,digest,config,opener=None):
    from .supply import SupplyError,NoRedirect
    archive=Path(archive)
    if archive.stat().st_size>100_000_000:raise SupplyError('ARCHIVE_TOO_LARGE',413)
    if hashlib.sha256(archive.read_bytes()).hexdigest()!=digest:raise SupplyError('IMMUTABLE_VERSION_CHANGED',409)
    opener=opener or urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
    try:
        if config.get('SUPPLY_DELIVERY_MODE')=='cs':
            request=urllib.request.Request(config['SUPPLY_PLATFORM_BASE'].rstrip('/')+'/v1/apecv/resource/upload_info',headers={
                'TenantId':config['SUPPLY_CS_TENANT_ID'],'Authorization':config['SUPPLY_CS_AUTHORIZATION']})
            with opener.open(request,timeout=30) as response:info=json.loads(response.read(65536))
            value=info['access_url'];url=urllib.parse.urlsplit(value if '://' in value else 'https://'+value)
            if url.scheme!='https' or url.hostname not in UPLOAD_HOSTS or url.port not in (None,443) or url.username or url.query or url.fragment:
                raise SupplyError('CS_UPLOAD_HOST_INVALID',422)
            boundary='----gamelab'+secrets.token_hex(16);parts=[]
            for key,value in {'path':info['dist_path'],'name':archive.name,'scope':'1'}.items():
                if not isinstance(value,str) or any(c in value for c in '\r\n\x00'):raise SupplyError('CS_UPLOAD_TICKET_INVALID',502)
                parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode())
            parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{archive.name}"\r\nContent-Type: application/zip\r\n\r\n'.encode())
            parts.extend((archive.read_bytes(),f'\r\n--{boundary}--\r\n'.encode()))
            query=urllib.parse.urlencode({'token':info['token'],'policy':info['policy'],'date':info['date_time']})
            request=urllib.request.Request('https://'+url.netloc+'/v0.1/upload?'+query,data=b''.join(parts),headers={'Content-Type':'multipart/form-data; boundary='+boundary},method='POST')
            with opener.open(request,timeout=600) as response:path=json.loads(response.read(65536))['path']
            if not isinstance(path,str) or not path.startswith('/') or path.startswith('//') or any(c in path for c in '\r\n?#\\') or '..' in urllib.parse.unquote(path).split('/'):
                raise SupplyError('CS_DOWNLOAD_PATH_INVALID',502)
            download=DOWNLOAD_ORIGIN+'/v0.1/static'+path
        else:
            base=urllib.parse.urlsplit(config['SUPPLY_ARCHIVE_BASE_URL'])
            if base.scheme!='https' or not base.hostname or base.username or base.query or base.fragment:raise SupplyError('INVALID_ARCHIVE_URL',400)
            target=Path(config['SUPPLY_ARCHIVE_DIR'])/archive.name;target.parent.mkdir(parents=True,exist_ok=True)
            if target.resolve()!=archive.resolve():
                if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()!=digest:raise SupplyError('ARCHIVE_TARGET_CONFLICT',409)
                staging=target.with_suffix('.tmp');shutil.copyfile(archive,staging);staging.replace(target)
            download=config['SUPPLY_ARCHIVE_BASE_URL'].rstrip('/')+'/'+archive.name
        # Exact bytes must be downloadable without a browser/session or redirects.
        h=hashlib.sha256();total=0
        with opener.open(urllib.request.Request(download),timeout=300) as response:
            while chunk:=response.read(1024*1024):
                total+=len(chunk)
                if total>archive.stat().st_size:raise SupplyError('DOWNLOAD_HASH_MISMATCH',422)
                h.update(chunk)
        if total!=archive.stat().st_size or h.hexdigest()!=digest:raise SupplyError('DOWNLOAD_HASH_MISMATCH',422)
        return download
    except SupplyError:raise
    except Exception:raise SupplyError('ARCHIVE_DISTRIBUTION_FAILED',503) from None
