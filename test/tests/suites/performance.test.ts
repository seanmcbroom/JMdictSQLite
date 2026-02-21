import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import { openDb } from '@/test/helpers/db.js';

describe('Query Performance Guard', () => {
  it('should keep repeated query latency reasonable', () => {
    const db = openDb();

    const iterations = 100;

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      db.prepare(
        `
        SELECT ent_seq
        FROM entries
        LIMIT 50
      `,
      ).all();
    }

    const avg = (performance.now() - start) / iterations;

    equal(avg < 50, true);

    db.close();
  });
});
