import { BaseParser } from '../BaseParser/BaseParser.js';

import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import closeTagHandlers from '@/lib/parsers/JMdictParser/handlers/close/index.js';
import openTagHandlers from '@/lib/parsers/JMdictParser/handlers/open/index.js';
import type { Entry } from '@/lib/types/database.js';

export class JMdictParser extends BaseParser<JMdictParser> {
  protected currentEntry: Entry | undefined;

  constructor(db: JMDictSQLiteDatabase) {
    super({
      db,
      openTagHandlers,
      closeTagHandlers,
    });
  }

  // -------------------------
  // Expose current entry & sense
  // -------------------------
  public get entry() {
    return this.currentEntry;
  }

  public set entry(value: Entry | undefined) {
    this.currentEntry = value;
  }

  public get lastSense() {
    return this.currentEntry?.senses.at(-1);
  }
}
