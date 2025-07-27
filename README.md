Automatic daily releases.
Availible for download at https://github.com/seanmcbroom/JMdictSQLite/releases/download/latest/jmdict.sqlite

Database Schema Diagram
┌────────────────────────────────────┐            ┌──────────────────────────────────────────────────┐
│              entries               │◄───────────│                    senses                       │
├────────────────────────────────────┤            ├──────────────────────────────────────────────────┤
│ ent_seq   INTEGER       PK         │◄────┐      │ id       INTEGER     PK AUTOINC                  │
│ kanji     TEXT          (array)    │     └────▶│ ent_seq  INTEGER     FK → entries.ent_seq        │
│          – semicolon-delimited     │            │ gloss    TEXT        (array, semicolon-delimited)│
│ kana      TEXT          (array)    │            │ pos      TEXT        (array, semicolon-delimited)│
│          – semicolon-delimited     │            └──────────────────────────────────────────────────┘
└────────────────────────────────────┘
PK = Primary Key
FK = Foreign Key
entries.ent_seq ⇄ senses.ent_seq (one-to-many)
