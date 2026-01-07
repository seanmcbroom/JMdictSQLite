import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

export default function entry(parser: JMdictParser) {
  const current = parser.entry;

  if (!current) return;

  parser.bufferRef.push(current);

  if (parser.bufferRef.length >= parser.batchSizeRef) {
    parser.flush();
  }

  parser.entry = undefined;
}
