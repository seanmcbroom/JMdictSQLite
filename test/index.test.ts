import { equal } from 'assert';
import Database from 'better-sqlite3';
import fs from 'fs/promises';
import { describe, it, before } from 'node:test';
import path from 'path';
import { fileURLToPath } from 'url';

import { JmdictProcessor } from '@/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const xmlPath = path.resolve(`${__dirname}/data/jmdict-sample.xml`);
const outPath = path.resolve(`${__dirname}/data/jmdict-test.sqlite`);

describe('JMDict Processor Suite', () => {
  before(async () => {
    const jmdictProcessor = new JmdictProcessor(xmlPath, outPath);

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
});
