import { deepEqual, equal, throws } from 'node:assert';
import { describe, it } from 'node:test';

import { parseJLPTCsv } from '@/lib/database/postprocess/jlpt.js';
import type { Entry, Written } from '@/lib/types/database-query.js';
import { openDb } from '@/test/helpers/db.js';

const HEADER = 'kanji,kana,level';

function getForms(entSeq: number) {
  const db = openDb();
  const row = db
    .prepare('SELECT kanji, kana FROM entries WHERE ent_seq = ?')
    .get(entSeq) as Entry;

  db.close();

  return {
    kanji: (row.kanji ? JSON.parse(row.kanji) : []) as Written[],
    kana: JSON.parse(row.kana) as Written[],
  };
}

const jlptTags = (form: Written | undefined) =>
  (form?.tags ?? []).filter(t => t.startsWith('jlpt-'));

describe('JLPT levels', () => {
  describe('parseJLPTCsv', () => {
    it('finds columns by header name', () => {
      deepEqual(
        [...parseJLPTCsv(`${HEADER}\n会う,あう,n5\n`)],
        [...parseJLPTCsv('level,kana,kanji\nn5,あう,会う\n')],
      );
    });

    it('treats an empty or repeated kanji column as kana-only', () => {
      deepEqual(
        [...parseJLPTCsv(`${HEADER}\nあっさり,あっさり,n1`)],
        [...parseJLPTCsv(`${HEADER}\n,あっさり,n1`)],
      );
    });

    it('handles CRLF line endings', () => {
      deepEqual(
        [...parseJLPTCsv(`${HEADER}\r\n会う,あう,n5\r\n`)],
        [...parseJLPTCsv(`${HEADER}\n会う,あう,n5\n`)],
      );
    });

    it('keeps the easiest level when a word is listed twice', () => {
      for (const csv of [
        `${HEADER}\n造る,つくる,n1\n造る,つくる,n2`,
        `${HEADER}\n造る,つくる,n2\n造る,つくる,n1`,
      ]) {
        deepEqual([...parseJLPTCsv(csv).values()], ['n2']);
      }
    });

    it('rejects a missing column or a malformed row', () => {
      throws(() => parseJLPTCsv('kanji,reading,level\n会う,あう,n5'));
      throws(() => parseJLPTCsv(`${HEADER}\n会う,あう,N6`));
    });
  });

  describe('tags in the generated database', () => {
    it('tags the matched reading and kanji of a kanji entry', () => {
      // 明白【あからさま】 is n1 in jlpt.csv
      const { kanji, kana } = getForms(1000225);

      deepEqual(jlptTags(kanji.find(k => k.written === '明白')), ['jlpt-n1']);
      deepEqual(jlptTags(kana.find(k => k.written === 'あからさま')), [
        'jlpt-n1',
      ]);
    });

    it('tags a kana-only entry', () => {
      const { kanji, kana } = getForms(1000360); // あっさり, n1

      equal(kanji.length, 0);
      deepEqual(jlptTags(kana[0]), ['jlpt-n1']);
    });

    it('tags the reading that matched, not the first one', () => {
      // Only the 4th reading, ええと, is in jlpt.csv (n2)
      const { kana } = getForms(1001150);

      deepEqual(jlptTags(kana.find(k => k.written === 'ええと')), ['jlpt-n2']);
      deepEqual(jlptTags(kana[0]), []);
    });
  });
});
