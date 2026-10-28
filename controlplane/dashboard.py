"""Cumulative, evidence-backed production counts. Never changes source records."""
from urllib.parse import urlsplit
from .source_routing import observations_of


def production_metrics(state):
    from .service import canonical_url, ApiError

    def url_key(url):
        try:
            return canonical_url(url)
        except ApiError:
            return None

    candidates = {c['id']: c for c in state.get('candidates', [])
                  if not observations_of(c).get('catalog_hidden')}
    hidden = {url_key(c.get('url')) for c in state.get('candidates', [])
              if c['id'] not in candidates}
    keys = {cid: url_key(c.get('url')) or cid for cid, c in candidates.items()}
    groups = {key: set() for key in ('websites', 'analyzed', 'acquired', 'generated')}
    for source in state.get('sources', []):
        try:
            host = urlsplit(source.get('url', '')).hostname
            if host:
                groups['websites'].add(host.lower().removeprefix('www.'))
        except ValueError:
            pass
    for item in state.get('recommendations', []):
        key = url_key(item.get('url'))
        if key and key not in hidden and item.get('content_sha256'):
            groups['analyzed'].add(key)
    for cid, c in candidates.items():
        if c.get('source_bundle_id'):
            groups['acquired'].add(keys[cid])
    jobs = {j['id']: j for j in state.get('jobs', [])}
    for event in state.get('events', []):
        cid = jobs.get(event.get('job_id'), {}).get('candidate_id')
        if cid in keys and event.get('node') == 'analysis' and event.get('node_status') == 'succeeded':
            groups['analyzed'].add(keys[cid])
    # Reports from every delivery path are considered, including local imports.
    for record in state.get('jobs', []) + state.get('versions', []):
        cid = record.get('candidate_id')
        if cid not in keys:
            continue
        report = record.get('report') or {}
        if report.get('rea_attempted') or report.get('rea_evidence_id') or report.get('gameplay_spec'):
            groups['analyzed'].add(keys[cid])
        if record.get('artifact_id'):
            if (report.get('source_recovered') or report.get('source_bundle_manifest')
                    or report.get('original_resource_catalog') or report.get('source_recovery')
                    or report.get('resource_provenance') or report.get('recovery_kind')):
                groups['acquired'].add(keys[cid])
            if (report.get('remote_model_called') is True
                    or report.get('tool') in ('codex', 'external-coding-agent')
                    or report.get('path') == 'B'):
                groups['generated'].add(keys[cid])
    return {**{key: len(values) for key, values in groups.items()},
            'templates': None,
            'evidence': {key: sorted(values) for key, values in groups.items()}}
