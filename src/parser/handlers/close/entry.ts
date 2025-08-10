import type { JmdictParser } from '@/parser/index.js';

export default function entry(parser: JmdictParser) {
  const current = parser.entry;

  if (!current) return;

  parser.bufferRef.push(current);

  if (parser.bufferRef.length >= parser.batchSizeRef) {
    parser.flush();
  }

  parser.entry = undefined;
}
