import path from 'path';

import { JMdictProcessor } from '@/lib/processor/index.js';

const xmlPath = path.resolve('./data/JMdict.xml');
const outPath = path.resolve('./data/JMdict.sqlite');

new JMdictProcessor(xmlPath, outPath).process();
