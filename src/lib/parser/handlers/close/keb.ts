import type { JmdictParser } from '@/lib/parser/index.js';

export default function keb(parser: JmdictParser, text: string) {
  const lastKanji = parser.entry?.kanji?.at(-1);

  if (lastKanji) lastKanji.written = text;
}
