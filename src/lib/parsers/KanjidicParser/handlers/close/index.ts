import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';
import type { Character } from '@/lib/types/database.js';
import type { CloseTagHandler, CloseTagHandlers } from '@/lib/types/parser.js';
import { loadHandlerDir } from '@/lib/util/load-handler-dir.js';

export default function loadHandlers(): Promise<
  CloseTagHandlers<KanjidicParser, Character>
> {
  return loadHandlerDir<CloseTagHandler<KanjidicParser, Character>>(
    import.meta.url,
  );
}
