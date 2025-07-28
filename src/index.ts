import path from 'path';

import { JmdictProcessor } from '@/app.js';

const xmlPath = path.resolve('./data/jmdict.xml');
outPath = path.resolve('./data/jmdict.sqlite');
const jmdictProcessor = new JmdictProcessor(xmlPath, outPath);

jmdictProcessor.process();
