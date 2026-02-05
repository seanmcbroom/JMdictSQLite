import fs from 'node:fs';
import path from 'node:path';

import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';
import type { OpenTagHandlers } from '@/lib/types/parser.js';

export default async function loadHandlers(): Promise<
  OpenTagHandlers<KanjidicParser>
> {
  const dirPath = path.dirname(new URL('./open/', import.meta.url).pathname);
  const files = fs.readdirSync(dirPath);

  const handlers: Partial<OpenTagHandlers<KanjidicParser>> = {};

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const name = path.basename(file, path.extname(file));
      const module = await import(path.join(dirPath, file));
      handlers[name] = module.default;
    }
  }

  return handlers as OpenTagHandlers<KanjidicParser>;
}
