import { type Tag } from 'sax';

import type { JmdictParser } from '@/lib/parser/index.js';

export default function lsource(parser: JmdictParser, attributes: Tag['attributes']) {
  const lastSense = parser.entry?.senses.at(-1);

  if (!lastSense) return;

  if (attributes['ls_wasei']) {
    lastSense.lang = 'wasei';
  } else if (attributes['xml:lang']) {
    lastSense.lang = attributes['xml:lang'];
  }
}
