# JMdictSQLite
A lightweight, SQLite-compatible version of the JMdict Japanese-English dictionary.<br>
*Automatic daily releases @ 5AM UTC.*

**⬇️ Download latest:** [jmdict.sqlite](https://github.com/seanmcbroom/JMdictSQLite/releases/download/latest/jmdict.sqlite)

## What is the purpose?
This project transforms the JMdict XML dataset into a normalized, developer-friendly SQLite format for use in apps, browser extensions, or any application needing a fast, local Japanese-English dictionary.
- Designed for easy integration into apps and tools
- Compact schema with JSON-encoded kanji, kana, and sense data
- Ideal for full-text search, filtering, and offline usage

## 🗂️ _Database Schema Diagram_
*`PK`* — Primary Key: uniquely identifies a row in the table.<br>
*`FK`* — Foreign Key: links a row to another table’s primary key.<br>
*`?`* — Possibly Undefined: the field may be NULL or omitted.<br>
*`JSON-encoded`* — The column stores JSON data (arrays or objects).<br>
*`AUTOINC`* — Auto-increment: the database automatically assigns a unique number.<br>
*`entries.ent_seq → senses.ent_seq`* — One-to-Many relationship:<br>
Each entry can have multiple senses, but each sense belongs to exactly one entry.<br>
```
┌────────────────────────────────────┐            ┌───────────────────────────────────────────────────┐
│              entries               │◄───────────│                    senses                         │
├────────────────────────────────────┤            ├───────────────────────────────────────────────────┤
│ ent_seq   INTEGER       PK         │◄────┐      │ id          INTEGER  PK AUTOINC                   │
│ kanji?    TEXT                     │     └────► │ ent_seq     INTEGER  FK → entries.ent_seq         │
│          – JSON-encoded            │            | lang?       TEXT                                  |
│ kana      TEXT                     │            | note?       TEXT                                  | 
│          – JSON-encoded            │            │ glosses     TEXT     (JSON-encoded)               │
└────────────────────────────────────┘            │ pos         TEXT     (JSON-encoded)               │
                                                  | field?      TEXT     (JSON-encoded)               |
                                                  | tags?       TEXT     (JSON-encoded)               |
                                                  | refs?       TEXT     (JSON-encoded)               |
                                                  └───────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                 kanji                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ literal        TEXT        PK                                                │
│ codepoint      TEXT        (JSON-encoded)                                    │
│ radical        TEXT        (JSON-encoded)                                    │
│ reading_meaning TEXT       (JSON-encoded)                                    │
│ dic_number?    TEXT        (JSON-encoded)                                    │
│ query_code?    TEXT        (JSON-encoded)                                    │
│ misc?          TEXT        (JSON-encoded)                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```
### 📝 SQLite Query Types (TypeScript)
```ts
/**
 * These interfaces represent the exact shape of the data as stored in the SQLite database.
 * All complex fields (arrays, objects) are stored as JSON strings.
 * This allows for flexible storage while keeping the database schema simple.
 * When retrieving data, these JSON strings can be parsed back into their original structures.
 */

// -------------------------
// Entries & Senses
// -------------------------
export interface Entry {
  ent_seq: number; // Primary Key
  kanji?: string; // JSON.stringify(Written[])
  kana: string; // JSON.stringify(Written[])
}

export interface Sense {
  id: number; // Primary Key (AUTOINC)
  ent_seq: number; // Foreign Key → entries.ent_seq
  lang?: string;
  note?: string;
  glosses: string; // JSON.stringify(string[])
  pos: string; // JSON.stringify(string[])
  fields?: string; // JSON.stringify(string[])
  tags?: string; // JSON.stringify(string[])
  refs?: string; // JSON.stringify(Ref[])
}

// JMdict-related JSON helper types
export interface Written {
  written: string;
  tags?: [];
  restr?: [];
}

export interface Ref {
  type: 'see' | 'ant';
  ent_seq: number;
  sense_id: number;
  written: string;
}

// -------------------------
// Kanji (KANJIDIC2)
// -------------------------
export interface Character {
  literal: string; // Primary Key
  codepoint: string; // JSON.stringify(Codepoint)
  radical: string; // JSON.stringify(Radical)
  reading_meaning?: string; // JSON.stringify(ReadingMeaning)
  dic_number?: string; // JSON.stringify(DicNumber)
  query_code?: string; // JSON.stringify(QueryCode)
  misc?: string; // JSON.stringify(Misc)
}

// Kanji-related JSON helper types
export interface Codepoint {
  cp_values: CpValue[];
}

export interface CpValue {
  cp_type: string;
  value?: string;
}

export interface Radical {
  rad_values: RadValue[];
}

export interface RadValue {
  rad_type: string;
  value?: string;
}

export interface ReadingMeaning {
  rmgroups: RMGroup;
  nanori?: string[];
}

export interface RMGroup {
  readings: Reading[];
  meanings: Meaning[];
}

export interface Reading {
  r_type: string;
  value?: string;
}

export interface Meaning {
  m_lang?: string;
  value?: string;
}

export interface DicNumber {
  dic_refs: DicRef[];
}

export interface DicRef {
  dr_type: string;
  m_vol?: string;
  m_page?: string;
  value?: string;
}

export interface QueryCode {
  q_codes: QCode[];
}

export interface QCode {
  qc_type: string;
  value?: string;
}

export interface Misc {
  grade?: string;
  stroke_count?: string;
  variants?: Variant[];
  freq?: string;
  rad_name?: string[];
  jlpt?: string;
}

export interface Variant {
  var_type: string;
  value?: string;
}
```

## Example Query
This SQL query retrieves all entries that contain at least one of the specified tags (`ichi1` or `nf01`) in any of their associated `kanji` objects.
It works by iterating through the kanji array of each entry using json_each, and then checking whether the tags array within each kanji object contains any of the target tags.

To perform an inclusive (AND) search, where all specified tags must be present, change `>= 1` to `= 2` (or however many tags you're searching for).
```sql
SELECT *
FROM entries
WHERE EXISTS (
  SELECT 1
  FROM json_each(entries.kanji) AS kanji_obj
  WHERE (
    SELECT COUNT(DISTINCT tag.value)
    FROM json_each(json_extract(kanji_obj.value, '$.tags')) AS tag
    WHERE tag.value IN ('ichi1', 'nf01')
  ) >= 1
);
```

## 🤝 Contributing

I welcome anyone with interest to contribute! Please read the [Contributing Guide](./.github/CONTRIBUTING.md) for details on how to get started.

## 📜 License
This project contains components originally created by the **Electronic Dictionary Research and Development Group (EDRDG)**. These components are derived from data licensed under the **GNU General Public License Version 2 (GPLv2)**.
You are free to use, modify, and distribute this software under the terms of the GPLv2. A copy of the full license is included in the `LICENSE` file.
