import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function cp_value(parser: KanjidicParser, text: string) {
  const cpValue = parser.character?.codepoint?.cp_values.at(-1);

  if (cpValue) {
    cpValue.value = text;
  }
}
