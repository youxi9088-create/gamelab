"""Lossless JSON text for UTF-8 evidence files, including browser UTF-16 strings."""
import json


def dumps(value, **options):
    # JS can return an unpaired surrogate after slicing a DOM string. Escape
    # that code unit as JSON, rather than dropping evidence or emitting invalid
    # UTF-8. Ordinary Unicode (including Chinese and complete emoji) stays intact.
    return json.dumps(value, **options).encode('utf-8', 'backslashreplace').decode('utf-8')
