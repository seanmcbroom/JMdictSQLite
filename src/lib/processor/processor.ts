import fs from 'node:fs';

import { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import {
  JMdictParser,
  EntityReplace as JMdictEntityReplace,
} from '@/lib/parsers/JMdictParser/index.js';
import {
  KanjidicParser,
  EntityReplace as KanjidicEntityReplace,
} from '@/lib/parsers/KanjidicParser/index.js';

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

    const jmdictParser = new JMdictParser(this.db);

    await jmdictParser.parse(
      fs
        .createReadStream(this.jmdictXMLPath, {
          encoding: 'utf8',
        })
        .pipe(new JMdictEntityReplace()),
    );

    console.log(`Done parsing JMdict. ${((Date.now() - startTime) / 1000).toFixed(2)}s elapsed.`);

    const kanjidicParser = new KanjidicParser(this.db);

    await kanjidicParser.parse(
      fs
        .createReadStream(this.kanjidicXMLPath, {
          encoding: 'utf8',
        })
        .pipe(new KanjidicEntityReplace()),
    );

    console.log(`Done parsing Kanjidic.`);

    this.db.close();

    console.log(`All done. Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  }
}
