import type { Database as DatabaseType } from 'better-sqlite3';

import type { Entry, Ref, Written } from '@/lib/types/database-query.js';
import type { Ref as ParsedRef } from '@/lib/types/database.js';
import { logger } from '@/lib/util/log.js';

/** What the resolver needs to know about a candidate target entry. */
export interface RefTargetEntry {
  kanji: string[];
  kana: string[];
  senseCount: number;
  /** The first sense is tagged `uk` (usually written using kana alone). */
  usuallyKana: boolean;
}

export interface RefIndex {
  entries: Map<number, RefTargetEntry>;
  /** Written form (kanji or kana) → ent_seqs of entries that have it */
  byForm: Map<string, number[]>;
}

const KANA_ONLY = /^[぀-ヿ〜]+$/u;

export function buildRefIndex(entries: Map<number, RefTargetEntry>): RefIndex {
  const byForm = new Map<string, number[]>();

  for (const [entSeq, entry] of entries) {
    for (const form of new Set([...entry.kanji, ...entry.kana])) {
      const list = byForm.get(form);

      if (list) list.push(entSeq);
      else byForm.set(form, [entSeq]);
    }
  }

  return { entries, byForm };
}

/** Keeps the items matching `pred`, unless none do. */
function preferIf<T>(items: T[], pred: (item: T) => boolean): T[] {
  const kept = items.filter(pred);

  return kept.length > 0 ? kept : items;
}

/**
 * Resolves a cross-reference to a single target entry.
 *
 * Candidates are entries with `written` as a kanji or kana form (and,
 * for `keb・reb`, that exact keb and reb), narrowed in order by:
 * 1. having at least `sense` senses, when a sense number is given;
 * 2. not being the referring entry, if anything else is left;
 * 3. for kana refs, being kana-only or usually written in kana (`uk`);
 * 4. having `written` as its first kanji or first reading.
 * Steps 2–4 never discard every candidate.
 *
 * @returns The target ent_seq, or undefined if no single entry remains.
 */
export function resolveRefTarget(
  ref: ParsedRef,
  sourceEntSeq: number,
  index: RefIndex,
): number | undefined {
  const entry = (entSeq: number) => index.entries.get(entSeq)!;

  const lookup = (written: string, reading?: string) => {
    const found = index.byForm.get(written) ?? [];

    if (reading === undefined) return found;

    return found.filter(
      s => entry(s).kanji.includes(written) && entry(s).kana.includes(reading),
    );
  };

  let candidates = lookup(ref.written, ref.reading);

  // A target containing a centre dot (プレストレスト・コンクリート)
  // parses as written・reading; retry it as a single form.
  if (candidates.length === 0 && ref.reading !== undefined) {
    candidates = lookup(`${ref.written}・${ref.reading}`);
  }

  const { sense } = ref;

  if (sense !== undefined) {
    candidates = candidates.filter(s => entry(s).senseCount >= sense);
  }

  candidates = preferIf(candidates, s => s !== sourceEntSeq);

  if (KANA_ONLY.test(ref.written)) {
    candidates = preferIf(
      candidates,
      s => entry(s).kanji.length === 0 || entry(s).usuallyKana,
    );
  }

  candidates = preferIf(
    candidates,
    s => entry(s).kanji[0] === ref.written || entry(s).kana[0] === ref.written,
  );

  return candidates.length === 1 ? candidates[0] : undefined;
}

export async function postProcessRefs(db: DatabaseType) {
  const senses = db
    .prepare(
      `SELECT id, ent_seq, tags, see, ant FROM senses ORDER BY ent_seq, sort_order`,
    )
    .all() as {
    id: number;
    ent_seq: number;
    tags: string | null;
    see: string | null;
    ant: string | null;
  }[];

  const sensesByEntry = new Map<number, typeof senses>();

  for (const s of senses) {
    const list = sensesByEntry.get(s.ent_seq);

    if (list) list.push(s);
    else sensesByEntry.set(s.ent_seq, [s]);
  }

  const entries = new Map<number, RefTargetEntry>();

  for (const e of db
    .prepare(`SELECT ent_seq, kanji, kana FROM entries`)
    .all() as Entry[]) {
    const entrySenses = sensesByEntry.get(e.ent_seq) ?? [];
    const firstTags = entrySenses[0]?.tags
      ? (JSON.parse(entrySenses[0].tags) as string[])
      : [];

    entries.set(e.ent_seq, {
      kanji: e.kanji
        ? (JSON.parse(e.kanji) as Written[]).map(w => w.written)
        : [],
      kana: (JSON.parse(e.kana) as Written[]).map(w => w.written),
      senseCount: entrySenses.length,
      usuallyKana: firstTags.includes('uk'),
    });
  }

  const index = buildRefIndex(entries);

  let resolved = 0;
  let unresolved = 0;

  const updates: { id: number; refs: string | null }[] = [];

  for (const sense of senses) {
    if (!sense.see && !sense.ant) continue;

    const refs: Ref[] = [];

    const addRefs = (type: Ref['type'], json: string | null) => {
      if (!json) return;

      for (const ref of JSON.parse(json) as ParsedRef[]) {
        const target = resolveRefTarget(ref, sense.ent_seq, index);

        if (target === undefined) {
          unresolved++;
          continue;
        }

        resolved++;

        const targetSenses = sensesByEntry.get(target) ?? [];
        const linked =
          ref.sense !== undefined
            ? targetSenses.slice(ref.sense - 1, ref.sense)
            : targetSenses;

        for (const ts of linked) {
          refs.push({
            type,
            ent_seq: target,
            sense_id: ts.id,
            written: ref.written,
          });
        }
      }
    };

    addRefs('ant', sense.ant);
    addRefs('see', sense.see);

    updates.push({
      id: sense.id,
      refs: refs.length > 0 ? JSON.stringify(refs) : null,
    });
  }

  const updateStmt = db.prepare(`UPDATE senses SET refs = ? WHERE id = ?`);

  const transaction = db.transaction((rows: typeof updates) => {
    for (const u of rows) updateStmt.run(u.refs, u.id);
  });

  transaction(updates);

  db.exec(`ALTER TABLE senses DROP COLUMN ant`);
  db.exec(`ALTER TABLE senses DROP COLUMN see`);

  logger.gray(
    `Cross-references: ${resolved} resolved, ${unresolved} left unresolved`,
  );
}
