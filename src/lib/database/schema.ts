export const CREATE_TABLES_SQL = `
    -- Meta info table
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Dictionary entries
    CREATE TABLE IF NOT EXISTS entries (
      ent_seq INTEGER PRIMARY KEY,
      kanji TEXT CHECK (kanji IS NULL OR json_valid(kanji)), -- JSON array of Written[]
      kana  TEXT NOT NULL CHECK (json_valid(kana))          -- JSON array of Written[]
    );

    -- Word senses
    CREATE TABLE IF NOT EXISTS senses (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      ent_seq   INTEGER NOT NULL,
      lang      TEXT DEFAULT NULL,
      note      TEXT DEFAULT NULL,
      glosses   TEXT NOT NULL CHECK (json_valid(glosses)), -- JSON array of gloss strings
      pos       TEXT NOT NULL CHECK (json_valid(pos)),     -- JSON array of POS tags
      verb_data TEXT DEFAULT NULL CHECK (verb_data IS NULL OR json_valid(verb_data)),
      fields    TEXT DEFAULT NULL CHECK (fields IS NULL OR json_valid(fields)),
      tags      TEXT DEFAULT NULL CHECK (tags IS NULL OR json_valid(tags)),
      ant       TEXT DEFAULT NULL CHECK (ant IS NULL OR json_valid(ant)), -- JSON array of Ref
      see       TEXT DEFAULT NULL CHECK (see IS NULL OR json_valid(see)), -- JSON array of Ref
      refs      TEXT DEFAULT NULL CHECK (refs IS NULL OR json_valid(refs)), -- JSON array of Ref
      FOREIGN KEY (ent_seq) REFERENCES entries(ent_seq)
    );

    CREATE INDEX IF NOT EXISTS idx_senses_ent_seq ON senses(ent_seq);
`;
