import Database from 'better-sqlite3';
import { deepEqual, equal } from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildRefIndex,
  resolveRefTarget,
} from '@/lib/database/postprocess/refs.js';
import type { RefTargetEntry } from '@/lib/database/postprocess/refs.js';
import { parseXRef } from '@/lib/parsers/JMdictParser/parse-xref.js';
import { Processor } from '@/lib/processor/index.js';
import type { Ref } from '@/lib/types/database-query.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kanjidicSample = path.resolve(
  __dirname,
  '../../data/kanjidic2-sample.xml',
);

describe('Cross-references', () => {
  describe('parseXRef', () => {
    it('splits keb, reb and sense number', () => {
      deepEqual(parseXRef('丸・まる・1'), {
        written: '丸',
        reading: 'まる',
        sense: 1,
      });
      deepEqual(parseXRef('丸・まる'), { written: '丸', reading: 'まる' });
      deepEqual(parseXRef('丸・1'), { written: '丸', sense: 1 });
      deepEqual(parseXRef('そこ・12'), { written: 'そこ', sense: 12 });
      deepEqual(parseXRef('まる'), { written: 'まる' });
    });
  });

  describe('resolveRefTarget', () => {
    const e = (
      kanji: string[],
      kana: string[],
      senseCount = 1,
      usuallyKana = false,
    ): RefTargetEntry => ({ kanji, kana, senseCount, usuallyKana });

    const index = buildRefIndex(
      new Map([
        [10, e(['丸', '円'], ['まる'], 2)],
        [20, e(['丸'], ['がん'])],
        [30, e(['其処'], ['そこ'], 3, true)],
        [40, e(['底'], ['そこ'], 4)],
        [50, e(['彼の'], ['あの'], 1, true)],
        [60, e([], ['あの'])],
        [70, e([], ['プレストレスト・コンクリート'])],
        [80, e([], ['ここ'])],
        [90, e([], ['ここ'])],
      ]),
    );

    const resolve = (text: string, from = 1) =>
      resolveRefTarget(parseXRef(text), from, index);

    it('uses the reading to pick between homographs', () => {
      equal(resolve('丸・まる・1'), 10);
      equal(resolve('丸・がん'), 20);
    });

    it('uses the sense number to rule out entries', () => {
      equal(resolve('そこ・4'), 40); // 其処 has only 3 senses
    });

    it('prefers usually-kana entries for kana refs', () => {
      equal(resolve('そこ'), 30); // 其処 (uk), not 底
    });

    it('skips the referring entry when another matches', () => {
      equal(resolve('ここ', 80), 90);
    });

    it('resolves targets that contain a centre dot', () => {
      equal(resolve('プレストレスト・コンクリート'), 70);
    });

    it('leaves ambiguous and unknown refs unresolved', () => {
      equal(resolve('丸'), undefined); // 丸【まる】 or 丸【がん】
      equal(resolve('あの'), undefined); // 彼の (uk) or kana-only あの
      equal(resolve('存在しない'), undefined);
    });
  });

  describe('generated database', () => {
    // Real JMdict entries whose refs pointed at the wrong homograph (#274)
    const xml = `<JMdict>
<entry><ent_seq>1000090</ent_seq><k_ele><keb>○</keb></k_ele><r_ele><reb>まる</reb></r_ele>
<sense><pos>&n;</pos><xref>丸・まる・1</xref><gloss>circle (sign)</gloss></sense></entry>
<entry><ent_seq>1000320</ent_seq><k_ele><keb>彼処</keb></k_ele><r_ele><reb>あそこ</reb></r_ele>
<sense><pos>&n;</pos><xref>そこ・1</xref><misc>&uk;</misc><gloss>there</gloss></sense></entry>
<entry><ent_seq>1006670</ent_seq><k_ele><keb>其処</keb></k_ele><r_ele><reb>そこ</reb></r_ele>
<sense><pos>&n;</pos><misc>&uk;</misc><gloss>there</gloss></sense>
<sense><pos>&n;</pos><misc>&uk;</misc><gloss>that point</gloss></sense></entry>
<entry><ent_seq>1216250</ent_seq><k_ele><keb>丸</keb></k_ele><r_ele><reb>まる</reb></r_ele>
<sense><pos>&n;</pos><gloss>circle</gloss></sense>
<sense><pos>&n;</pos><gloss>entirety</gloss></sense></entry>
<entry><ent_seq>1436050</ent_seq><k_ele><keb>底</keb></k_ele><r_ele><reb>そこ</reb></r_ele>
<sense><pos>&n;</pos><gloss>bottom</gloss></sense></entry>
<entry><ent_seq>2252570</ent_seq><k_ele><keb>丸</keb></k_ele><r_ele><reb>がん</reb></r_ele>
<sense><pos>&n;</pos><gloss>fishball</gloss></sense></entry>
</JMdict>`;

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jmdict-refs-'));
    const outputPath = path.join(tmp, 'refs.sqlite');

    before(async () => {
      const xmlPath = path.join(tmp, 'refs.xml');

      fs.writeFileSync(xmlPath, xml);

      await new Processor({
        jmdictXMLPath: xmlPath,
        kanjidicXMLPath: kanjidicSample,
        outputPath,
      }).process();
    });

    after(() => fs.rmSync(tmp, { recursive: true, force: true }));

    const refsOf = (entSeq: number) => {
      const db = new Database(outputPath, { readonly: true });
      const row = db
        .prepare('SELECT refs FROM senses WHERE ent_seq = ? AND sort_order = 1')
        .get(entSeq) as { refs: string | null };
      const senseId = (target: number, order: number) =>
        (
          db
            .prepare(
              'SELECT id FROM senses WHERE ent_seq = ? AND sort_order = ?',
            )
            .get(target, order) as { id: number }
        ).id;
      const result = {
        refs: row.refs ? (JSON.parse(row.refs) as Ref[]) : [],
        senseId,
      };

      return { ...result, close: () => db.close() };
    };

    it('links 丸・まる・1 to sense 1 of 丸【まる】 only', () => {
      const { refs, senseId, close } = refsOf(1000090);

      deepEqual(refs, [
        {
          type: 'see',
          ent_seq: 1216250,
          sense_id: senseId(1216250, 1),
          written: '丸',
        },
      ]);
      close();
    });

    it('links そこ・1 to 其処 (uk), not 底', () => {
      const { refs, senseId, close } = refsOf(1000320);

      deepEqual(refs, [
        {
          type: 'see',
          ent_seq: 1006670,
          sense_id: senseId(1006670, 1),
          written: 'そこ',
        },
      ]);
      close();
    });
  });
});
