import type { JmdictParser } from '@/lib/parser/index.js';

export default function ant(parser: JmdictParser, text: string) {
  const lastSense = parser.lastSense;

  if (!lastSense) return;

  const [written, _, index] = text.split('・');

  lastSense.see?.push({
    written,
    index,
  });
}
