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
  fields?: string[];
  tags?: string[];
  verb_group?: string;
  transivity?: string;
}
