import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import { BaseParser } from '@/lib/parsers/BaseParser/BaseParser.js';
import closeTagHandlersPromise from '@/lib/parsers/KanjidicParser/handlers/close/index.js';
import openTagHandlersPromise from '@/lib/parsers/KanjidicParser/handlers/open/index.js';
import type { Character } from '@/lib/types/database';
import type { CloseTagHandlers, OpenTagHandlers } from '@/lib/types/parser';

export class KanjidicParser extends BaseParser<KanjidicParser, Character> {
  protected currentCharacter: Character | undefined;

  public static async create(db: JMDictSQLiteDatabase) {
    const openTagHandlers = await openTagHandlersPromise();
    const closeTagHandlers = await closeTagHandlersPromise();

    return new KanjidicParser(db, openTagHandlers, closeTagHandlers);
  }

  private constructor(
    db: JMDictSQLiteDatabase,
    openTagHandlers: OpenTagHandlers<KanjidicParser>,
    closeTagHandlers: CloseTagHandlers<KanjidicParser>,
  ) {
    super({ db, openTagHandlers, closeTagHandlers });
  }

  protected flush() {
    if (this.buffer.length === 0) return;

    this.db.insertManyKanji(this.buffer);

    this.buffer.length = 0;
  }

  public get character() {
    return this.currentCharacter;
  }

  public set character(value: Character | undefined) {
    this.currentCharacter = value;
  }
}
