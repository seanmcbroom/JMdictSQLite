import type { TagDictionary } from '@/lib/types/tags';

/**
 * Tag categories used in Kanjidic-based parsing.
 */
export const KanjidicTags: TagDictionary = {};

/**
 * Returns the category of a given tag string.
 * If unknown, returns `undefined`.
 */
export const tagCategoryMap = Object.fromEntries(
  Object.entries(KanjidicTags).flatMap(([category, values]) =>
    values.map(tag => [tag, category as keyof typeof KanjidicTags]),
  ),
);
