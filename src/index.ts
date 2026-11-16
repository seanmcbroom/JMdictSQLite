import fs from 'node:fs';
import path from 'node:path';
import { inspect } from 'node:util';

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

try {
  await new Processor({
    jmdictXMLPath: path.resolve(jmdictPath),
    kanjidicXMLPath: path.resolve(kanjidicPath),
    outputPath,
  }).process();
} catch (err) {
  logger.error(`Build failed:\n${inspect(err)}`);
  process.exitCode = 1;
}
