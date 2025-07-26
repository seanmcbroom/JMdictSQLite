import fs from 'fs';
import entityReplace from './parser/entityReplace';
import { createParser } from './parser/parser';
import { db } from './db';

fs.createReadStream('./data/jmdict.xml')
  .pipe(new entityReplace()) // Replace characters
  .pipe(createParser()) // Parsing stream
  .on('end', () => {
    console.log('✅ Done parsing XML.');
    db.close();
  });