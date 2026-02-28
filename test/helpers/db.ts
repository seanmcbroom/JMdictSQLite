import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const outPath = path.resolve(`${__dirname}/../data/jmdict-test.sqlite`);

export function openDb() {
  return new Database(outPath);
}
