import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function literal(parser: KanjidicParser, text: string) {
  if (parser.character) {
    parser.character.literal = text;
  }
}
