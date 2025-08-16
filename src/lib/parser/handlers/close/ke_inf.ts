import type { JMdictParser } from '@/lib/parser/index.js';

export default function ke_inf(parser: JMdictParser, text: string) {
  parser.entry?.kanji?.at(-1)?.tags?.push(text);
}
