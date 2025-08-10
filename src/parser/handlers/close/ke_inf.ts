import type { JmdictParser } from '@/parser/index.js';

export default function ke_inf(parser: JmdictParser, text: string) {
  parser.entry?.kanji?.at(-1)?.tags?.push(text);
}
