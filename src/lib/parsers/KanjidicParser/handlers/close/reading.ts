import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function reading(parser: KanjidicParser, text: string) {
  const reading = parser.character?.reading_meaning?.rmgroups.readings.at(-1);

  if (reading) {
    reading.value = text;
  }
}
