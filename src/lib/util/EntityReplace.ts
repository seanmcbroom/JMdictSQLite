import { Transform } from 'node:stream';

import type { TagDictionary } from '@/lib/types/tags';

/**
 * Transform stream that safely replaces XML entities with their codes.
 *
 * This stream handles entities that may be split across chunks (e.g., `&adj-i;`)
 * by buffering incomplete entities until the next chunk arrives.
 *
 * ⚠️ Note: This parser does **not** process DTDs. Automatically handling DTDs
 * can lead to security risks (XXE attacks), memory/CPU exhaustion (Billion Laughs),
 * and network issues. Only known entities defined in `tags` are replaced.
 */
export class EntityReplace extends Transform {
  private leftover = '';
  private readonly entityMap: Record<string, string> = {};

  constructor(tags: TagDictionary) {
    super();

    // Build a map of known entities to their replacement codes
    for (const codes of Object.values(tags)) {
      for (const code of codes) {
        this.entityMap[`&${code};`] = code;
      }
    }
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
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

    // Replace all complete entities in the current data
    const replaced = data.replaceAll(/&([a-zA-Z0-9-]+);/g, (entity, code) => {
      const replacement = this.entityMap[entity] ?? code;

      return replacement;
    });

    this.push(replaced);
    callback();
  }

  _flush(callback: (error?: Error | null) => void) {
    // Process any leftover entity at the end of the stream
    if (this.leftover) {
      const flushed = this.leftover.replaceAll(
        /&([a-zA-Z0-9-]+);/g,
        (entity, code) => {
          const replacement = this.entityMap[entity] ?? code;

          return replacement;
        },
      );

      this.push(flushed);
    }

    callback();
  }
}
