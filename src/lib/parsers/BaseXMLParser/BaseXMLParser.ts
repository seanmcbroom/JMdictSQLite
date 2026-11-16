import type { Readable } from 'node:stream';
import sax from 'sax';

import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import type { OpenTagHandlers, CloseTagHandlers } from '@/lib/types/parser.js';

/**
 * Configuration options for {@link BaseXMLParser}.
 *
 * @template P - Concrete parser type extending BaseXMLParser
 * @template T - Type of items in the buffer
 */
interface ParserOptions<P extends BaseXMLParser<P, T>, T> {
  /** SQLite database instance used for persisting parsed entries */
  db: JMDictSQLiteDatabase;

  /** Map of XML open-tag names to handler functions */
  openTagHandlers: OpenTagHandlers<P, T>;

  /** Map of XML close-tag names to handler functions */
  closeTagHandlers: CloseTagHandlers<P, T>;

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
 * @template P - Concrete parser type extending BaseXMLParser
 * @template T - Type of items in the buffer
 */
export abstract class BaseXMLParser<P extends BaseXMLParser<P, T>, T> {
  protected readonly db: JMDictSQLiteDatabase;

  protected readonly parser = sax.createStream(true, { trim: true });

  protected currentText = '';

  protected readonly openTagHandlers: OpenTagHandlers<P, T>;
  protected readonly closeTagHandlers: CloseTagHandlers<P, T>;

  protected readonly buffer: T[] = [];
  protected readonly batchSize: number;

  /** Rejects the in-flight {@link parse} promise; set while parsing. */
  private failParse: ((err: Error) => void) | undefined;

  /**
   * Creates a new BaseXMLParser instance and wires SAX event handlers.
   *
   * @param options - Parser configuration
   * @param options.db - SQLite database instance for persistence
   * @param options.openTagHandlers - Map of XML open-tag handlers
   * @param options.closeTagHandlers - Map of XML close-tag handlers
   * @param options.batchSize - Number of entries to buffer before flushing
   */
  constructor({
    db,
    openTagHandlers,
    closeTagHandlers,
    batchSize = 500,
  }: ParserOptions<P, T>) {
    this.db = db;
    this.openTagHandlers = openTagHandlers;
    this.closeTagHandlers = closeTagHandlers;
    this.batchSize = batchSize;

    this.parser.on('opentag', this.onOpenTag.bind(this));
    this.parser.on('text', this.onText.bind(this));
    this.parser.on('closetag', this.onCloseTag.bind(this));
    this.parser.on('error', this.onError.bind(this));
  }

  /**
   * Starts parsing a readable XML stream.
   *
   * The promise rejects on the first input-stream error, SAX parse error,
   * tag-handler error or database flush error, so a partial parse can
   * never be mistaken for a complete one.
   *
   * @param inputStream - Readable stream containing XML data
   * @returns A promise that resolves when parsing completes
   */
  parse(inputStream: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false;

      const fail = (err: Error) => {
        if (settled) return;
        settled = true;
        this.failParse = undefined;

        inputStream.unpipe(this.parser);
        inputStream.destroy();
        reject(err);
      };

      this.failParse = fail;

      inputStream.once('error', fail);

      this.parser.once('end', () => {
        if (settled) return;

        try {
          this.flush();
        } catch (err) {
          fail(toError(err, 'Failed to flush parsed entries'));

          return;
        }

        settled = true;
        this.failParse = undefined;
        resolve();
      });

      inputStream.pipe(this.parser);
    });
  }

  /**
   * Fails the current {@link parse} call, or throws if none is running.
   *
   * @param err - The error that stopped parsing
   */
  protected fail(err: Error) {
    if (!this.failParse) throw err;

    this.failParse(err);
  }

  // -------------------------
  // Event handlers
  // -------------------------

  /**
   * Invoked when an opening XML tag is encountered.
   * Delegates handling to the registered open-tag handler map.
   *
   * @param node - SAX tag metadata and attributes
   */
  protected onOpenTag(node: sax.Tag) {
    const handler = this.openTagHandlers[node.name];

    if (!handler) return;

    try {
      handler(this as unknown as P, node.attributes);
    } catch (err) {
      this.fail(toError(err, `Open tag handler for <${node.name}> failed`));
    }
  }

  /**
   * Invoked when text content is encountered between tags.
   *
   * @param text - Text content emitted by the SAX parser
   */
  protected onText(text: string) {
    this.currentText += text;
  }

  /**
   * Invoked when a closing XML tag is encountered.
   * Delegates handling to the registered close-tag handler map
   * and resets the accumulated text buffer.
   *
   * @param name - Name of the closing tag
   */
  protected onCloseTag(name: string) {
    const handler = this.closeTagHandlers[name];

    try {
      if (handler) handler(this as unknown as P, this.currentText.trim());
    } catch (err) {
      this.fail(toError(err, `Close tag handler for </${name}> failed`));
    } finally {
      this.currentText = '';
    }
  }

  /**
   * Invoked when the SAX parser encounters an error.
   *
   * @param err - Parsing error
   */
  protected onError(err: Error) {
    this.fail(toError(err, 'SAX parser error'));
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

/**
 * Wraps an unknown thrown value in an Error with context, keeping the
 * original as `cause`.
 */
function toError(err: unknown, message: string): Error {
  return new Error(message, { cause: err });
}
