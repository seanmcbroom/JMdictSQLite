import type { JMdictParser } from '@/lib/parser/index.js';

export default function k_ele(parser: JMdictParser) {
  parser.entry?.kanji?.push({ written: '', tags: [] });
}
