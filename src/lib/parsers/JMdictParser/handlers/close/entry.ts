import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function entry(parser: JMdictParser) {
  const current = parser.entry;

  if (!current) return;

  parser.bufferRef.push(current);

  parser.entry = undefined;
}
