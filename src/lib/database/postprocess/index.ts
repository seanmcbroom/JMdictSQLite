import type { Database as DatabaseType } from 'better-sqlite3';

import { postProcessJLPT } from './jlpt.js';
import { postProcessRefs } from './refs.js';

// Each operation receives the DB and returns a Promise<void>
const postProcesses: ((db: DatabaseType) => Promise<void> | void)[] = [
  postProcessRefs,
  postProcessJLPT,
];

// Run all registered operations in order
export async function runPostProcesses(db: DatabaseType) {
  for (const op of postProcesses) {
    await op(db);
  }
}
