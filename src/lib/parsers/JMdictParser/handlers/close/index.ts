import fs from 'node:fs';
import path from 'node:path';

import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';
import type { Entry } from '@/lib/types/database';
import type { CloseTagHandlers } from '@/lib/types/parser.js';

export default async function loadHandlers(): Promise<
  CloseTagHandlers<JMdictParser, Entry>
> {
  const dirPath = path.dirname(new URL('./close/', import.meta.url).pathname);
  const files = fs.readdirSync(dirPath);

  const handlers: Partial<CloseTagHandlers<JMdictParser, Entry>> = {};

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const name = path.basename(file, path.extname(file));
      const module = await import(path.join(dirPath, file));
      handlers[name] = module.default;
    }
  }

  return handlers as CloseTagHandlers<JMdictParser, Entry>;
}
