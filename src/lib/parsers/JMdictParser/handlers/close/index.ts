import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';
import type { Entry } from '@/lib/types/database.js';
import type { CloseTagHandler, CloseTagHandlers } from '@/lib/types/parser.js';
import { loadHandlerDir } from '@/lib/util/load-handler-dir.js';

export default function loadHandlers(): Promise<
  CloseTagHandlers<JMdictParser, Entry>
> {
  return loadHandlerDir<CloseTagHandler<JMdictParser, Entry>>(import.meta.url);
}
