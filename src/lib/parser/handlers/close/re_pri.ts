import type { JMdictParser } from '@/lib/parser/index.js';

export default function re_pri(parser: JMdictParser, text: string) {
  parser.entry?.kana?.at(-1)?.tags?.push(text);
}
