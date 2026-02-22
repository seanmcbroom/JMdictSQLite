import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function reading(
  parser: KanjidicParser,
  attributes: Tag['attributes'],
) {
  parser.character?.reading_meaning?.rmgroups.readings.push({
    r_type: attributes.r_type || 'unknown',
    value: undefined,
  });
}
