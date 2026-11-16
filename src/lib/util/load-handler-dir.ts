import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Imports every handler module next to the calling `index` module and
 * maps each file's base name (the XML tag name) to its default export.
 *
 * Paths go through `fileURLToPath` / `pathToFileURL`, so this works on
 * Windows and with directories whose names need URL encoding.
 *
 * @param indexUrl - `import.meta.url` of the calling index module
 */
export async function loadHandlerDir<H>(
  indexUrl: string,
): Promise<Record<string, H>> {
  const dir = path.dirname(fileURLToPath(indexUrl));
  const handlers: Record<string, H> = {};

  for (const file of fs.readdirSync(dir).sort()) {
    const ext = path.extname(file);

    if (ext !== '.ts' && ext !== '.js') continue;

    const name = path.basename(file, ext);

    if (name === 'index') continue;

    const module = await import(pathToFileURL(path.join(dir, file)).href);

    handlers[name] = module.default;
  }

  return handlers;
}
