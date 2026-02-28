import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import { openDb } from '@/test/helpers/db.js';

describe('Relationship Integrity', () => {
  it('should maintain entry → sense relationship', () => {
    const db = openDb();

    const badRows = db
      .prepare(
        `
      SELECT s.*
      FROM senses s
      LEFT JOIN entries e ON s.ent_seq = e.ent_seq
      WHERE e.ent_seq IS NULL
    `,
      )
      .all();

    equal(badRows.length, 0);

    db.close();
  });
});
