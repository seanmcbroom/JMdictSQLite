import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import { BaseParser } from '@/lib/parsers/BaseParser/BaseParser.js';
import closeTagHandlersPromise from '@/lib/parsers/KanjidicParser/handlers/close/index.js';
import openTagHandlersPromise from '@/lib/parsers/KanjidicParser/handlers/open/index.js';
import type { Character } from '@/lib/types/database.js';
import type { CloseTagHandlers, OpenTagHandlers } from '@/lib/types/parser.js';

/**
 * Streaming parser for the Kanjidic XML dictionary.
 *
 * This parser extends {@link BaseParser} and implements Kanjidic-specific
 * state management and persistence logic. XML tag handling is delegated
 * to handler maps, which mutate the parser's internal state.
 */
export class KanjidicParser extends BaseParser<KanjidicParser, Character> {
  /**
   * Currently active character being parsed.
   *
   * This is set when an `<character>` tag is opened and cleared once the
   * character is finalized and buffered for insertion.
   */
  protected currentCharacter: Character | undefined;

  /**
   * Async factory method to create a KanjidicParser instance.
   * You can't make `constructor` itself `async` in TS,
   * so we use a static `create` method instead.
   */
  public static async create(db: JMDictSQLiteDatabase) {
    const openTagHandlers = await openTagHandlersPromise();
    const closeTagHandlers = await closeTagHandlersPromise();

    return new KanjidicParser(db, openTagHandlers, closeTagHandlers);
  }

  /**
   * Creates a new Kanjidic parser instance.
   *
   * @param db - SQLite database used to persist parsed entries
   * @param openTagHandlers - Map of handlers for opening XML tags
   * @param closeTagHandlers - Map of handlers for closing XML tags
   */
  private constructor(
    db: JMDictSQLiteDatabase,
    openTagHandlers: OpenTagHandlers<KanjidicParser, Character>,
    closeTagHandlers: CloseTagHandlers<KanjidicParser, Character>,
  ) {
    super({ db, openTagHandlers, closeTagHandlers });
  }

  /**
   * Flushes buffered Kanjidic characters to the database.
   *
   * This method is invoked:
   * - When the buffer reaches the configured batch size
   * - When the SAX parser finishes processing the XML stream
   */
  protected flush() {
    if (this.buffer.length === 0) return;

    this.db.insertManyKanji(this.buffer);

    this.buffer.length = 0;
  }

  /**
   * Returns the current character being parsed.
   */
  public get character() {
    return this.currentCharacter;
  }

  /**
   * Sets the current character being parsed.
   *
   * @param value - Character to mark as active, or `undefined` when complete
   */
  public set character(value: Character | undefined) {
    this.currentCharacter = value;
  }
}
