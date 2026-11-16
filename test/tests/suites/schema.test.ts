import { equal } from 'node:assert';
import fs from 'node:fs/promises';
import { describe, it } from 'node:test';

import { openDb, outPath } from '@/test/helpers/db.js';

describe('Database Schema & File', () => {
  it('should generate an output SQLite file', async () => {
    let exists = true;
    try {
      await fs.access(outPath);
    } catch {
      exists = false;
    }
    equal(exists, true, 'Output file does not exist');
  });

  it('should create a non-empty SQLite file', async () => {
    const stat = await fs.stat(outPath);
    equal(stat.size > 0, true, 'Output file is empty');
  });

  it('should create expected tables in the SQLite database', () => {
    const db = openDb();
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    const actualTables = new Set(rows.map(row => row.name));

    const expected = ['entries', 'senses', 'kanji', 'meta'];

    expected.forEach(table =>
      equal(actualTables.has(table), true, `Table "${table}" not found`),
    );

    db.close();
  });

  it('should include query planner statistics (ANALYZE)', () => {
    const db = openDb();
    const stats = db
      .prepare("SELECT tbl FROM sqlite_stat1 WHERE tbl = 'senses'")
      .all();

    equal(stats.length > 0, true, 'sqlite_stat1 has no rows for senses');

    db.close();
  });

  it('should not have a redundant index on kanji.literal', () => {
    const db = openDb();
    const indexes = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'kanji'",
      )
      .all() as { name: string }[];

    // Only the PRIMARY KEY's own index
    equal(indexes.length, 1, indexes.map(i => i.name).join(', '));

    db.close();
  });
});
