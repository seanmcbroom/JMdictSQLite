import fs from 'node:fs';
import { finished } from 'stream/promises';

import { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import { JMdictParser, EntityReplace as JMdictEntityReplace } from '@/lib/JMdictParser/index.js';
import {
  KanjidicParser,
  EntityReplace as KanjidicEntityReplace,
} from '@/lib/KanjidicParser/index.js';

export class Processor {
  private readonly jmdictXMLPath: string;
  private readonly kanjidicXMLPath: string;
  private readonly outputPath: string;
  private readonly db: JMDictSQLiteDatabase;

  constructor({
    jmdictXMLPath,
    kanjidicXMLPath,
    outputPath,
  }: {
    jmdictXMLPath: string;
    kanjidicXMLPath: string;
    outputPath: string;
  }) {
    this.jmdictXMLPath = jmdictXMLPath;
    this.kanjidicXMLPath = kanjidicXMLPath;
    this.outputPath = outputPath;

    this.db = new JMDictSQLiteDatabase(this.outputPath);
  }

  public async process(): Promise<void> {
    const startTime = Date.now();

    const jmdictStream = fs
      .createReadStream(this.jmdictXMLPath, { encoding: 'utf8' })
      .pipe(new JMdictEntityReplace())
      .pipe(new JMdictParser(this.db).getStream());

    const kanjidicStream = fs
      .createReadStream(this.kanjidicXMLPath, { encoding: 'utf8' })
      .pipe(new KanjidicEntityReplace())
      .pipe(new KanjidicParser(this.db).getStream());

    try {
      await Promise.all([finished(jmdictStream), finished(kanjidicStream)]);

      console.log(
        `✅ Done parsing JMdict & Kanjidic. Time elapsed: ${(
          (Date.now() - startTime) /
          1000
        ).toFixed(2)}s`,
      );
    } finally {
      this.db.close();
    }
  }
}
