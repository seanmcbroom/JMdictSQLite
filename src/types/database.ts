export interface Entry {
  ent_seq: number; // PK
  kanji?: WrittenElement[];
  kana: WrittenElement[];
  senses: Sense[];
}

export interface WrittenElement {
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
  verb_group?: string;
  transivity?: string;
}
