import type { Tag } from 'sax';

import type { JMdictParser } from '@/lib/parser/index.js';

export type CloseHandler = (parser: JMdictParser, text: string) => void;
export type OpenHandler = (parser: JMdictParser, attributes: Tag['attributes']) => void;
