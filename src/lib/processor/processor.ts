import fs from 'node:fs';

import { JMdictDatabase } from '@/lib/database/index.js';
import EntityReplace from '@/lib/parser/entityReplace.js';
import { JMdictParser } from '@/lib/parser/parser.js';

export class Processor {
  private readonly jmdictXMLPath: string;
  private readonly kanjidicXMLPath: string;
  private readonly outputPath: string;
  private readonly db: JMdictDatabase;

  constructor(jmdictXMLPath: string, kanjidicXMLPath: string, outputPath: string) {
    this.jmdictXMLPath = jmdictXMLPath;
    this.kanjidicXMLPath = kanjidicXMLPath;
    this.outputPath = outputPath;
    this.db = new JMdictDatabase(this.outputPath);
  }

  public process(): Promise<void> {
    const startTime = Date.now();
    const JMdictParserStream = new JMdictParser(this.db).getStream();

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.jmdictXMLPath, { encoding: 'utf8' })
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
