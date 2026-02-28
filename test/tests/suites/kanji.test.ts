import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import type { Character } from '@/lib/types/database-query.js';
import { openDb } from '@/test/helpers/db.js';
import { validateJsonField } from '@/test/helpers/validation.js';

describe('Kanji Table', () => {
  it('should contain kanji characters', () => {
    const db = openDb();

    const row = db.prepare('SELECT * FROM kanji LIMIT 1').get() as Character;

    equal(typeof row.literal, 'string');

    validateJsonField('codepoint', row.codepoint, false);
    validateJsonField('radical', row.radical, false);
    validateJsonField('reading_meaning', row.reading_meaning, false);
    validateJsonField('dic_number', row.dic_number, false);
    validateJsonField('query_code', row.query_code, false);
    validateJsonField('misc', row.misc, false);

    db.close();
  });

  it('should support character lookup', () => {
    const db = openDb();

    const rows = db
      .prepare(
        `
        SELECT literal
        FROM kanji
        WHERE json_extract(misc, '$.stroke_count') = '5'
        `,
      )
      .all() as Character[];

    equal(Array.isArray(rows), true);
    equal(rows.length > 0, true);

    db.close();
  });
});
