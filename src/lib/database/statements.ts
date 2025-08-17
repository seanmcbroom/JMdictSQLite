export const INSERT_ENTRY_SQL = `
  INSERT OR IGNORE INTO entries (ent_seq, kanji, kana) VALUES (?, ?, ?)
`;

export const INSERT_SENSE_SQL = `
  INSERT INTO senses (ent_seq, lang, note, glosses, pos, verb_data, fields, tags, ant, see) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
