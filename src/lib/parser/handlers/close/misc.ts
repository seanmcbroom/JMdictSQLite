import type { JMdictParser } from '@/lib/parser/index.js';

export default function misc(parser: JMdictParser, text: string) {
  parser.entry?.senses.at(-1)?.tags?.push(text);
}
