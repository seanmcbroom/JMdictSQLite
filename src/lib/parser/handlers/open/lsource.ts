import { type Tag } from 'sax';

import type { JMdictParser } from '@/lib/parser/index.js';

export default function lsource(parser: JMdictParser, attributes: Tag['attributes']) {
  const lastSense = parser.lastSense;

  if (!lastSense) return;

  if (attributes['xml:lang']) {
    lastSense.lang = `${attributes['ls_type'] && 'semi-'}${attributes['xml:lang']}`;
  } else if (attributes['ls_wasei']) {
    lastSense.lang = 'wasei';
  }
}
