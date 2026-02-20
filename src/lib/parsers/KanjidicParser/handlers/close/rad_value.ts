import type { KanjidicParser } from '../../KanjidicParser';

export default function rad_value(parser: KanjidicParser, text: string) {
  const radValue = parser.character?.radical?.rad_values.at(-1);

  if (radValue) {
    radValue.value = text;
  }
}
