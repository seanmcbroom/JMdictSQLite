/**
 * Sanity-checks a generated jmdict.sqlite before it is signed and released.
 *
 * Usage: node dist/scripts/verify-db.js [path/to/jmdict.sqlite]
 *
 * Exits non-zero if a table is suspiciously small (e.g. a parse stopped
 * early) or required metadata is missing.
 */
import Database from 'better-sqlite3';
import path from 'node:path';

// Roughly 90% of the counts seen on 2026-11-15
// (entries 219,102 / senses 254,060 / kanji 13,108).
const MIN_ROWS = {
  entries: 195_000,
  senses: 225_000,
  kanji: 12_000,
} as const;

const dbPath = path.resolve(process.argv[2] ?? './data/jmdict.sqlite');
const db = new Database(dbPath, { readonly: true, fileMustExist: true });
const failures: string[] = [];

for (const [table, min] of Object.entries(MIN_ROWS)) {
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as {
    n: number;
  };

  console.log(`${table}: ${n} rows (minimum ${min})`);

  if (n < min) failures.push(`${table} has ${n} rows, expected >= ${min}`);
}

const version = db
  .prepare(`SELECT value FROM meta WHERE key = 'version'`)
  .get() as { value: string } | undefined;

if (!version || version.value === 'unknown') {
  failures.push('meta.version is missing or unknown');
}

db.close();

if (failures.length > 0) {
  console.error(`Sanity check failed for ${dbPath}:`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`Sanity check passed for ${dbPath}`);
