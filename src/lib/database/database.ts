import Database from 'better-sqlite3';
import type { Database as DatabaseType, Statement } from 'better-sqlite3';

import { runPostProcesses } from '@/lib/database/postprocess/index.js';
import { CREATE_TABLES_SQL } from '@/lib/database/schema.js';
import { INSERT_ENTRY_SQL, INSERT_SENSE_SQL } from '@/lib/database/statements.js';
import type { Entry, Sense } from '@/lib/types/database';

export class JMdictDatabase {
  db: DatabaseType;
  insertEntryStmt!: Statement;
  insertSenseStmt!: Statement;

  constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma('foreign_keys = ON');
    this.db.exec(CREATE_TABLES_SQL);

    this.insertEntryStmt = this.db.prepare(INSERT_ENTRY_SQL);
    this.insertSenseStmt = this.db.prepare(INSERT_SENSE_SQL);
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
      sense.lang,
      sense.note,
      JSON.stringify(sense.glosses),
      JSON.stringify(sense.pos),
      sense.verb_data?.verb_group ? JSON.stringify(sense.verb_data) : null,
      sense.fields?.length ? JSON.stringify(sense.fields) : null,
      sense.tags?.length ? JSON.stringify(sense.tags) : null,
      sense.ant?.length ? JSON.stringify(sense.ant) : null,
      sense.see?.length ? JSON.stringify(sense.see) : null,
    );
  }

  async close() {
    await runPostProcesses(this.db);

    this.db.close();
  }
}
