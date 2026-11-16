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

// Minimums are roughly 90% of a full build from the 2026-11-15 data:
// entries 219,102 / senses 254,060 / kanji 13,108 /
// JLPT-tagged entries 7,730 / senses with cross-references 35,439.
const MIN_COUNTS: { label: string; sql: string; min: number }[] = [
  { label: 'entries', sql: 'SELECT COUNT(*) FROM entries', min: 195_000 },
  { label: 'senses', sql: 'SELECT COUNT(*) FROM senses', min: 225_000 },
  { label: 'kanji', sql: 'SELECT COUNT(*) FROM kanji', min: 12_000 },
  {
    // The JLPT post-process tags the matched reading of every entry it tags
    label: 'JLPT-tagged entries',
    sql: `SELECT COUNT(*) FROM entries WHERE kana LIKE '%"jlpt-n_"%'`,
    min: 6_900,
  },
  {
    label: 'senses with cross-references',
    sql: 'SELECT COUNT(*) FROM senses WHERE refs IS NOT NULL',
    min: 31_500,
  },
];

const dbPath = path.resolve(process.argv[2] ?? './data/jmdict.sqlite');
const db = new Database(dbPath, { readonly: true, fileMustExist: true });
const failures: string[] = [];

for (const { label, sql, min } of MIN_COUNTS) {
  const n = db.prepare(sql).pluck().get() as number;

  console.log(`${label}: ${n} (minimum ${min})`);

  if (n < min) failures.push(`${label}: ${n}, expected >= ${min}`);
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
