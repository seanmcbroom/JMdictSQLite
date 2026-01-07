import type { Tag } from 'sax';

import type { KanjidicParser } from '@/lib/KanjidicParser/index.js';

export type CloseHandler = (parser: KanjidicParser, text: string) => void;
export type OpenHandler = (parser: KanjidicParser, attributes: Tag['attributes']) => void;
