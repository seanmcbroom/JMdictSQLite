import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function s_inf(parser: JMdictParser, text: string) {
  const lastSense = parser.lastSense;

  if (lastSense) lastSense.note = text;
}
