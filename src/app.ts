import path from 'node:path';

import { Processor } from '@/lib/processor/index.js';
import { downloadJMdict, downloadKanjidic } from '@/lib/util/download-edrdg-archive.js';

const jmdictPath = await downloadJMdict();
const kanjidicPath = await downloadKanjidic();

const jmdictXMLPath = path.resolve(jmdictPath);
const kanjidicXMLPath = path.resolve(kanjidicPath);

const outPath = path.resolve('./data/jmdict.sqlite');

new Processor(jmdictXMLPath, kanjidicXMLPath, outPath).process();
