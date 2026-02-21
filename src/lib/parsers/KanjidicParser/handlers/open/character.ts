import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';
import type { Character } from '@/lib/types/database.js';

export default function entry(parser: KanjidicParser) {
  parser.character = {
    literal: '',
    codepoint: { cp_values: [] },
    radical: { rad_values: [] },
    reading_meaning: { rmgroups: { readings: [], meanings: [] }, nanori: [] },
    dic_number: { dic_refs: [] },
    query_code: { q_codes: [] },
    misc: {},
  } as Character;
}
