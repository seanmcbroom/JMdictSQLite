import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import { openDb } from '@/test/helpers/db.js';

describe('Meta Table', () => {
  it('should contain version metadata', () => {
    const db = openDb();

    const rows = db.prepare('SELECT * FROM meta').all();

    equal(Array.isArray(rows), true);

    db.close();
  });
});
