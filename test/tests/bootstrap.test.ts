import path from 'node:path';
import { before } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Processor } from '@/lib/processor/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

before(async () => {
  const processor = new Processor({
    jmdictXMLPath: path.resolve(__dirname, '../data/jmdict-sample.xml'),
    kanjidicXMLPath: path.resolve(__dirname, '../data/kanjidic2-sample.xml'),
    outputPath: path.resolve(__dirname, '../data/jmdict-test.sqlite'),
  });

  await processor.process();
});
