import type { Tag } from 'sax';

import type { BaseXMLParser } from '@/lib/parsers/BaseXMLParser/BaseXMLParser.js';

// For <opentag> handlers
export type OpenTagHandler<P extends BaseXMLParser<P, T>, T> = (
  parser: P,
  attrs: Tag['attributes'],
) => void;

// For </closetag> handlers
export type CloseTagHandler<P extends BaseXMLParser<P, T>, T> = (
  parser: P,
  text: string,
) => void;

// Handler maps
export type OpenTagHandlers<P extends BaseXMLParser<P, T>, T> = Record<
  string,
  OpenTagHandler<P, T>
>;

export type CloseTagHandlers<P extends BaseXMLParser<P, T>, T> = Record<
  string,
  CloseTagHandler<P, T>
>;
