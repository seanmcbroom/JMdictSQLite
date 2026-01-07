import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import { BaseParser } from '@/lib/parsers/BaseParser/BaseParser.js';
import closeTagHandlers from '@/lib/parsers/KanjidicParser/handlers/close/index.js';
import openTagHandlers from '@/lib/parsers/KanjidicParser/handlers/open/index.js';

export class KanjidicParser extends BaseParser<KanjidicParser> {
  constructor(db: JMDictSQLiteDatabase) {
    super({
      db,
      openTagHandlers,
      closeTagHandlers,
    });
  }

  protected flush() {
    if (this.buffer.length === 0) return;

    // this.db.insertEntries(this.buffer);

    this.buffer.length = 0;
  }
}
