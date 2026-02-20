import type { KanjidicParser } from '../../KanjidicParser';

export default function character(parser: KanjidicParser) {
  const current = parser.character;

  if (!current) return;

  parser.bufferRef.push(current);

  parser.character = undefined;
}
