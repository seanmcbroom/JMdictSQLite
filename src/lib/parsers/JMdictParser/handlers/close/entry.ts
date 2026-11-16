import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function entry(parser: JMdictParser) {
  const current = parser.entry;

  if (!current) return;

  parser.entry = undefined;

  parser.enqueue(current);
}
