import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function nanori(parser: KanjidicParser, text: string) {
  parser.character?.reading_meaning?.nanori?.push(text);
}
