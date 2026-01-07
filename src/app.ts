import path from 'node:path';

import { Processor } from '@/lib/processor/index.js';
import { downloadJMdict, downloadKanjidic } from '@/lib/util/download-edrdg-archive.js';

const jmdictPath = await downloadJMdict();
const kanjidicPath = await downloadKanjidic();

new Processor({
  jmdictXMLPath: path.resolve(jmdictPath),
  kanjidicXMLPath: path.resolve(kanjidicPath),
  outputPath: path.resolve('./data/jmdict.sqlite'),
}).process();
