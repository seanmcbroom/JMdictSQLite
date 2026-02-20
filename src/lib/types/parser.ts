import type { Tag } from 'sax';

import type { BaseParser } from '@/lib/parsers/BaseParser/BaseParser.js';

// For <opentag> handlers
export type OpenTagHandler<P extends BaseParser<P, T>, T> = (
  parser: P,
  attrs: Tag['attributes'],
) => void;

// For </closetag> handlers
export type CloseTagHandler<P extends BaseParser<P, T>, T> = (
  parser: P,
  text: string,
) => void;

// Handler maps
export type OpenTagHandlers<P extends BaseParser<P, T>, T> = Record<
  string,
  OpenTagHandler<P, T>
>;

export type CloseTagHandlers<P extends BaseParser<P, T>, T> = Record<
  string,
  CloseTagHandler<P, T>
>;
