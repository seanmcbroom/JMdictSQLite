import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function keb(parser: JMdictParser, text: string) {
  const lastKanji = parser.entry?.kanji?.at(-1);

  if (lastKanji) lastKanji.written = text;
}
