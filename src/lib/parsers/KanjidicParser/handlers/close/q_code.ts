import type { KanjidicParser } from '../../KanjidicParser';

export default function q_code(parser: KanjidicParser, text: string) {
  const qCode = parser.character?.query_code?.q_codes.at(-1);

  if (qCode) {
    qCode.value = text;
  }
}
