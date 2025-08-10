import type { JmdictParser } from '@/parser/index.js';

export default function k_ele(parser: JmdictParser) {
  parser.entry?.kanji?.push({ written: '', tags: [] });
}
