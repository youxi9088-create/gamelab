"""Shared display contract for converted and locally imported game versions."""
import math

def preview_settings(report):
    value=report.get('preview',{})
    if not isinstance(value,dict):raise ValueError('preview must be an object')
    zoom=value.get('zoom',1)
    if isinstance(zoom,bool) or not isinstance(zoom,(int,float)) or not math.isfinite(zoom) or not 1<=zoom<=8:
        raise ValueError('preview.zoom must be between 1 and 8')
    return {'fit':'cover','zoom':zoom,'position':'center'}
