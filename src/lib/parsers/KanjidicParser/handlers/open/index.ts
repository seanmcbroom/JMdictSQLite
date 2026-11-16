import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';
import type { Character } from '@/lib/types/database.js';
import type { OpenTagHandler, OpenTagHandlers } from '@/lib/types/parser.js';
import { loadHandlerDir } from '@/lib/util/load-handler-dir.js';

export default function loadHandlers(): Promise<
  OpenTagHandlers<KanjidicParser, Character>
> {
  return loadHandlerDir<OpenTagHandler<KanjidicParser, Character>>(
    import.meta.url,
  );
}
