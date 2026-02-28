import Database from 'better-sqlite3';
import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import type { Sense } from '@/lib/types/database-query.js';
import { outPath } from '@/test/helpers/db.js';
import { validateJsonField } from '@/test/helpers/validation.js';

describe('Senses Table', () => {
  it('should contain senses with expected structure', () => {
    const db = new Database(outPath);
    const row = db.prepare('SELECT * FROM senses LIMIT 1').get() as Sense;

    equal(typeof row.id, 'number');
    equal(typeof row.ent_seq, 'number');
    equal(typeof row.glosses, 'string');
    equal(typeof row.pos, 'string');

    db.close();
  });

  it('should have valid JSON in senses fields', () => {
    const db = new Database(outPath);
    const row = db.prepare('SELECT * FROM senses LIMIT 1').get() as Sense;

    validateJsonField('glosses', row.glosses);
    validateJsonField('pos', row.pos);
    validateJsonField('fields', row.fields);
    validateJsonField('tags', row.tags);
    validateJsonField('refs', row.refs);

    db.close();
  });
});
