import type { JMdictParser } from '@/lib/JMdictParser/index.js';

export default function r_ele(parser: JMdictParser) {
  parser.entry?.kana.push({ written: '', tags: [], restr: [] });
}
