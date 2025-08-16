import type { JMdictParser } from '@/lib/parser/index.js';

export default function s_inf(parser: JMdictParser, text: string) {
  const lastSense = parser.lastSense;

  if (lastSense) lastSense.note = text;
}
