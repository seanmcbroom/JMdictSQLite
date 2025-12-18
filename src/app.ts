import path from 'node:path';

import { JMdictProcessor } from '@/lib/processor/index.js';
import { downloadJMdict } from '@/lib/util/download-edrdg-archive.js';

const jmdictPath = await downloadJMdict();

const xmlPath = path.resolve(jmdictPath);
const outPath = path.resolve('./data/jmdict.sqlite');

new JMdictProcessor(xmlPath, outPath).process();
