import fs from 'node:fs';
import path from 'node:path';

import { Processor } from '@/lib/processor/index.js';
import {
  downloadJMdict,
  downloadKanjidic,
} from '@/lib/util/download-edrdg-archive.js';
import { logger } from '@/lib/util/log.js';

const jmdictPath = await downloadJMdict();
const kanjidicPath = await downloadKanjidic();
const outputPath = path.resolve('./data/jmdict.sqlite');

if (fs.existsSync(outputPath)) {
  logger.error(
    `${outputPath} already exists. Please remove/rename it before running the processor again.`,
  );
  process.exit(1);
}

new Processor({
  jmdictXMLPath: path.resolve(jmdictPath),
  kanjidicXMLPath: path.resolve(kanjidicPath),
  outputPath,
}).process();
