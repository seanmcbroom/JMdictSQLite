import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function q_code(
  parser: KanjidicParser,
  attributes: Tag['attributes'],
) {
  parser.character?.query_code?.q_codes.push({
    qc_type: attributes.qc_type || 'unknown',
    value: undefined,
  });
}
