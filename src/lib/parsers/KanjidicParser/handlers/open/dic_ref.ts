import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function dic_ref(
  parser: KanjidicParser,
  attributes: Tag['attributes'],
) {
  parser.character?.dic_number?.dic_refs.push({
    dr_type: attributes.dr_type || 'unknown',
    m_vol: attributes.m_vol || undefined,
    m_page: attributes.m_page || undefined,
    value: undefined,
  });
}
