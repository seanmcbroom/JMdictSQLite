# JMdictSQLite
A lightweight, SQLite-compatible version of the JMdict Japanese-English dictionary.<br>
*Automatic daily releases @ 5AM UTC.*

**Download latest:** https://github.com/seanmcbroom/JMdictSQLite/releases/download/latest/jmdict.sqlite

## What is the purpose?
This project transforms the JMdict XML dataset into a normalized, developer-friendly SQLite format for use in apps, browser extensions, or any application needing a fast, local Japanese-English dictionary.
- Designed for easy integration into apps and tools
- Compact schema with JSON-encoded kanji, kana, and sense data
- Ideal for full-text search, filtering, and offline usage

## _Database Schema Diagram_
**⚠️[WARNING]: NOT FINAL**<br>
PK = Primary Key<br>
FK = Foreign Key<br>
`?` = possibly undefined<br>
`entries.ent_seq` → `senses.ent_seq` (one-to-many)
```
┌────────────────────────────────────┐            ┌───────────────────────────────────────────────────┐
│              entries               │◄───────────│                    senses                         │
├────────────────────────────────────┤            ├───────────────────────────────────────────────────┤
│ ent_seq   INTEGER       PK         │◄────┐      │ id       INTEGER     PK AUTOINC                   │
│ kanji?    TEXT                     │     └────▶│ ent_seq  INTEGER      FK → entries.ent_seq        │
│          – JSON-encoded            │            | note?    TEXT                                     | 
│ kana      TEXT                     │            │ gloss    TEXT        (JSON-encoded)               │
│          – JSON-encoded            │            │ pos      TEXT        (JSON-encoded)               │
└────────────────────────────────────┘            | field?   TEXT        (JSON-encoded)               |
                                                  | tags?    TEXT        (JSON-encoded)               |
                                                  └───────────────────────────────────────────────────┘
```
```ts
interface entry {
  ent_seq: number // PK
  kanji?: kanji[]
  kana: kana[]
}

interface kanji {
  kanji: string
  tags?: []
}

interface kana {
  kana: string
  tags?: []
}

interface sense {
  id: number // PK
  ent_seq: number // FK
  note?: string
  gloss: string[]
  pos: string[]
  field?: string[]
  tags?: string[]
}
```

# Example Query
This SQL query retrieves all entries that contain at least one of the specified tags (`ichi1` or `spec1`) in any of their associated `kanji` objects.
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
    WHERE tag.value IN ('ichi1', 'spec1')
  ) >= 1
);
```

## License
This project contains components originally created by the **Electronic Dictionary Research and Development Group (EDRDG)**. These components are derived from data licensed under the **GNU General Public License Version 2 (GPLv2)**.
You are free to use, modify, and distribute this software under the terms of the GPLv2. A copy of the full license is included in the `LICENSE` file.
