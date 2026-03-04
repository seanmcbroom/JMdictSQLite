import type { Database as DatabaseType } from 'better-sqlite3';
import fs from 'node:fs';

import type { Entry, Written } from '@/lib/types/database-query.js';

type JLPTLevel = 'n1' | 'n2' | 'n3' | 'n4' | 'n5';

export async function postProcessJLPT(db: DatabaseType) {
  const raw = fs.readFileSync('./data/jlpt.csv', 'utf-8');
  const pairMap = new Map<string, JLPTLevel>();

  raw
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .forEach(line => {
      const [kana, kanji, level] = line.split(',');
      if (!kana || !kanji) return;

      pairMap.set(`${kana.trim()}|${kanji.trim()}`, level.trim() as JLPTLevel);
    });

  const entries = db
    .prepare(`SELECT ent_seq, kanji, kana FROM entries`)
    .all() as Entry[];

  const updateStmt = db.prepare(
    `UPDATE entries SET kanji = ?, kana = ? WHERE ent_seq = ?`,
  );

  const updates: {
    ent_seq: number;
    kanji: string | null;
    kana: string;
  }[] = [];

  for (const e of entries) {
    const kanjiArr: Written[] = e.kanji ? JSON.parse(e.kanji) : [];
    const kanaArr: Written[] = JSON.parse(e.kana);

    let level: JLPTLevel | undefined;

    for (const k of kanaArr) {
      for (const j of kanjiArr) {
        level = pairMap.get(`${k.written}|${j.written}`);

        if (level) break;
      }
    }

    if (!level) continue;

    const tag = `jlpt-${level}`;

    for (const w of [...kanjiArr, ...kanaArr]) {
      w.tags ??= [];
      if (!w.tags.includes(tag)) w.tags.push(tag);
    }

    updates.push({
      ent_seq: e.ent_seq,
      kanji: kanjiArr.length ? JSON.stringify(kanjiArr) : null,
      kana: JSON.stringify(kanaArr),
    });
  }

  const transaction = db.transaction((rows: typeof updates) => {
    rows.forEach(row => updateStmt.run(row.kanji, row.kana, row.ent_seq));
  });

  transaction(updates);

  console.log(`JLPT tags injected into ${updates.length} entries`);
}
