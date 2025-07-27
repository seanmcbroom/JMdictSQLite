Automatic daily releases.<br>
Download: https://github.com/seanmcbroom/JMdictSQLite/releases/download/latest/jmdict.sqlite

**[WARNING]: NOT FINAL**<br>
_Database Schema Diagram_
```
┌────────────────────────────────────┐            ┌───────────────────────────────────────────────────┐
│              entries               │◄───────────│                    senses                         │
├────────────────────────────────────┤            ├───────────────────────────────────────────────────┤
│ ent_seq   INTEGER       PK         │◄────┐      │ id       INTEGER     PK AUTOINC                   │
│ kanji?    TEXT          (array)    │     └────▶│ ent_seq  INTEGER      FK → entries.ent_seq        │
│          – semicolon-delimited     │            │ gloss    TEXT        (array, semicolon-delimited) │
│ kana      TEXT          (array)    │            │ pos      TEXT        (array, semicolon-delimited) │
│          – semicolon-delimited     │            | misc?    TEXT        (array, semicolon-delimited) |
└────────────────────────────────────┘            | field?   TEXT        (array, semicolon-delimited) |
                                                  └───────────────────────────────────────────────────┘
```
PK = Primary Key<br>
FK = Foreign Key<br>
`?` = possibly undefined  
`entries.ent_seq` → `senses.ent_seq` (one-to-many)


## License
This project contains components originally created by the **Electronic Dictionary Research and Development Group (EDRDG)**. These components are derived from data licensed under the **GNU General Public License Version 2 (GPLv2)**.
You are free to use, modify, and distribute this software under the terms of the GPLv2. A copy of the full license is included in the `LICENSE` file.
