import type { JMdictParser } from '@/lib/parser/index.js';

export default function entry(parser: JMdictParser) {
  parser.entry = {
    ent_seq: 0,
    kanji: [],
    kana: [],
    senses: [],
  };
}
