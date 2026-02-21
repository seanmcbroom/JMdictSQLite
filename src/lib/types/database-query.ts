/**
 * These interfaces represent the exact shape of the data as stored in the SQLite database.
 * All complex fields (arrays, objects) are stored as JSON strings.
 * This allows for flexible storage while keeping the database schema simple.
 * When retrieving data, these JSON strings can be parsed back into their original structures.
 */

// -------------------------
// Entries & Senses
// -------------------------
export interface Entry {
  ent_seq: number; // Primary Key
  kanji?: string; // JSON.stringify(Written[])
  kana: string; // JSON.stringify(Written[])
}

export interface Sense {
  id: number; // Primary Key (AUTOINC)
  ent_seq: number; // Foreign Key → entries.ent_seq
  lang?: string;
  note?: string;
  glosses: string; // JSON.stringify(string[])
  pos: string; // JSON.stringify(string[])
  verb_data?: string; // JSON.stringify(VerbData)
  fields?: string; // JSON.stringify(string[])
  tags?: string; // JSON.stringify(string[])
  refs?: string; // JSON.stringify(Ref[])
}

// JMdict-related JSON helper types
export interface Written {
  written: string;
  tags?: [];
  restr?: [];
}

export interface Ref {
  type: 'see' | 'ant';
  ent_seq: number;
  sense_id: number;
  written: string;
}

export interface VerbData {
  verb_group: string;
  transitive?: boolean;
  auxiliary?: boolean;
}

// -------------------------
// Kanji (KANJIDIC2)
// -------------------------
export interface KanjiRow {
  literal: string; // Primary Key
  codepoint: string; // JSON.stringify(Codepoint)
  radical: string; // JSON.stringify(Radical)
  reading_meaning?: string; // JSON.stringify(ReadingMeaning)
  dic_number?: string; // JSON.stringify(DicNumber)
  query_code?: string; // JSON.stringify(QueryCode)
  misc?: string; // JSON.stringify(Misc)
}

// Kanji-related JSON helper types
export interface Codepoint {
  cp_values: CpValue[];
}

export interface CpValue {
  cp_type: string;
  value?: string;
}

export interface Radical {
  rad_values: RadValue[];
}

export interface RadValue {
  rad_type: string;
  value?: string;
}

export interface ReadingMeaning {
  rmgroups: RMGroup;
  nanori?: string[];
}

export interface RMGroup {
  readings: Reading[];
  meanings: Meaning[];
}

export interface Reading {
  r_type: string;
  value?: string;
}

export interface Meaning {
  m_lang?: string;
  value?: string;
}

export interface DicNumber {
  dic_refs: DicRef[];
}

export interface DicRef {
  dr_type: string;
  m_vol?: string;
  m_page?: string;
  value?: string;
}

export interface QueryCode {
  q_codes: QCode[];
}

export interface QCode {
  qc_type: string;
  value?: string;
}

export interface Misc {
  grade?: string;
  stroke_count?: string;
  variants?: Variant[];
  freq?: string;
  rad_name?: string[];
  jlpt?: string;
}

export interface Variant {
  var_type: string;
  value?: string;
}
