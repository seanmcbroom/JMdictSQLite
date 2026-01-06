import { equal } from 'assert';
import Database from 'better-sqlite3';
import fs from 'fs/promises';
import { describe, it, before } from 'node:test';
import path from 'path';
import { fileURLToPath } from 'url';

import { Processor } from '@/lib/processor/index.js';
import type { EntryQuery, SenseQuery } from '@/lib/types/database-query.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const xmlPath = path.resolve(`${__dirname}/data/jmdict-sample.xml`);
const outPath = path.resolve(`${__dirname}/data/jmdict-test.sqlite`);

type EntryOnlySearchResult = Pick<EntryQuery, 'ent_seq' | 'kanji' | 'kana'>;
type GlossSearchResult = EntryQuery & Pick<SenseQuery, 'id' | 'glosses' | 'pos' | 'tags'>;

function validateJsonField(
  fieldName: string,
  jsonStr: string | null | undefined,
  expectArray = true,
) {
  if (jsonStr === null || jsonStr === undefined) return;

  try {
    const parsed = JSON.parse(jsonStr);

    if (expectArray) {
      equal(Array.isArray(parsed), true, `${fieldName} should be an array`);
    } else {
      equal(typeof parsed, 'object', `${fieldName} should be an object`);
    }
  } catch (e) {
    console.error(`Invalid JSON in ${fieldName}:`, e);
    throw new Error(`Invalid JSON in ${fieldName}`);
  }
}

describe('JMDict Processor Suite', () => {
  before(async () => {
    const jmdictProcessor = new Processor(xmlPath, '', outPath);

    await jmdictProcessor.process();
  });

  it('should execute a basic truthy test', () => {
    // Arrange
    const actual = true;

    // Assert
    equal(actual, true);
  });

  it('should generate an output SQLite file', async () => {
    // Act
    let exists = true;

    try {
      await fs.access(outPath);
    } catch {
      exists = false;
    }

    // Assert
    equal(exists, true, 'Output file does not exist');
  });

  it('should create a non-empty SQLite file', async () => {
    // Act
    const stat = await fs.stat(outPath);

    // Assert
    equal(stat.size > 0, true, 'Output file is empty');
  });

  it('should create expected tables in the SQLite database', () => {
    // Arrange
    const expectedTables = ['entries', 'senses'];
    const db = new Database(outPath);

    // Act
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
      name: string;
    }[];
    const actualTables = rows.map(row => row.name);

    db.close();

    // Assert
    for (const table of expectedTables) {
      equal(actualTables.includes(table), true, `Table "${table}" not found`);
    }
  });

  it('should contain entries with expected structure', () => {
    // Assert
    const db = new Database(outPath);
    const row = db.prepare('SELECT * FROM entries LIMIT 1').get() as EntryQuery;

    equal(typeof row.ent_seq, 'number', 'ent_seq should be a number');
    equal(typeof row.kana, 'string', 'kana should be a string');

    if (row.kanji !== null) {
      equal(typeof row.kanji, 'string', 'kanji should be a string if defined');
    }

    db.close();
  });

  it('should contain senses with expected structure', () => {
    const db = new Database(outPath);
    const row = db.prepare('SELECT * FROM senses LIMIT 1').get() as SenseQuery;

    equal(typeof row.id, 'number', 'id should be a number');
    equal(typeof row.ent_seq, 'number', 'ent_seq should be a number');
    equal(typeof row.glosses, 'string', 'glosses should be a JSON-encoded string');
    equal(typeof row.pos, 'string', 'pos should be a JSON-encoded string');

    db.close();
  });

  it('should have valid JSON in senses fields', () => {
    const db = new Database(outPath);
    const row = db.prepare('SELECT * FROM senses LIMIT 1').get() as SenseQuery;

    validateJsonField('glosses', row.glosses);
    validateJsonField('pos', row.pos);
    validateJsonField('verb_data', row.verb_data, false);
    validateJsonField('fields', row.fields);
    validateJsonField('tags', row.tags);
    validateJsonField('refs', row.ref, false);

    db.close();
  });

  it('should have valid JSON in entry fields', () => {
    const db = new Database(outPath);
    const row = db
      .prepare('SELECT kana, kanji FROM entries LIMIT 1')
      .get() as EntryOnlySearchResult;

    validateJsonField('kana', row.kana, true);
    validateJsonField('kanji', row.kanji, true);

    db.close();
  });

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
      .all() as GlossSearchResult[];

    // Assert that at least one result exists
    equal(rows.length > 0, true, 'No entries found for gloss "house"');

    // Optional: validate structure of the first result
    const first = rows[0];

    equal(typeof first.ent_seq, 'number', 'ent_seq should be a number');
    equal(typeof first.kana, 'string', 'kana should be a string');

    if (first.kanji !== null) {
      equal(typeof first.kanji, 'string', 'kanji should be a string if defined');
    }

    db.close();
  });

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
    const duration = end - start;
    const avgTime = duration / iterations;

    console.log(
      `Ran ${iterations} queries in ${duration.toFixed(2)} ms (avg ${avgTime.toFixed(2)} ms per query)`,
    );

    // Each query should be reasonably fast (<50ms avg)
    equal(avgTime < 50, true, `Average query time too long: ${avgTime.toFixed(2)}ms`);

    db.close();
  });
});
