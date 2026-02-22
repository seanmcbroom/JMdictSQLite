import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function variant(
  parser: KanjidicParser,
  attributes: Tag['attributes'],
) {
  parser.character!.misc!.variants ??= []; // If the array doesn't exist, create it

  parser.character?.misc?.variants.push({
    var_type: attributes.var_type || 'unknown',
    value: undefined,
  });
}
