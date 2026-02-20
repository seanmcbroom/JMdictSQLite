import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function stroke_count(parser: KanjidicParser, text: string) {
  if (parser.character?.misc) {
    parser.character.misc.stroke_count = text;
  }
}
