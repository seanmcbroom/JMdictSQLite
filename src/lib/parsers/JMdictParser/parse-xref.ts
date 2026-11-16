import type { Ref } from '@/lib/types/database.js';

const SENSE_NUMBER = /^\d+$/;

/**
 * Parses the text of an `<xref>` or `<ant>` element.
 *
 * JMdict separates the parts with a centre dot (`・`): `keb`, `reb`,
 * `keb・reb`, and any of these followed by a sense number, e.g.
 * `丸・まる・1`. A trailing number is always the sense.
 *
 * A few targets contain a centre dot themselves (e.g.
 * `プレストレスト・コンクリート`); these parse as `written・reading`, and
 * the resolver retries them as a single form.
 */
export function parseXRef(text: string): Ref {
  const parts = text.split('・');
  const last = parts.at(-1) ?? '';
  const ref: Ref = { written: '' };

  if (parts.length > 1 && SENSE_NUMBER.test(last)) {
    ref.sense = Number(parts.pop());
  }

  if (parts.length > 2) {
    // More parts than keb・reb: treat the whole text as one form.
    ref.written = parts.join('・');
  } else {
    ref.written = parts[0] ?? '';

    if (parts[1] !== undefined) ref.reading = parts[1];
  }

  return ref;
}
