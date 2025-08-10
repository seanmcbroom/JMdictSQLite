import type { JmdictParser } from '@/parser/index.js';

export default function reb(parser: JmdictParser, text: string) {
  const lastKana = parser.entry?.kana.at(-1);

  if (lastKana) lastKana.written = text;
}
