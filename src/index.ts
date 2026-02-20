import { promises as fs } from 'node:fs';
import path from 'node:path';

import { Processor } from '@/lib/processor/index.js';
import {
  downloadJMdict,
  downloadKanjidic,
} from '@/lib/util/download-edrdg-archive.js';

const jmdictPath = await downloadJMdict();
const kanjidicPath = await downloadKanjidic();

let outputPath = path.resolve('./data/jmdict.sqlite');

try {
  await fs.access(outputPath);
} catch {
  outputPath = path.resolve(`./data/jmdict-${Date.now()}.sqlite`);
}

new Processor({
  jmdictXMLPath: path.resolve(jmdictPath),
  kanjidicXMLPath: path.resolve(kanjidicPath),
  outputPath: outputPath,
}).process();
