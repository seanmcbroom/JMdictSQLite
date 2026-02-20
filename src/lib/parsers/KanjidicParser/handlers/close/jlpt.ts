import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function jlpt(parser: KanjidicParser, text: string) {
  if (parser.character?.misc) {
    parser.character.misc.jlpt = text;
  }
}
