import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function ke_inf(parser: JMdictParser, text: string) {
  parser.entry?.kanji?.at(-1)?.tags?.push(text);
}
