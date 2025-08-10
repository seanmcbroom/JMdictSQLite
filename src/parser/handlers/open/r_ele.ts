import type { JmdictParser } from '@/parser/index.js';

export default function r_ele(parser: JmdictParser) {
  parser.entry?.kana.push({ written: '', tags: [] });
}
