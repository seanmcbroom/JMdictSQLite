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
      fields    TEXT DEFAULT NULL CHECK (fields IS NULL OR json_valid(fields)),
      tags      TEXT DEFAULT NULL CHECK (tags IS NULL OR json_valid(tags)),
      ant       TEXT DEFAULT NULL CHECK (ant IS NULL OR json_valid(ant)), -- JSON array of Ref
      see       TEXT DEFAULT NULL CHECK (see IS NULL OR json_valid(see)), -- JSON array of Ref
      refs      TEXT DEFAULT NULL CHECK (refs IS NULL OR json_valid(refs)), -- JSON array of Ref
      FOREIGN KEY (ent_seq) REFERENCES entries(ent_seq)
    );

    CREATE INDEX IF NOT EXISTS idx_senses_ent_seq ON senses(ent_seq);

    -- Kanji characters (KANJIDIC2)
    CREATE TABLE IF NOT EXISTS kanji (
      literal TEXT PRIMARY KEY,

      codepoint     TEXT NOT NULL CHECK (json_valid(codepoint)),
      radical       TEXT NOT NULL CHECK (json_valid(radical)),
      reading_meaning TEXT DEFAULT NULL CHECK (reading_meaning IS NULL OR json_valid(reading_meaning)),
      dic_number    TEXT DEFAULT NULL CHECK (dic_number IS NULL OR json_valid(dic_number)),
      query_code    TEXT DEFAULT NULL CHECK (query_code IS NULL OR json_valid(query_code)),
      misc          TEXT DEFAULT NULL CHECK (misc IS NULL OR json_valid(misc))
    );

    CREATE INDEX IF NOT EXISTS idx_kanji_literal ON kanji(literal);
`;
