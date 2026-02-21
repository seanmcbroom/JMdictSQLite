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

    ['entries', 'senses', 'kanji', 'meta'].forEach(table =>
      equal(actualTables.has(table), true, `Table "${table}" not found`),
    );

    db.close();
  });
});
