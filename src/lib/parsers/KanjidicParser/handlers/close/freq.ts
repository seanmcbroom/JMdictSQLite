import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function freq(parser: KanjidicParser, text: string) {
  if (parser.character?.misc) {
    parser.character.misc.freq = text;
  }
}
