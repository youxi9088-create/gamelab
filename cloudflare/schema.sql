CREATE TABLE IF NOT EXISTS records (
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL CHECK(json_valid(data)),
  PRIMARY KEY(kind,id)
);
CREATE TABLE IF NOT EXISTS credentials (token_hash TEXT PRIMARY KEY,tool_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS artifact_files (
  artifact_id TEXT NOT NULL,
  path TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  sha256 TEXT NOT NULL,
  bytes INTEGER NOT NULL CHECK(bytes >= 0),
  PRIMARY KEY(artifact_id,path)
);
CREATE TABLE IF NOT EXISTS auth_failures (key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS records_username ON records(kind,json_extract(data,'$.username'));
