import { equal, ok } from 'node:assert';
import { Readable } from 'node:stream';
import { describe, it } from 'node:test';

import type { Sense } from '@/lib/types/database-query.js';
import { EntityReplace } from '@/lib/util/EntityReplace.js';
import { openDb } from '@/test/helpers/db.js';

async function replace(chunks: string[]): Promise<string> {
  let out = '';

  for await (const c of Readable.from(chunks).pipe(new EntityReplace())) {
    out += c.toString();
  }

  return out;
}

describe('XML entities', () => {
  describe('EntityReplace', () => {
    it('replaces JMdict DTD entities with their code', async () => {
      equal(
        await replace(['<pos>&v5k-s;</pos><misc>&uk;</misc>']),
        '<pos>v5k-s</pos><misc>uk</misc>',
      );
    });

    it('leaves predefined XML entities and character references', async () => {
      const xml =
        '<gloss>S&amp;M &lt;b&gt; &quot;q&quot; &apos;a&apos; &#x41;</gloss>';

      equal(await replace([xml]), xml);
    });

    it('handles entities split across chunks', async () => {
      equal(
        await replace(['<pos>&v5', 'k-s;</pos><gloss>S&am', 'p;M</gloss>']),
        '<pos>v5k-s</pos><gloss>S&amp;M</gloss>',
      );
    });
  });

  describe('generated database', () => {
    it('keeps "&" in glosses', () => {
      // test/data/jmdict-sample.xml: <gloss>S&amp;M</gloss>
      const db = openDb();
      const rows = db
        .prepare('SELECT glosses FROM senses WHERE ent_seq = ?')
        .all(1028530) as Sense[];

      db.close();

      const glosses = rows.flatMap(r => JSON.parse(r.glosses) as string[]);

      ok(glosses.includes('S&M'), `expected "S&M" in ${glosses.join(', ')}`);
      ok(!glosses.includes('SampM'));
    });
  });
});
