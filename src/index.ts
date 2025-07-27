import fs from 'fs';
import { createParser } from '@/parser/parser.js';
import { JmdictDatabase } from '@/db/index.js';
import EntityReplace from '@/parser/entityReplace.js';
import { DefaultArtifactClient } from '@actions/artifact';

const startTime = Date.now();
const db = new JmdictDatabase();
const dbParser = createParser(db);

const artifact = new DefaultArtifactClient();

fs.createReadStream('./data/jmdict.xml', { encoding: 'utf8' })
  .pipe(new EntityReplace()) // Handles entity replacements
  .pipe(dbParser) // Parsing stream
  .on('end', () => {
    console.log(`✅ Done parsing XML. Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    
    db.close();

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    artifact.uploadArtifact(`JMDictSQLite-${dateStr}`, ['./data/jmdict.db'], './', {
      retentionDays: 7
    })
      .then(() => {
        console.log('📦 Artifact uploaded successfully.');
      })
      .catch((err) => {
        console.error('❌ Failed to upload artifact:', err);
      });
  });