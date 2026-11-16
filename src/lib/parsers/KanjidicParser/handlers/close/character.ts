import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function character(parser: KanjidicParser) {
  const current = parser.character;

  if (!current) return;

  parser.character = undefined;

  parser.enqueue(current);
}
