import type { JmdictParser } from '@/parser/index.js';

export default function s_inf(parser: JmdictParser, text: string) {
  const lastSense = parser.entry?.senses.at(-1);

  if (lastSense) lastSense.note = text;
}
