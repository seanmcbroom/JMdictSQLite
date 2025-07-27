import fs from 'fs';

import { JmdictDatabase } from '@/db/index.js';
import EntityReplace from '@/parser/entityReplace.js';
import { createParser } from '@/parser/parser.js';

export class JmdictProcessor {
  private inputPath: string;
  private outputPath: string;
  private db: JmdictDatabase;

  constructor(inputPath: string, outputPath: string) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.db = new JmdictDatabase(this.outputPath);
  }

  public process(): Promise<void> {
    const startTime = Date.now();
    const dbParser = createParser(this.db);

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.inputPath, { encoding: 'utf8' })
        .pipe(new EntityReplace())
        .pipe(dbParser)
        .on('end', () => {
          console.log(
            `✅ Done parsing XML. Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)}s`
          );
          this.db.close();
          resolve();
        })
        .on('error', (err) => {
          this.db.close();
          reject(err);
        });
    });
  }
}