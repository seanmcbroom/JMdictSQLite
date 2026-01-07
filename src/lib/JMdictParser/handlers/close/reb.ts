import type { JMdictParser } from '@/lib/JMdictParser/index.js';

export default function reb(parser: JMdictParser, text: string) {
  const lastKana = parser.entry?.kana.at(-1);

  if (lastKana) lastKana.written = text;
}
