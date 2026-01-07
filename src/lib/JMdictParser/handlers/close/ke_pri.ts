import type { JMdictParser } from '@/lib/JMdictParser/index.js';

export default function ke_pri(parser: JMdictParser, text: string) {
  parser.entry?.kanji?.at(-1)?.tags?.push(text);
}
