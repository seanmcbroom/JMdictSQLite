import type { JmdictParser } from '@/parser/index.js';

export default function gloss(parser: JmdictParser, text: string) {
  parser.entry?.senses.at(-1)?.glosses.push(text);
}
