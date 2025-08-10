import type { JmdictParser } from '@/parser/index.js';

export default function field(parser: JmdictParser, text: string) {
  parser.entry?.senses.at(-1)?.fields?.push(text);
}
