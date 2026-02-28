import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function rad_value(
  parser: KanjidicParser,
  attributes: Tag['attributes'],
) {
  parser.character?.radical?.rad_values.push({
    rad_type: attributes.rad_type || 'unknown',
    value: undefined,
  });
}
