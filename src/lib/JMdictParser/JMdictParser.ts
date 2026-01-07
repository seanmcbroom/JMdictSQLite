import sax from 'sax';

import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import closeTagHandlers from '@/lib/JMdictParser/handlers/close/index.js';
import openTagHandlers from '@/lib/JMdictParser/handlers/open/index.js';
import type { Entry } from '@/lib/types/database.js';

export class JMdictParser {
  private readonly parser = sax.createStream(true, { trim: true });
  private currentEntry: Entry | undefined;
  private currentText = '';
  private readonly buffer: Entry[] = [];
  private readonly batchSize = 500;

  constructor(private readonly db: JMDictSQLiteDatabase) {
    this.parser.on('opentag', this.onOpenTag.bind(this));
    this.parser.on('text', this.onText.bind(this));
    this.parser.on('closetag', this.onCloseTag.bind(this));
    this.parser.on('error', this.onError.bind(this));
    this.parser.on('end', this.flushBuffer.bind(this));
  }

  getStream() {
    return this.parser;
  }

  private flushBuffer() {
    if (this.buffer.length > 0) {
      this.db.insertEntries(this.buffer);
      this.buffer.length = 0;
    }
  }

  private onOpenTag(node: sax.Tag) {
    const handler = openTagHandlers[node.name];

    if (handler) {
      handler(this, node.attributes);
    }
  }

  private onText(text: string) {
    this.currentText += text;
  }

  private onCloseTag(name: string) {
    const handler = closeTagHandlers[name];

    if (handler) {
      handler(this, this.currentText.trim());
    }

    this.currentText = '';
  }

  private onError(err: Error) {
    console.warn('❌ SAX Parser Error:', err);
  }

  // expose internal state so handlers can modify
  public get entry() {
    return this.currentEntry;
  }

  public set entry(value: Entry | undefined) {
    this.currentEntry = value;
  }

  public get lastSense() {
    return this.currentEntry?.senses.at(-1);
  }

  public get bufferRef() {
    return this.buffer;
  }

  public get batchSizeRef() {
    return this.batchSize;
  }

  public flush = this.flushBuffer.bind(this);
}
