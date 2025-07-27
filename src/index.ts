import fs from 'fs';

import { JmdictDatabase } from '@/db/index.js';
import EntityReplace from '@/parser/entityReplace.js';
import { createParser } from '@/parser/parser.js';

const startTime = Date.now();
const db = new JmdictDatabase();
const dbParser = createParser(db);

fs.createReadStream('./data/jmdict.xml', { encoding: 'utf8' })
  .pipe(new EntityReplace()) // Handles entity replacements
  .pipe(dbParser) // Parsing stream
  .on('end', () => {
    console.log(`✅ Done parsing XML. Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

    db.close();
  });