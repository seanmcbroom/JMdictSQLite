import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';
import type { Character } from '@/lib/types/database';

export default function entry(parser: KanjidicParser) {
  parser.character = {
    literal: '',
    codepoint: { cp_values: [] },
    radical: { rad_values: [] },
    reading_meaning: { rmgroups: [] },
    dic_number: undefined,
    query_code: undefined,
    misc: undefined,
  } as Character;
}
