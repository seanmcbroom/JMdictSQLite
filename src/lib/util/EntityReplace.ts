import { Transform } from 'node:stream';
import type { TransformCallback } from 'node:stream';

/** XML's built-in entities. These are left for the XML parser to decode. */
const PREDEFINED_ENTITIES = new Set(['amp', 'lt', 'gt', 'quot', 'apos']);

const ENTITY = /&([a-zA-Z0-9-]+);/g;

/**
 * Replaces JMdict's DTD entities (e.g. `&v5k-s;`) with their bare code
 * (`v5k-s`), which is how tags are stored in the database.
 *
 * XML's predefined entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`)
 * and numeric character references are passed through untouched so the
 * XML parser decodes them to `&`, `<`, `>`, `"` and `'`.
 *
 * Entities split across chunks are buffered until the next chunk arrives.
 *
 * ⚠️ Note: This does **not** process DTDs. Automatically handling DTDs
 * can lead to security risks (XXE attacks), memory/CPU exhaustion
 * (Billion Laughs), and network issues.
 */
export class EntityReplace extends Transform {
  private leftover = '';

  _transform(chunk: Buffer, _encoding: BufferEncoding, cb: TransformCallback) {
    // Prepend leftover from previous chunk
    let data = this.leftover + chunk.toString();

    // Check if the chunk ends with an incomplete entity
    const lastAmp = data.lastIndexOf('&');
    const semicolonAfterLastAmp = data.indexOf(';', lastAmp);

    if (lastAmp !== -1 && semicolonAfterLastAmp === -1) {
      // Buffer incomplete entity for next chunk
      this.leftover = data.slice(lastAmp);
      data = data.slice(0, lastAmp);
    } else {
      this.leftover = '';
    }

    this.push(replaceEntities(data));
    cb();
  }

  _flush(cb: TransformCallback) {
    if (this.leftover) this.push(replaceEntities(this.leftover));

    cb();
  }
}

function replaceEntities(text: string): string {
  return text.replace(ENTITY, (entity, name: string) =>
    PREDEFINED_ENTITIES.has(name) ? entity : name,
  );
}
