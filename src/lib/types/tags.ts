import type { JMdictTags } from '@/lib/constants/JMdictTags.js';

export type TagDictionary = {
  readonly [category: string]: readonly string[];
};

export type PosTag = (typeof JMdictTags.pos)[number];
export type VerbGroupTag = (typeof JMdictTags.verbGroup)[number];
export type TransivityTag = (typeof JMdictTags.transitivity)[number];
export type MiscTag = (typeof JMdictTags.misc)[number];
export type FieldTag = (typeof JMdictTags.field)[number];
export type PriorityTag = (typeof JMdictTags.priority)[number];
export type DialectTag = (typeof JMdictTags.dialect)[number];
export type KanjiTag = (typeof JMdictTags.kanji)[number];

export type AllTag =
  | PosTag
  | VerbGroupTag
  | TransivityTag
  | MiscTag
  | FieldTag
  | PriorityTag
  | DialectTag
  | KanjiTag;
