import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function meaning(
  parser: KanjidicParser,
  attributes: Tag['attributes'],
) {
  // Default language is English if not specified
  parser.character?.reading_meaning?.rmgroups.meanings.push({
    m_lang: attributes.m_lang || 'en',
    value: undefined,
  });
}
