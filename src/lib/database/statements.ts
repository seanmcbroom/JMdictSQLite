export const INSERT_ENTRY_SQL = `
  INSERT OR IGNORE INTO entries (ent_seq, kanji, kana) VALUES (?, ?, ?)
`;

export const INSERT_SENSE_SQL = `
  INSERT INTO senses (ent_seq, lang, note, glosses, pos, verb_data, fields, tags, ant, see) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const INSERT_CHARACTER_SQL = `
  INSERT OR REPLACE INTO characters (
    literal,
    codepoint,
    radical,
    reading_meaning,
    dic_number,
    query_code,
    misc
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`;
