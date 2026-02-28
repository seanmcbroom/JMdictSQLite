import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function field(parser: JMdictParser, text: string) {
  parser.entry?.senses.at(-1)?.fields?.push(text);
}
