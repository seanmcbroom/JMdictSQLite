import type { tags } from '@/constants/tags.js';

export type PosTag = (typeof tags.pos)[number];
export type MiscTag = (typeof tags.misc)[number];
export type FieldTag = (typeof tags.field)[number];
export type PriorityTag = (typeof tags.priority)[number];
export type DialectTag = (typeof tags.dialect)[number];
export type KanjiTag = (typeof tags.kanji)[number];

export type AllTag = PosTag | MiscTag | FieldTag | PriorityTag | DialectTag | KanjiTag;
