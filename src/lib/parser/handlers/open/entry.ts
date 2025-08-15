import type { JmdictParser } from '@/lib/parser/index.js';

export default function entry(parser: JmdictParser) {
  parser.entry = {
    ent_seq: 0,
    kanji: [],
    kana: [],
    senses: [],
  };
}
