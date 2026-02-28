import path from 'node:path';
import { before } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Processor } from '@/lib/processor/index.js';
import {
  downloadJMdict,
  downloadKanjidic,
} from '@/lib/util/download-edrdg-archive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let jmdictPath: string;
let kanjidicPath: string;

if (process.env.NODE_ENV === 'deploy') {
  const dataDir = path.resolve(__dirname, '../data');
  jmdictPath = await downloadJMdict(dataDir);
  kanjidicPath = await downloadKanjidic(dataDir);
} else {
  jmdictPath = path.resolve(__dirname, '../data/jmdict-sample.xml');
  kanjidicPath = path.resolve(__dirname, '../data/kanjidic2-sample.xml');
}

before(async () => {
  const processor = new Processor({
    jmdictXMLPath: path.resolve(jmdictPath),
    kanjidicXMLPath: path.resolve(kanjidicPath),
    outputPath: path.resolve(__dirname, '../data/jmdict-test.sqlite'),
  });

  await processor.process();
  console.log('Processing complete');
});
