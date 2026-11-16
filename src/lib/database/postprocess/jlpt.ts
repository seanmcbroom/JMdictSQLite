import type { Database as DatabaseType } from 'better-sqlite3';
import fs from 'node:fs';

import type { Entry, Written } from '@/lib/types/database-query.js';
import { logger } from '@/lib/util/log.js';

export type JLPTLevel = 'n1' | 'n2' | 'n3' | 'n4' | 'n5';

const JLPT_LEVEL = /^n[1-5]$/;

/** Lookup key for a (kana, kanji) pair. `kanji` is '' for kana-only words. */
const pairKey = (kana: string, kanji: string) => `${kana}\t${kanji}`;

/**
 * Parses jlpt.csv into a (kana, kanji) → level map.
 *
 * - Columns are found by header name (`kanji`, `kana`, `level`), so their
 *   order in the file doesn't matter.
 * - Kana-only words may leave the kanji column empty or repeat the kana.
 * - A pair listed at several levels keeps the easiest one (highest N).
 *
 * @throws If the header is missing a column or a row is malformed.
 */
export function parseJLPTCsv(raw: string): Map<string, JLPTLevel> {
  const [header = '', ...lines] = raw.split(/\r?\n/);
  const columns = header.split(',').map(c => c.trim().toLowerCase());
  const kanjiCol = columns.indexOf('kanji');
  const kanaCol = columns.indexOf('kana');
  const levelCol = columns.indexOf('level');

  if (kanjiCol < 0 || kanaCol < 0 || levelCol < 0) {
    throw new Error(
      `jlpt.csv header must have kanji, kana and level columns, got "${header}"`,
    );
  }

  const levels = new Map<string, JLPTLevel>();

  lines.forEach((line, i) => {
    if (!line.trim()) return;

    const fields = line.split(',').map(f => f.trim());
    const kana = fields[kanaCol] ?? '';
    const kanjiField = fields[kanjiCol] ?? '';
    const kanji = kanjiField === kana ? '' : kanjiField;
    const level = fields[levelCol] ?? '';

    if (!kana || !JLPT_LEVEL.test(level)) {
      throw new Error(`jlpt.csv line ${i + 2} is malformed: "${line}"`);
    }

    const key = pairKey(kana, kanji);
    const existing = levels.get(key);

    if (!existing || level > existing) levels.set(key, level as JLPTLevel);
  });

  return levels;
}

/**
 * Finds an entry's JLPT level and the forms it matched on.
 *
 * Entries with kanji match on a (reading, kanji) pair; kana-only entries
 * match on a reading alone.
 */
function findLevel(
  levels: Map<string, JLPTLevel>,
  kanji: Written[],
  kana: Written[],
): { level: JLPTLevel; forms: Written[] } | undefined {
  if (kanji.length > 0) {
    for (const reading of kana) {
      for (const written of kanji) {
        const level = levels.get(pairKey(reading.written, written.written));

        if (level) return { level, forms: [reading, written] };
      }
    }

    return undefined;
  }

  for (const reading of kana) {
    const level = levels.get(pairKey(reading.written, ''));

    if (level) return { level, forms: [reading] };
  }

  return undefined;
}

export async function postProcessJLPT(db: DatabaseType) {
  const levels = parseJLPTCsv(fs.readFileSync('./data/jlpt.csv', 'utf-8'));

  const entries = db
    .prepare(`SELECT ent_seq, kanji, kana FROM entries`)
    .all() as Entry[];

  const updates: {
    ent_seq: number;
    kanji: string | null;
    kana: string;
  }[] = [];

  for (const e of entries) {
    const kanjiArr: Written[] = e.kanji ? JSON.parse(e.kanji) : [];
    const kanaArr: Written[] = JSON.parse(e.kana);

    const match = findLevel(levels, kanjiArr, kanaArr);

    if (!match) continue;

    const tag = `jlpt-${match.level}`;

    for (const form of match.forms) {
      form.tags ??= [];

      if (!form.tags.includes(tag)) form.tags.push(tag);
    }

    updates.push({
      ent_seq: e.ent_seq,
      kanji: kanjiArr.length ? JSON.stringify(kanjiArr) : null,
      kana: JSON.stringify(kanaArr),
    });
  }

  const updateStmt = db.prepare(
    `UPDATE entries SET kanji = ?, kana = ? WHERE ent_seq = ?`,
  );

  const transaction = db.transaction((rows: typeof updates) => {
    rows.forEach(row => updateStmt.run(row.kanji, row.kana, row.ent_seq));
  });

  transaction(updates);

  logger.gray(`JLPT tags injected into ${updates.length} entries`);

  // Guard against another silent format mismatch (see #271).
  if (levels.size > 0 && entries.length > 0 && updates.length === 0) {
    throw new Error(
      `jlpt.csv has ${levels.size} words but none matched an entry; ` +
        'has the CSV format changed?',
    );
  }
}
