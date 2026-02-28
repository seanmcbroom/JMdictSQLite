import fs from 'node:fs';
import path from 'node:path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function collectTestFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const testFiles = [
    path.join(__dirname, '/tests/bootstrap.test.js'),
    ...collectTestFiles(path.join(__dirname, '/tests/suites')),
  ];

  const testStream = run({
    files: testFiles,
    concurrency: false,
  });

  let failed = 0;

  testStream.on('test:fail', () => {
    failed++;
  });

  testStream.compose(spec()).pipe(process.stdout);

  await new Promise(resolve => {
    testStream.on('end', resolve);
  });

  if (failed > 0) {
    process.exit(1);
  }
}

await main();
