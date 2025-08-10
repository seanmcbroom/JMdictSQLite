import type { JmdictParser } from '@/parser/index.js';

export default function ent_seq(parser: JmdictParser, text: string) {
  const parsed = parseInt(text, 10);

  if (!isNaN(parsed) && parser.entry) {
    parser.entry.ent_seq = parsed;
  }
}
