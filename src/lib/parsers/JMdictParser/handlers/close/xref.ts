import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';
import { parseXRef } from '@/lib/parsers/JMdictParser/parse-xref.js';

export default function xref(parser: JMdictParser, text: string) {
  parser.lastSense?.see?.push(parseXRef(text));
}
