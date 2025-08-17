import Database from 'better-sqlite3';
import type { Database as DatabaseType, Statement } from 'better-sqlite3';

import type { Entry, Sense } from '@/lib/types/database.js';

export interface JMdictDatabaseInterface {
  insertEntry(entry: Entry): void;
  insertSense(sense: Sense): void;
  close(): void;
}

export class JMdictDatabase implements JMdictDatabaseInterface {
  db: DatabaseType;
  insertEntryStmt!: Statement;
  insertSenseStmt!: Statement;

  constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma('foreign_keys = ON');
    this._initializeTables();
    this._prepareStatements();

    this.setMeta('version', process.env.npm_package_version ?? 'unknown');
    this.setMeta('language', 'en');
    this.setMeta('license', 'GPLv2');
    this.setMeta('compiled_at', new Date().toISOString());
  }

  private _initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS entries (
        ent_seq INTEGER PRIMARY KEY,
        kanji TEXT DEFAULT NULL,
        kana TEXT
      );

      CREATE TABLE IF NOT EXISTS senses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ent_seq INTEGER,
        lang TEXT,
        note TEXT,
        glosses TEXT,
        pos TEXT,
        verb_data TEXT,
        fields TEXT,
        tags TEXT,
        ant TEXT,
        see TEXT,
        refs TEXT,
        FOREIGN KEY (ent_seq) REFERENCES entries(ent_seq)
      );
    `);
  }

  private _prepareStatements() {
    this.insertEntryStmt = this.db.prepare(`
      INSERT OR IGNORE INTO entries (ent_seq, kanji, kana) VALUES (?, ?, ?)
    `);

    this.insertSenseStmt = this.db.prepare(`
      INSERT INTO senses (ent_seq, lang, note, glosses, pos, verb_data, fields, tags, ant, see) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
  }

  getTableCount(tableName: string): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
    const row = stmt.get() as { count: number };

    return row.count;
  }

  setMeta(key: string, value: string) {
    const stmt = this.db.prepare(`
      INSERT INTO meta (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `);

    stmt.run(key, value);
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

  insertEntries(entries: Entry[]) {
    const insertMany = this.db.transaction((entries: Entry[]) => {
      for (const entry of entries) {
        this.insertEntry(entry);
      }
    });

    insertMany(entries);
  }

  insertSense(sense: Sense) {
    this.insertSenseStmt.run(
      sense.ent_seq,
      sense.lang,
      sense.note,
      JSON.stringify(sense.glosses),
      JSON.stringify(sense.pos),
      sense.verb_data?.verb_group ? JSON.stringify(sense.verb_data) : null,
      sense.fields && sense.fields.length > 0 ? JSON.stringify(sense.fields) : null,
      sense.tags && sense.tags.length > 0 ? JSON.stringify(sense.tags) : null,
      sense.ant && sense.ant.length > 0 ? JSON.stringify(sense.ant) : null,
      sense.see && sense.see.length > 0 ? JSON.stringify(sense.see) : null,
    );
  }

  async _postProcessRefs() {
    const updateStmt = this.db.prepare(`UPDATE senses SET refs = ? WHERE id = ?`);

    // 1. Load all entries in memory
    const allEntries = this.db.prepare(`SELECT ent_seq, kanji, kana FROM entries`).all() as {
      ent_seq: number;
      kanji: string | null;
      kana: string;
    }[];

    // Build a map: written -> ent_seq
    const entryMap = new Map<string, number>();

    for (const e of allEntries) {
      const kanjiArr = e.kanji ? (JSON.parse(e.kanji) as { written: string }[]) : [];
      const kanaArr = JSON.parse(e.kana) as { written: string }[];

      for (const w of [...kanjiArr, ...kanaArr]) entryMap.set(w.written, e.ent_seq);
    }

    // 2. Load all senses
    const allSenses = this.db
      .prepare(`SELECT id, ent_seq, see, ant FROM senses ORDER BY ent_seq, id`)
      .all() as {
      id: number;
      ent_seq: number;
      see: string | null;
      ant: string | null;
    }[];

    // Group senses by entry
    const entrySensesMap = new Map<number, typeof allSenses>();

    for (const s of allSenses) {
      if (!entrySensesMap.has(s.ent_seq)) entrySensesMap.set(s.ent_seq, []);

      entrySensesMap.get(s.ent_seq)!.push(s);
    }

    // 3. Process refs in memory
    const refsToUpdate: { id: number; refs: string | null }[] = [];

    for (const sense of allSenses) {
      const refs: { type: 'see' | 'ant'; ent_seq: number; sense_id: number }[] = [];

      const processField = (field: 'see' | 'ant', jsonStr: string | null) => {
        if (!jsonStr) return;

        const arr = JSON.parse(jsonStr) as { written: string }[];

        for (const obj of arr) {
          const ent_seq = entryMap.get(obj.written);

          if (ent_seq) {
            const targetSenses = entrySensesMap.get(ent_seq) || [];

            for (const ts of targetSenses) {
              refs.push({ type: field, ent_seq, sense_id: ts.id });
            }
          }
        }
      };

      processField('ant', sense.ant);
      processField('see', sense.see);

      refsToUpdate.push({ id: sense.id, refs: refs.length > 0 ? JSON.stringify(refs) : null });
    }

    // 4. Batch update in a transaction
    const transaction = this.db.transaction((updates: typeof refsToUpdate) => {
      for (const u of updates) updateStmt.run(u.refs, u.id);
    });

    transaction(refsToUpdate);

    this.db.exec(`ALTER TABLE senses DROP COLUMN ant`);
    this.db.exec(`ALTER TABLE senses DROP COLUMN see`);
  }

  close() {
    this.setMeta('entry_count', this.getTableCount('entries').toString());
    this.setMeta('sense_count', this.getTableCount('senses').toString());

    this._postProcessRefs().then(() => {
      this.db.close();
    });
  }
}
