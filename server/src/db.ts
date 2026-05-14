import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(__dirname, '..', 'data.db')
const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    entrance TEXT NOT NULL DEFAULT '',
    guard_attitude INTEGER NOT NULL CHECK(guard_attitude BETWEEN 0 AND 3),
    elevator_access INTEGER NOT NULL DEFAULT 0,
    tips TEXT NOT NULL DEFAULT '',
    contributor_id TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    up_votes INTEGER NOT NULL DEFAULT 0,
    down_votes INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS votes (
    user_id TEXT NOT NULL REFERENCES users(id),
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    direction INTEGER NOT NULL CHECK(direction IN (1, -1)),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    PRIMARY KEY (user_id, entry_id)
  );

  CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_entries_attitude ON entries(guard_attitude);
  CREATE INDEX IF NOT EXISTS idx_entries_name ON entries(name);
`)

export default db