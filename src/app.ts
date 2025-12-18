import path from 'node:path';

import { JMdictProcessor } from '@/lib/processor/index.js';

const xmlPath = path.resolve('./data/jmdict.xml');
const outPath = path.resolve('./data/jmdict.sqlite');

new JMdictProcessor(xmlPath, outPath).process();
