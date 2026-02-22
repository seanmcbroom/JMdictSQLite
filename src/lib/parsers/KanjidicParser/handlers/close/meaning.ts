import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function meaning(parser: KanjidicParser, text: string) {
  const meaning = parser.character?.reading_meaning?.rmgroups.meanings.at(-1);

  if (meaning) {
    meaning.value = text;
  }
}
