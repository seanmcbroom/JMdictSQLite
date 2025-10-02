// Database Types
// Types used for parsing data from JMdict.
// Do not use these types in your SQL querys.
// Instead use the types from database-sql.ts

// Entry Types
export interface Entry {
  ent_seq: number; // PK
  kanji?: Written[];
  kana: Written[];
  senses: Sense[];
}
export interface Written {
  written: string;
  tags?: string[];
  restr?: string[];
}

// Sense Types
export interface Sense {
  id: number; // PK
  ent_seq: number; // FK
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
