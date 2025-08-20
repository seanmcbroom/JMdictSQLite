// SQL Query Types
// Represents the exact shape stored in SQLite

export interface EntryQuery {
  ent_seq: number; // PK
  kanji?: string; // JSON.stringify(WrittenElement[])
  kana: string; // JSON.stringify(WrittenElement[])
}

export interface SenseQuery {
  id: number; // PK
  ent_seq: number; // FK
  note?: string;
  glosses: string; // JSON.stringify(string[])
  pos: string; // JSON.stringify(string[])
  verb_data?: string; // JSON.stringify(VerbData)
  fields?: string; // JSON.stringify(string[])
  tags?: string; // JSON.stringify(string[])
  ref?: string; // JSON.stringify(string[])
}

// Represents a written element (after JSON.parse)
export interface WrittenQuery {
  written: string;
  tags?: [];
}

// Represents a reference to another sense (after JSON.parse)
export interface RefQuery {
  type: 'see' | 'ant';
  ent_seq: number;
  sense_id: number;
  written: string;
}

// Represents verb-specific metadata (after JSON.parse)
export interface VerbDataSQL {
  verb_group: string;
  transivity?: string;
}
