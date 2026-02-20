import sax from 'sax';

import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import type { OpenTagHandlers, CloseTagHandlers } from '@/lib/types/parser.js';

/**
 * Configuration options for {@link BaseParser}.
 *
 * @template P - Concrete parser type extending BaseParser
 */
interface ParserOptions<P extends BaseParser<P>> {
  /** SQLite database instance used for persisting parsed entries */
  db: JMDictSQLiteDatabase;

  /** Map of XML open-tag names to handler functions */
  openTagHandlers: OpenTagHandlers<P>;

  /** Map of XML close-tag names to handler functions */
  closeTagHandlers: CloseTagHandlers<P>;

  /**
   * Number of entries to buffer before flushing to the database.
   * @defaultValue 500
   */
  batchSize?: number;
}

/**
 * Base class for streaming XML parsers built on top of `sax`.
 *
 * This parser:
 * - Processes XML using a streaming (low-memory) approach
 * - Delegates tag-specific logic to handler maps
 * - Buffers parsed entries and inserts them into the database in batches
 *
 * The generic parameter `P` enables strongly typed handler callbacks
 * that receive the concrete parser instance.
 *
 * @template P - Concrete parser type extending BaseParser
 * @template T - Type of items in the buffer
 */
export abstract class BaseParser<P extends BaseParser<P, T>, T> {
  protected readonly db: JMDictSQLiteDatabase;

  protected readonly parser = sax.createStream(true, { trim: true });

  protected currentText = '';

  protected readonly openTagHandlers: OpenTagHandlers<P>;
  protected readonly closeTagHandlers: CloseTagHandlers<P>;

  protected readonly buffer: T[] = [];
  protected readonly batchSize: number;

  /**
   * Creates a new BaseParser instance and wires SAX event handlers.
   *
   * @param options - Parser configuration
   */
  constructor({
    db,
    openTagHandlers,
    closeTagHandlers,
    batchSize = 500,
  }: ParserOptions<P>) {
    this.db = db;
    this.openTagHandlers = openTagHandlers;
    this.closeTagHandlers = closeTagHandlers;
    this.batchSize = batchSize;

    this.parser.on('opentag', this.onOpenTag.bind(this));
    this.parser.on('text', this.onText.bind(this));
    this.parser.on('closetag', this.onCloseTag.bind(this));
    this.parser.on('error', this.onError.bind(this));
    this.parser.on('end', this.flush.bind(this));
  }

  /**
   * Starts parsing a readable XML stream.
   *
   * @param inputStream - Readable stream containing XML data
   * @returns A promise that resolves when parsing completes
   */
  parse(inputStream: NodeJS.ReadableStream): Promise<void> {
    return new Promise(resolve => {
      inputStream.pipe(this.parser);

      this.parser.once('end', () => resolve());
    });
  }

  /**
   * Returns the underlying SAX stream parser.
   * Useful for piping or advanced stream composition.
   */
  getStream() {
    return this.parser;
  }

  // -------------------------
  // Handlers called by stream
  // -------------------------

  /**
   * Invoked when an opening XML tag is encountered.
   * Delegates handling to the registered open-tag handler map.
   *
   * @param node - SAX tag metadata and attributes
   */
  protected onOpenTag(node: sax.Tag) {
    try {
      const handler = this.openTagHandlers[node.name];

      if (handler) handler(this as unknown as P, node.attributes);
    } catch (err) {
      console.warn(`Error in open tag handler for <${node.name}>:`, err);
    }
  }

  /**
   * Invoked when text content is encountered between tags.
   *
   * @param text - Text content emitted by the SAX parser
   */
  protected onText(text: string) {
    try {
      this.currentText += text;
    } catch (err) {
      console.warn('Error in text handler:', err);
    }
  }

  /**
   * Invoked when a closing XML tag is encountered.
   * Delegates handling to the registered close-tag handler map
   * and resets the accumulated text buffer.
   *
   * @param name - Name of the closing tag
   */
  protected onCloseTag(name: string) {
    try {
      const handler = this.closeTagHandlers[name];

      if (handler) handler(this as unknown as P, this.currentText.trim());

      this.currentText = '';
    } catch (err) {
      console.warn(`Error in close tag handler for </${name}>:`, err);
    }
  }

  /**
   * Invoked when the SAX parser encounters an error.
   *
   * @param err - Parsing error
   */
  protected onError(err: Error) {
    console.warn('❌ SAX Parser Error:', err);
  }

  // -------------------------
  // Buffering & state
  // -------------------------

  /**
   * Flushes buffered entries to the database.
   *
   * Must be implemented by derived classes since
   * insertion logic may vary by dictionary format.
   */
  protected abstract flush(): void;

  /**
   * Flushes the buffer if the batch size threshold is reached.
   */
  protected maybeFlush() {
    if (this.buffer.length >= this.batchSize) this.flush();
  }

  /**
   * Exposes a reference to the internal entry buffer.
   * Intended for use by tag handlers.
   */
  public get bufferRef() {
    return this.buffer;
  }

  /**
   * Exposes the configured batch size.
   * Intended for use by tag handlers.
   */
  public get batchSizeRef() {
    return this.batchSize;
  }
}
