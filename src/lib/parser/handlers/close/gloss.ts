import type { JMdictParser } from '@/lib/parser/index.js';

export default function gloss(parser: JMdictParser, text: string) {
  parser.entry?.senses.at(-1)?.glosses.push(text);
}
