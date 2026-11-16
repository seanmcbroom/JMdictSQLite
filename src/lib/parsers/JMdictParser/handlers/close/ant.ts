import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';
import { parseXRef } from '@/lib/parsers/JMdictParser/parse-xref.js';

export default function ant(parser: JMdictParser, text: string) {
  parser.lastSense?.ant?.push(parseXRef(text));
}
