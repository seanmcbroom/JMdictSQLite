import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function variant(parser: KanjidicParser, text: string) {
  const variant = parser.character?.misc?.variants?.at(-1);

  if (variant) {
    variant.value = text;
  }
}
