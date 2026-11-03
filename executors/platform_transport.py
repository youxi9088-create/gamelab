"""Bounded control-plane transport; never replay an ambiguously sent write."""
import errno
import ipaddress
import time
import urllib.error
import urllib.request
from urllib.parse import urlsplit


class PlatformConnectionRefused(urllib.error.URLError):
    control_plane_transport = True


def _loopback(host):
    if host == 'localhost':
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def open_request(request, timeout=30):
    parsed=urlsplit(request.full_url)
    # A local executor callback must not be sent to an outbound/system proxy.
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({})).open if _loopback(parsed.hostname) else urllib.request.urlopen
    # Local service supervisor waits 15 seconds before restarting. Only refusal
    # proves no request was sent; ambiguous errors remain non-retryable.
    delays=(.5,1,2,4,5,5,5,5) if _loopback(parsed.hostname) else (.5,1,2)
    for attempt in range(len(delays)+1):
        try:
            return opener(request,timeout=timeout)
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError,ConnectionRefusedError) as exc:
            reason=getattr(exc,'reason',exc)
            refused=(isinstance(reason,ConnectionRefusedError) or
                     getattr(reason,'errno',None) in (errno.ECONNREFUSED,10061) or
                     getattr(reason,'winerror',None)==10061)
            if not refused:
                raise
            if attempt == len(delays):
                host=parsed.hostname or 'unknown'
                port=':'+str(parsed.port) if parsed.port else ''
                target=f'{parsed.scheme}://{host}{port}{parsed.path}'
                raise PlatformConnectionRefused(f'Control-plane connection refused before request was sent ({len(delays)+1} attempts): {target}') from None
            time.sleep(delays[attempt])
