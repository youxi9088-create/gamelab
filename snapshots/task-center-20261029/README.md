# Task center snapshot

Read-only consistent snapshot of business records, including jobs, history, conversations and version metadata. Credentials, accounts, sessions, leases and operational configuration are excluded. Execution states are preserved as observed; this is an archival snapshot, not a runnable database. Artifact binaries remain in the local artifact store / R2. Each JSONL line contains kind, id and data.
