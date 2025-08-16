import type { JMdictParser } from '@/lib/parser/index.js';

export default function ent_seq(parser: JMdictParser, text: string) {
  const parsed = parseInt(text, 10);

  if (!isNaN(parsed) && parser.entry) {
    parser.entry.ent_seq = parsed;
  }
}
