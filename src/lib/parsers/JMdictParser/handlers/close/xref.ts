import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function ant(parser: JMdictParser, text: string) {
  const lastSense = parser.lastSense;

  if (!lastSense) return;

  const [written, _, index] = text.split('・');

  lastSense.see?.push({
    written,
    index,
  });
}
