import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function grade(parser: KanjidicParser, text: string) {
  if (parser.character?.misc) {
    parser.character.misc.grade = text;
  }
}
