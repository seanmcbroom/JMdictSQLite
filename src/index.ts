import path from 'path';

import { JmdictProcessor } from '@/app.js';

const xmlPath = path.resolve('./data/jmdict.xml');
const outPath = path.resolve('./data/jmdict.sqlite');
const jmdictProcessor = new JmdictProcessor(xmlPath, outPath);

jmdictProcessor.process();
