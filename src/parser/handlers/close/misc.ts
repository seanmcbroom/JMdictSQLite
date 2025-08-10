import type { JmdictParser } from '@/parser/index.js';

export default function misc(parser: JmdictParser, text: string) {
  parser.entry?.senses.at(-1)?.tags?.push(text);
}
