import Database from 'better-sqlite3';
import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import { outPath } from '@/test/helpers/db.js';

describe('Performance', () => {
  it('should handle rapid repeated queries', () => {
    const db = new Database(outPath);
    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      db.prepare(
        `
        SELECT *
        FROM entries e
        JOIN senses s ON e.ent_seq = s.ent_seq
        WHERE EXISTS (
          SELECT *
          FROM json_each(s.glosses) AS g
          WHERE g.value LIKE '%house%'
        )
      `,
      ).all();
    }

    const end = performance.now();
    const avg = (end - start) / iterations;

    console.log(`Average query time: ${avg.toFixed(2)}ms`);

    equal(avg < 50, true, `Average query time too long: ${avg.toFixed(2)}ms`);

    db.close();
  });
});
