import type { JmdictParser } from '@/lib/parser/index.js';

export default function s_inf(parser: JmdictParser, text: string) {
  const lastSense = parser.lastSense;

  if (lastSense) lastSense.note = text;
}
