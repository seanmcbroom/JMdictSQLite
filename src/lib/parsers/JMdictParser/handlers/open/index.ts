import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';
import type { Entry } from '@/lib/types/database.js';
import type { OpenTagHandler, OpenTagHandlers } from '@/lib/types/parser.js';
import { loadHandlerDir } from '@/lib/util/load-handler-dir.js';

export default function loadHandlers(): Promise<
  OpenTagHandlers<JMdictParser, Entry>
> {
  return loadHandlerDir<OpenTagHandler<JMdictParser, Entry>>(import.meta.url);
}
