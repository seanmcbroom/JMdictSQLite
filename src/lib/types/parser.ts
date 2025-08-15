import type { JmdictParser } from '@/lib/parser/index.js';

export type CloseHandler = (parser: JmdictParser, text: string) => void;
export type OpenHandler = (parser: JmdictParser) => void;
