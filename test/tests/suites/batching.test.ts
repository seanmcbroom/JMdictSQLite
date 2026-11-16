import { deepEqual } from 'node:assert';
import { Readable } from 'node:stream';
import { describe, it } from 'node:test';

import type { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import { BaseXMLParser } from '@/lib/parsers/BaseXMLParser/BaseXMLParser.js';

/** Records each batch instead of writing to a database. */
class RecordingParser extends BaseXMLParser<RecordingParser, string> {
  readonly batches: string[][] = [];

  constructor(batchSize: number) {
    super({
      db: {} as JMDictSQLiteDatabase,
      openTagHandlers: {},
      closeTagHandlers: { item: (parser, text) => parser.enqueue(text) },
      batchSize,
    });
  }

  protected flush() {
    if (this.buffer.length === 0) return;

    this.batches.push([...this.buffer]);
    this.buffer.length = 0;
  }
}

describe('Batched inserts', () => {
  it('flushes every batchSize items and the remainder at the end', async () => {
    const parser = new RecordingParser(2);
    const items = ['a', 'b', 'c', 'd', 'e'].map(x => `<item>${x}</item>`);

    await parser.parse(Readable.from([`<root>${items.join('')}</root>`]));

    deepEqual(parser.batches, [['a', 'b'], ['c', 'd'], ['e']]);
  });
});
