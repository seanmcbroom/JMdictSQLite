import type { JmdictParser } from '@/parser/index.js';

export default function re_pri(parser: JmdictParser, text: string) {
  parser.entry?.kana?.at(-1)?.tags?.push(text);
}
