import Database from 'better-sqlite3';

export const db = new Database('./data/jmdict.sqlite');

db.exec(`
  PRAGMA foreign_keys = ON;
  DROP TABLE IF EXISTS senses;
  DROP TABLE IF EXISTS entries;

  CREATE TABLE IF NOT EXISTS entries (
    ent_seq INTEGER PRIMARY KEY,
    kanji TEXT,
    kana TEXT
  );

  CREATE TABLE IF NOT EXISTS senses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ent_seq INTEGER,
    gloss TEXT,
    pos TEXT,
    FOREIGN KEY (ent_seq) REFERENCES entries(ent_seq)
  );
`);

export const insertEntry = db.prepare(`
  INSERT OR IGNORE INTO entries (ent_seq, kanji, kana) VALUES (?, ?, ?)
`);

export const insertSense = db.prepare(`
  INSERT INTO senses (ent_seq, gloss, pos) VALUES (?, ?, ?)
`);
