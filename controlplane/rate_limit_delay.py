"""Bounded provider rate-limit retry delay; no quota assumptions."""
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

def retry_delay(headers, attempt, remaining):
    raw = (headers or {}).get('Retry-After')
    delay = min(60, 10 * (2 ** attempt))
    if raw is not None:
        try:
            delay = max(0, float(raw))
        except (TypeError, ValueError):
            try:
                stamp = parsedate_to_datetime(raw)
                if stamp.tzinfo is None: stamp = stamp.replace(tzinfo=timezone.utc)
                delay = max(0, (stamp-datetime.now(timezone.utc)).total_seconds())
            except (TypeError, ValueError, OverflowError): pass
    return delay if delay + 1 < remaining else None
