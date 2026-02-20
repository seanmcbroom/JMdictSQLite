import fs from 'node:fs';
import path from 'node:path';

import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';
import type { Entry } from '@/lib/types/database';
import type { OpenTagHandlers } from '@/lib/types/parser.js';

export default async function loadHandlers(): Promise<
  OpenTagHandlers<JMdictParser, Entry>
> {
  const dirPath = path.dirname(new URL('./open/', import.meta.url).pathname);
  const files = fs.readdirSync(dirPath);

  const handlers: Partial<OpenTagHandlers<JMdictParser, Entry>> = {};

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const name = path.basename(file, path.extname(file));
      const module = await import(path.join(dirPath, file));
      handlers[name] = module.default;
    }
  }

  return handlers as OpenTagHandlers<JMdictParser, Entry>;
}
