"""Load complete evidence for one game without building global statistics."""
import json


def candidate_detail(service, candidate_id):
    from .pipeline import timeline, progress_summary
    from .conversations import message_presentation
    from .catalog_facets import web_delivery
    collections = ('candidates', 'jobs', 'versions', 'messages', 'rounds', 'events')
    result = {key: [] for key in collections}
    with service.store.read() as db:
        candidate = service.store.get(db, 'candidates', candidate_id)
        if not candidate:
            return result
        result['candidates'] = [candidate]
        for key in ('jobs', 'versions', 'messages', 'rounds'):
            result[key] = [json.loads(row[0]) for row in db.execute(
                "SELECT data FROM records WHERE kind=? AND json_extract(data,'$.candidate_id')=? ORDER BY rowid DESC",
                (key, candidate_id))]
        # Match job-linked events even when older records have no candidate_id.
        result['events'] = [json.loads(row[0]) for row in db.execute(
            "SELECT data FROM records WHERE kind='events' AND (json_extract(data,'$.candidate_id')=? OR "
            "json_extract(data,'$.job_id') IN (SELECT id FROM records WHERE kind='jobs' AND json_extract(data,'$.candidate_id')=?)) ORDER BY rowid DESC",
            (candidate_id, candidate_id))]
        from .accounts import actor_names
        actors = actor_names(service.store, db)
        for version in result['versions']:
            version['web_delivery'] = web_delivery(version)
            profile = service.store.get(db, 'game_profiles', version['id'])
            if profile:
                version['game_profile'] = profile['profile']
        for job in result['jobs']:
            job.pop('lease_token', None)
            job['pipeline'] = timeline(job, result['events'], result['versions'])
            job['progress_label'] = progress_summary(job, result['versions'])
        for message in result['messages']:
            message['presentation'] = message_presentation(message, result['jobs'], result['events'], result['rounds'])
        for key in ('candidates', 'jobs', 'messages', 'versions'):
            for row in result[key]:
                if row.get('created_by'):
                    row['created_by_name'] = actors.get(row['created_by'], row['created_by'])
    return result
