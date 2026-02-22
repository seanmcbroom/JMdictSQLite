import Database from 'better-sqlite3';
import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import type { Entry } from '@/lib/types/database-query.js';
import { outPath } from '@/test/helpers/db.js';

describe('Queries', () => {
  it('should find entries containing the gloss "house"', () => {
    const db = new Database(outPath);
    const rows = db
      .prepare(
        `
        SELECT e.ent_seq, e.kanji, e.kana, s.id AS id, s.glosses, s.pos, s.tags
        FROM entries e
        JOIN senses s ON e.ent_seq = s.ent_seq
        WHERE EXISTS (
          SELECT 1
          FROM json_each(s.glosses) AS g
          WHERE g.value LIKE '%house%'
        )
        ORDER BY e.ent_seq;
      `,
      )
      .all() as Entry[];

    equal(rows.length > 0, true, 'No entries found for gloss "house"');

    const first = rows[0];
    equal(typeof first.ent_seq, 'number');
    equal(typeof first.kana, 'string');
    if (first.kanji !== null) equal(typeof first.kanji, 'string');

    db.close();
  });
});
