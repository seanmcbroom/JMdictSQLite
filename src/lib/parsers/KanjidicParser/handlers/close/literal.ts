import type { KanjidicParser } from '../../KanjidicParser';

export default function literal(parser: KanjidicParser, text: string) {
  if (parser.character) {
    parser.character.literal = text;
  }
}
