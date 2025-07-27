import Database from 'better-sqlite3';
import type { Database as DatabaseType, Statement } from 'better-sqlite3';

import type Entry from '@/models/entry.js';
import type Sense from '@/models/sense.js';

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
        gloss TEXT,
        pos TEXT,
        FOREIGN KEY (ent_seq) REFERENCES entries(ent_seq)
      );
    `);
  }

  private _prepareStatements() {
    this.insertEntryStmt = this.db.prepare(`
      INSERT OR IGNORE INTO entries (ent_seq, kanji, kana) VALUES (?, ?, ?)
    `);

    this.insertSenseStmt = this.db.prepare(`
      INSERT INTO senses (ent_seq, gloss, pos) VALUES (?, ?, ?)
    `);
  }

  insertEntry(entry: Entry) {
    this.insertEntryStmt.run(
      entry.ent_seq,
      entry.kanji?.length && entry.kanji.length > 0 ? entry.kanji.join('; ') : null,
      entry.kana?.length && entry.kana.length > 0 ? entry.kana.join('; ') : null,
    );

    for (const sense of entry.senses) {
      if (entry.ent_seq === undefined) {
        continue; // Skip if ent_seq is undefined
      }
      sense.ent_seq = entry.ent_seq;
      this.insertSense(sense);
    }
  }

  insertSense(sense: Sense) {
    this.insertSenseStmt.run(sense.ent_seq, sense.glosses.join('; '), sense.pos.join('; '));
  }

  close() {
    this.db.close();
  }
}
