import sax from 'sax';

import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import type { Entry } from '@/lib/types/database.js';
import type { OpenTagHandlers, CloseTagHandlers } from '@/lib/types/parser.js';

interface ParserOptions<P extends BaseParser<P>> {
  db: JMDictSQLiteDatabase;
  openTagHandlers: OpenTagHandlers<P>;
  closeTagHandlers: CloseTagHandlers<P>;
  batchSize?: number;
}

export abstract class BaseParser<P extends BaseParser<P>> {
  protected readonly parser = sax.createStream(true, { trim: true });
  protected currentText = '';
  protected readonly buffer: Entry[] = [];
  protected readonly batchSize: number;

  protected readonly db: JMDictSQLiteDatabase;
  protected readonly openTagHandlers: OpenTagHandlers<P>;
  protected readonly closeTagHandlers: CloseTagHandlers<P>;

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

  parse(inputStream: NodeJS.ReadableStream): Promise<void> {
    return new Promise((resolve, reject) => {
      inputStream.pipe(this.parser);

      this.parser.once('end', () => resolve());
      this.parser.once('error', (err) => reject(err));
    });
  }

  getStream() {
    return this.parser;
  }

  // -------------------------
  // Handlers called by stream
  // -------------------------
  protected onOpenTag(node: sax.Tag) {
    const handler = this.openTagHandlers[node.name];

    if (handler) handler(this as unknown as P, node.attributes);
  }

  protected onText(text: string) {
    this.currentText += text;
  }

  protected onCloseTag(name: string) {
    const handler = this.closeTagHandlers[name];

    if (handler) handler(this as unknown as P, this.currentText.trim());

    this.currentText = '';
  }

  protected onError(err: Error) {
    console.warn('❌ SAX Parser Error:', err);
  }

  // -------------------------
  // Buffering & state
  // -------------------------
  protected flush() {
    if (this.buffer.length > 0) {
      this.db.insertEntries(this.buffer);
      this.buffer.length = 0;
    }
  }

  protected maybeFlush() {
    if (this.buffer.length >= this.batchSize) this.flush();
  }

  public get bufferRef() {
    return this.buffer;
  }

  public get batchSizeRef() {
    return this.batchSize;
  }
}
