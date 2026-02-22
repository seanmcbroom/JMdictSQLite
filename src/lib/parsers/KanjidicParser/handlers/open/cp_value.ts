import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function cp_value(
  parser: KanjidicParser,
  attributes: Tag['attributes'],
) {
  parser.character?.codepoint.cp_values.push({
    cp_type: attributes.cp_type || 'unknown',
    value: undefined,
  });
}
