import Database from 'better-sqlite3';
import type { Database as DatabaseType, Statement } from 'better-sqlite3';

import type { Entry, Sense } from '@/types/database.js';

export interface JmdictDatabaseInterface {
  insertEntry(entry: Entry): void;
  insertSense(sense: Sense): void;
  close(): void;
}

export class JmdictDatabase implements JmdictDatabaseInterface {
  db: DatabaseType;
  insertEntryStmt!: Statement;
  insertSenseStmt!: Statement;

  constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma('foreign_keys = ON');
    this._initializeTables();
    this._prepareStatements();
  }

  private _initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entries (
        ent_seq INTEGER PRIMARY KEY,
        kanji TEXT DEFAULT NULL,
        kana TEXT
      );

      CREATE TABLE IF NOT EXISTS senses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ent_seq INTEGER,
        note TEXT,
        glosses TEXT,
        pos TEXT,
        fields TEXT,
        tags TEXT,
        FOREIGN KEY (ent_seq) REFERENCES entries(ent_seq)
      );
    `);
  }

  private _prepareStatements() {
    this.insertEntryStmt = this.db.prepare(`
      INSERT OR IGNORE INTO entries (ent_seq, kanji, kana) VALUES (?, ?, ?)
    `);

    this.insertSenseStmt = this.db.prepare(`
      INSERT INTO senses (ent_seq, note, glosses, pos, fields, tags) VALUES (?, ?, ?, ?, ?, ?)
    `);
  }

  insertEntry(entry: Entry) {
    this.insertEntryStmt.run(
      entry.ent_seq,
      entry.kanji && entry.kanji.length > 0 ? JSON.stringify(entry.kanji) : null,
      JSON.stringify(entry.kana),
    );

    for (const sense of entry.senses ?? []) {
      sense.ent_seq = entry.ent_seq;
      this.insertSense(sense);
    }
  }

  insertSense(sense: Sense) {
    this.insertSenseStmt.run(
      sense.ent_seq,
      sense.note,
      JSON.stringify(sense.glosses),
      JSON.stringify(sense.pos),
      sense.fields && sense.fields.length > 0 ? JSON.stringify(sense.fields) : null,
      sense.tags && sense.tags.length > 0 ? JSON.stringify(sense.tags) : null,
    );
  }

  close() {
    this.db.close();
  }
}
