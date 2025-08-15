// The purpose for string replacement is to replace elements in the XML file
// that cannot be read by the parser directly.
import { Transform } from 'stream';

import { tags } from '@/lib/constants/tags.js';

const entityMap: Record<string, string> = {};

Object.values(tags).forEach(codes => {
  for (const code of codes) {
    entityMap[`&${code};`] = code;
  }
});

// Transform stream to replace XML entities with their codes.
// Handles edge cases where an entity (e.g., &adj-i;) might be split across chunks.
export default class EntityReplace extends Transform {
  private leftover = '';

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    // Prepend any leftover from the previous chunk to the current chunk
    let data = this.leftover + chunk.toString();
    // Find the last '&' in the data. This could be the start of an entity.
    const lastAmp = data.lastIndexOf('&');
    // Check if there is a ';' after the last '&'. If not, the entity is incomplete.
    const semicolonAfterLastAmp = data.indexOf(';', lastAmp);

    // If an entity is split across chunks (e.g., chunk ends with '&adj' and next chunk starts with '-i;')
    if (lastAmp !== -1 && semicolonAfterLastAmp === -1) {
      // Save the incomplete entity to prepend to the next chunk
      this.leftover = data.slice(lastAmp);
      // Only process up to the start of the incomplete entity
      data = data.slice(0, lastAmp);
    } else {
      // No incomplete entity at the end, clear leftover
      this.leftover = '';
    }

    // Replace all complete entities in the current data
    const replaced = data.replace(/&([a-zA-Z0-9\-]+);/g, (entity, code) => {
      const replacement = entityMap[entity] ?? code;

      return replacement;
    });

    this.push(replaced);
    callback();
  }

  _flush(callback: (error?: Error | null) => void) {
    // At the end of the stream, process any remaining leftover data
    if (this.leftover) {
      const flushed = this.leftover.replace(/&([a-zA-Z0-9\-]+);/g, (entity, code) => {
        const replacement = entityMap[entity] ?? code;

        return replacement;
      });

      this.push(flushed);
    }

    callback();
  }
}
