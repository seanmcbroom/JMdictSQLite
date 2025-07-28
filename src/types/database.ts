export interface Entry {
  ent_seq: number; // PK
  kanji?: Kanji[];
  kana: Kana[];
  senses: Sense[];
}

// entry -> kanji (one-to-many)
export interface Kanji {
  kanji: string;
  tags?: string[]; // array; semi-colon delimited
}

// entry -> kanji (one-to-many)
export interface Kana {
  kana: string;
  tags?: string[]; // array; semi-colon delimited
}

export interface Sense {
  id: number; // PK
  ent_seq: number; // FK
  glosses: string[]; // array; semi-colon delimited
  pos: string[]; // array; semi-colon delimited
  misc?: string[]; // array; semi-colon delimited
  field?: string[]; // array; semi-colon delimited
}