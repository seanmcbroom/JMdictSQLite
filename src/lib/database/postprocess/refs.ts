import type { Database as DatabaseType } from 'better-sqlite3';

import { type RefQuery, type EntryQuery } from '@/lib/types/database-query.js';

export async function postProcessRefs(db: DatabaseType) {
  const updateStmt = db.prepare(`UPDATE senses SET refs = ? WHERE id = ?`);

  const allEntries = db
    .prepare(`SELECT ent_seq, kanji, kana FROM entries`)
    .all() as EntryQuery[];

  const entryMap = new Map<string, number>();

  for (const e of allEntries) {
    const kanjiArr = e.kanji
      ? (JSON.parse(e.kanji) as {
          written: string;
        }[])
      : [];
    const kanaArr = JSON.parse(e.kana) as {
      written: string;
    }[];

    for (const w of [...kanjiArr, ...kanaArr])
      entryMap.set(w.written, e.ent_seq);
  }

  const allSenses = db
    .prepare(`SELECT id, ent_seq, see, ant FROM senses ORDER BY ent_seq, id`)
    .all() as {
    id: number;
    ent_seq: number;
    see: string | null;
    ant: string | null;
  }[];

  const entrySensesMap = new Map<number, typeof allSenses>();

  for (const s of allSenses) {
    if (!entrySensesMap.has(s.ent_seq)) entrySensesMap.set(s.ent_seq, []);

    entrySensesMap.get(s.ent_seq)!.push(s);
  }

  const refsToUpdate: {
    id: number;
    refs: string | null;
  }[] = [];

  for (const sense of allSenses) {
    const refs: RefQuery[] = [];

    const processField = (field: 'see' | 'ant', jsonStr: string | null) => {
      if (!jsonStr) return;

      const arr = JSON.parse(jsonStr) as {
        written: string;
      }[];

      for (const obj of arr) {
        const ent_seq = entryMap.get(obj.written);

        if (ent_seq) {
          const targetSenses = entrySensesMap.get(ent_seq) || [];

          for (const ts of targetSenses) {
            refs.push({
              type: field,
              ent_seq,
              sense_id: ts.id,
              written: obj.written,
            });
          }
        }
      }
    };

    processField('ant', sense.ant);
    processField('see', sense.see);

    refsToUpdate.push({
      id: sense.id,
      refs: refs.length > 0 ? JSON.stringify(refs) : null,
    });
  }

  const transaction = db.transaction((updates: typeof refsToUpdate) => {
    for (const u of updates) updateStmt.run(u.refs, u.id);
  });

  transaction(refsToUpdate);

  db.exec(`ALTER TABLE senses DROP COLUMN ant`);
  db.exec(`ALTER TABLE senses DROP COLUMN see`);
}
