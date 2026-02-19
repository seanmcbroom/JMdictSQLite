import type { KanjidicParser } from '../../KanjidicParser';

export default function cp_value(parser: KanjidicParser, text: string) {
  const dicRef = parser.character?.dic_number?.dic_refs.at(-1);

  if (dicRef) {
    dicRef.value = text;
  }
}
