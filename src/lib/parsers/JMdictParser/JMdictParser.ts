import { BaseParser } from '../BaseParser/BaseParser.js';

import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import closeTagHandlers from '@/lib/parsers/JMdictParser/handlers/close/index.js';
import openTagHandlers from '@/lib/parsers/JMdictParser/handlers/open/index.js';
import type { Entry } from '@/lib/types/database.js';

/**
 * Streaming parser for the JMdict XML dictionary.
 *
 * This parser extends {@link BaseParser} and implements JMdict-specific
 * state management and persistence logic. XML tag handling is delegated
 * to handler maps, which mutate the parser's internal state.
 */
export class JMdictParser extends BaseParser<JMdictParser> {
  /**
   * Currently active dictionary entry being parsed.
   *
   * This is set when an `<entry>` tag is opened and cleared once the
   * entry is finalized and buffered for insertion.
   */
  protected currentEntry: Entry | undefined;

  /**
   * Creates a new JMdict parser instance.
   *
   * @param db - SQLite database used to persist parsed entries
   */
  constructor(db: JMDictSQLiteDatabase) {
    super({
      db,
      openTagHandlers,
      closeTagHandlers,
    });
  }

  /**
   * Flushes buffered JMdict entries to the database.
   *
   * This method is invoked:
   * - When the buffer reaches the configured batch size
   * - When the SAX parser finishes processing the XML stream
   */
  protected flush() {
    if (this.buffer.length === 0) return;

    this.db.insertEntries(this.buffer);

    this.buffer.length = 0;
  }

  // -------------------------
  // Expose current entry & sense
  // -------------------------

  /**
   * Returns the current JMdict entry being parsed.
   *
   * Intended for use by open/close tag handlers to mutate
   * the active entry as XML elements are processed.
   */
  public get entry() {
    return this.currentEntry;
  }

  /**
   * Sets the current JMdict entry being parsed.
   *
   * @param value - Entry to mark as active, or `undefined` when complete
   */
  public set entry(value: Entry | undefined) {
    this.currentEntry = value;
  }

  /**
   * Returns the most recently added sense of the current entry.
   *
   * Useful for handlers that append data to the latest `<sense>` element.
   */
  public get lastSense() {
    return this.currentEntry?.senses.at(-1);
  }
}
