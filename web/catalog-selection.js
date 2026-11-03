// Candidate selection is a handoff boundary: existing work belongs to Tasks.
export function candidatePool(state) {
  const assigned=new Set((state.jobs||[]).map(job=>job.candidate_id));
  const accepted=new Set((state.versions||[]).filter(v=>['approved','published'].includes(v.status)).map(v=>v.candidate_id));
  return (state.candidates||[]).filter(c=>!c.observations?.catalog_hidden && !assigned.has(c.id) && !accepted.has(c.id) && !['rejected','archived','deleted'].includes(c.status));
}
