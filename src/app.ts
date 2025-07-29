import fs from 'fs';

import { JmdictDatabase } from '@/db/index.js';
import EntityReplace from '@/parser/entityReplace.js';
import { JmdictParser } from '@/parser/parser.js';

export class JmdictProcessor {
  private readonly inputPath: string;
  private readonly outputPath: string;
  private readonly db: JmdictDatabase;

  constructor(inputPath: string, outputPath: string) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.db = new JmdictDatabase(this.outputPath);
  }

  public process(): Promise<void> {
    const startTime = Date.now();
    const JMdictParserStream = new JmdictParser(this.db).getStream();

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.inputPath, { encoding: 'utf8' })
        .pipe(new EntityReplace())
        .pipe(JMdictParserStream)
        .on('end', () => {
          console.log(
            `✅ Done parsing XML. Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)}s`,
          );
          this.db.close();
          resolve();
        })
        .on('error', err => {
          this.db.close();
          reject(err);
        });
    });
  }
}
