import type { JMdictParser } from '@/lib/parser/index.js';

export default function re_restr(parser: JMdictParser, text: string) {
  parser.entry?.kana?.at(-1)?.restr?.push(text);
}
