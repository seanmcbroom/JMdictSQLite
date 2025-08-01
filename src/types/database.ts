export interface Entry {
  ent_seq: number; // PK
  kanji?: Written[];
  kana: Written[];
  senses: Sense[];
}

export interface Written {
  written: string;
  tags?: string[];
}

export interface Sense {
  id: number; // PK
  ent_seq: number; // FK
  note?: string;
  glosses: string[];
  pos: string[];
  verb_data?: VerbData;
  fields?: string[];
  tags?: string[];
}

export interface VerbData {
  verb_group: string;
  transivity?: string;
}

export interface EntryDb {
  ent_seq: number; // PK
  kanji?: string; // JSON.stringify(WrittenElement[])
  kana: string; // JSON.stringify(WrittenElement[])
}

export interface SenseDb {
  id: number; // PK
  ent_seq: number; // FK
  note?: string;
  glosses: string; // JSON.stringify(string[])
  pos: string; // JSON.stringify(string[])
  verb_data?: string; // JSON.stringify(VerbData)
  fields?: string; // JSON.stringify(VerbData)
  tags?: string; // JSON.stringify(VerbData)
}
