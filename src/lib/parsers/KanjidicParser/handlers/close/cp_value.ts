import type { KanjidicParser } from '../../KanjidicParser';

export default function cp_value(parser: KanjidicParser, text: string) {
  const cpValue = parser.character?.codepoint?.cp_values.at(-1);

  if (cpValue) {
    cpValue.value = text;
  }

  console.log('cp_value:', cpValue);
}
