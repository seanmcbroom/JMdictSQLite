import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function misc(parser: JMdictParser, text: string) {
  parser.entry?.senses.at(-1)?.tags?.push(text);
}
