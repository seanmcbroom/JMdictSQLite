import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function pos(parser: JMdictParser, text: string) {
  const lastSense = parser.lastSense;

  if (!lastSense) return;

  lastSense.pos.push(text);
}
