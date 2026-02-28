import Database from 'better-sqlite3';
import type { Database as DatabaseType, Statement } from 'better-sqlite3';

import { runPostProcesses } from '@/lib/database/postprocess/index.js';
import { CREATE_TABLES_SQL } from '@/lib/database/schema.js';
import {
  INSERT_ENTRY_SQL,
  INSERT_SENSE_SQL,
  INSERT_KANJI_SQL,
} from '@/lib/database/statements.js';
import type { Character, Entry, Sense } from '@/lib/types/database.js';

export class JMDictSQLiteDatabase {
  db: DatabaseType;
  insertEntryStmt!: Statement;
  insertSenseStmt!: Statement;
  insertKanjiStmt!: Statement;

  constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma('foreign_keys = ON');
    this.db.exec(CREATE_TABLES_SQL);

    this._setMeta('version', process.env.npm_package_version ?? 'unknown');
    this._setMeta('language', 'en');
    this._setMeta('license', 'GPLv2');

    this.insertEntryStmt = this.db.prepare(INSERT_ENTRY_SQL);
    this.insertSenseStmt = this.db.prepare(INSERT_SENSE_SQL);
    this.insertKanjiStmt = this.db.prepare(INSERT_KANJI_SQL);
  }

  _setMeta(key: string, value: string) {
    const stmt = this.db.prepare(`
      INSERT INTO meta (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `);

    stmt.run(key, value);
  }

  insertEntry(entry: Entry) {
    this.insertEntryStmt.run(
      entry.ent_seq,
      entry.kanji?.length ? JSON.stringify(entry.kanji) : null,
      JSON.stringify(entry.kana),
    );

    for (const sense of entry.senses ?? []) {
      sense.ent_seq = entry.ent_seq;
      this.insertSense(sense);
    }
  }

  insertEntries(entries: Entry[]) {
    const insertMany = this.db.transaction((entries: Entry[]) => {
      for (const entry of entries) this.insertEntry(entry);
    });

    insertMany(entries);
  }

  insertSense(sense: Sense) {
    this.insertSenseStmt.run(
      sense.ent_seq,
      sense.sort_order,
      sense.lang,
      sense.note,
      JSON.stringify(sense.glosses),
      JSON.stringify(sense.pos),
      sense.fields?.length ? JSON.stringify(sense.fields) : null,
      sense.tags?.length ? JSON.stringify(sense.tags) : null,
      sense.ant?.length ? JSON.stringify(sense.ant) : null,
      sense.see?.length ? JSON.stringify(sense.see) : null,
    );
  }

  insertKanji(character: Character) {
    this.insertKanjiStmt.run(
      character.literal,
      JSON.stringify(character.codepoint),
      JSON.stringify(character.radical),
      JSON.stringify(character.reading_meaning),
      character.dic_number ? JSON.stringify(character.dic_number) : null,
      character.query_code ? JSON.stringify(character.query_code) : null,
      character.misc ? JSON.stringify(character.misc) : null,
    );
  }

  insertManyKanji(characters: Character[]) {
    const insertMany = this.db.transaction((chars: Character[]) => {
      for (const char of chars) {
        this.insertKanji(char);
      }
    });

    insertMany(characters);
  }

  async close() {
    await runPostProcesses(this.db);

    this.db.close();
  }
}
