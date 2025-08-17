export const CREATE_TABLES_SQL = `
   CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS entries (
    ent_seq INTEGER PRIMARY KEY,
    kanji TEXT DEFAULT NULL,
    kana TEXT
  );

  CREATE TABLE IF NOT EXISTS senses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ent_seq INTEGER,
    lang TEXT,
    note TEXT,
    glosses TEXT,
    pos TEXT,
    verb_data TEXT,
    fields TEXT,
    tags TEXT,
    ant TEXT,
    see TEXT,
    refs TEXT,
    FOREIGN KEY (ent_seq) REFERENCES entries(ent_seq)
  );
`;
