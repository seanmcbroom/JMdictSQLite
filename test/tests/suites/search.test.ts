import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import { openDb } from '@/test/helpers/db.js';

describe('Search Pipeline', () => {
  it('should find gloss "house"', () => {
    const db = openDb();

    const rows = db
      .prepare(
        `
      SELECT 1
      FROM entries e
      JOIN senses s ON e.ent_seq = s.ent_seq
      WHERE EXISTS (
        SELECT 1
        FROM json_each(s.glosses)
        WHERE value LIKE '%house%'
      )
    `,
      )
      .all();

    equal(rows.length > 0, true);

    db.close();
  });
});
