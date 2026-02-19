import type { KanjidicParser } from '../../KanjidicParser';

export default function dic_ref(parser: KanjidicParser, text: string) {
  const dicRef = parser.character?.dic_number?.dic_refs.at(-1);

  if (dicRef) {
    dicRef.value = text;
  }
}
