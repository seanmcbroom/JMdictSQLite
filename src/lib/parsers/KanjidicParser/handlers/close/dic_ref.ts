import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function dic_ref(parser: KanjidicParser, text: string) {
  const dicRef = parser.character?.dic_number?.dic_refs.at(-1);

  if (dicRef) {
    dicRef.value = text;
  }
}
