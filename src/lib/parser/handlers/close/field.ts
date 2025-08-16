import type { JMdictParser } from '@/lib/parser/index.js';

export default function field(parser: JMdictParser, text: string) {
  parser.entry?.senses.at(-1)?.fields?.push(text);
}
