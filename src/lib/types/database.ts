/**
 * Types used for **parsing JMdict/Kanjidic XML data**.
 *
 * ⚠️ Note:
 * - These types are intended for **in-memory parsing and manipulation**.
 * - Do **not** use them directly in SQL queries.
 * - For database queries, use the types defined in `database-sql.ts`.
 */

// -------------------------
// JMDICT Database Types
// -------------------------

export interface Entry {
  ent_seq: number;
  kanji?: Written[];
  kana: Written[];
  senses: Sense[];
}

export interface Written {
  written: string;
  tags?: string[];
  restr?: string[];
}
export interface Sense {
  id: number;
  ent_seq: number;
  lang: string;
  note?: string;
  glosses: string[];
  pos: string[];
  verb_data?: VerbData;
  fields?: string[];
  tags?: string[];
  ant?: Ref[];
  see?: Ref[];
}

export interface Ref {
  written: string;
  index?: string;
}

export interface VerbData {
  verb_group: string;
  transitive?: true;
  auxiliary?: true;
}

// -------------------------
// KANJIDIC Database Types
// -------------------------

export interface KanjidicFile {
  header: Header;
  characters: Character[];
}

export interface Header {
  file_version: string;
  database_version: string;
  date_of_creation: string;
}

export interface Character {
  literal: string; // The kanji itself
  codepoint: Codepoint; // Unicode/codepoint info
  dic_number?: DicNumber; // Optional dictionary numbers
  query_code?: QueryCode; // Optional query codes
  radical: Radical; // Radical info
  reading_meaning: ReadingMeaning; // Readings & meanings
  misc?: Misc; // Optional metadata
}

export interface Codepoint {
  cp_values: CpValue[]; // Usually multiple types, e.g., UCS, JIS
}

export interface CpValue {
  cp_type: string; // Attribute, e.g., "ucs"
  value?: string; // Codepoint value
}

export interface DicNumber {
  dic_refs: DicRef[];
}

export interface DicRef {
  dr_type: string; // Dictionary type, e.g., "nelson_c"
  m_vol?: string; // Optional volume info
  m_page?: string; // Optional page info
  value?: string;
}

export interface QueryCode {
  q_codes: QCode[];
}

export interface QCode {
  qc_type: string; // Type of query code
  value?: string;
}

export interface Radical {
  rad_values: RadValue[];
}

export interface RadValue {
  rad_type: string; // Radical type, e.g., "classical"
  value?: string; // Radical number or identifier
}

export interface ReadingMeaning {
  rmgroups: RMGroup;
  nanori?: string[]; // Name-only readings
}

export interface RMGroup {
  readings: Reading[];
  meanings: Meaning[];
}

export interface Reading {
  r_type: string; // e.g., "ja_on", "ja_kun"
  value?: string;
}

export interface Meaning {
  m_lang?: string; // Optional language attribute
  value?: string;
}

export interface Misc {
  grade?: string;
  stroke_count?: string;
  variant?: Variant[];
  freq?: string;
  rad_name?: string[];
  jlpt?: string;
}

export interface Variant {
  var_type: string;
  value: string;
}

/**
Kanjidic structure reference

header {
    file_version
    database_version
    date_of_creation
}
character {
    literal
    codepoint {
        cp_value
    }

    dic_number {
        dic_ref
    }

    query_code {
        q_code
    }

    radical {
        rad_value
    }

    reading_meaning {
        rmgroup {
            reading
            meaning
        }
        nanori
    }

    misc {
        grade
        stroke_count
        variant // NOT DONE YET
        freq // NOT DONE YET
        rad_name // NOT DONE YET
        jlpt // NOT DONE YET
    }
}
*/
