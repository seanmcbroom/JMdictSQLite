import path from 'path';

import { JmdictProcessor } from '@/lib/processor/index.js';

const xmlPath = path.resolve('./data/jmdict.xml');
const outPath = path.resolve('./data/jmdict.sqlite');
const jmdictProcessor = new JmdictProcessor(xmlPath, outPath);

jmdictProcessor.process();
