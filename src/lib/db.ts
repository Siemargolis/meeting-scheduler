import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'meeting-scheduler.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      creator_name TEXT NOT NULL,
      creator_email TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      duration INTEGER NOT NULL CHECK (duration IN (15, 30, 60)),
      date_range_start TEXT NOT NULL,
      date_range_end TEXT NOT NULL,
      time_range_start TEXT NOT NULL,
      time_range_end TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'America/New_York',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      finalized_slot_start TEXT,
      finalized_slot_end TEXT
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      respondent_name TEXT NOT NULL,
      respondent_email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS availability_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      response_id TEXT NOT NULL,
      slot_start TEXT NOT NULL,
      slot_end TEXT NOT NULL,
      FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_responses_meeting_id ON responses(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_slots_response_id ON availability_slots(response_id);
  `);
}
