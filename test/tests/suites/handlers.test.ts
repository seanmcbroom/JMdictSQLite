import { deepEqual, equal, ok } from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import loadJMdictClose from '@/lib/parsers/JMdictParser/handlers/close/index.js';
import loadJMdictOpen from '@/lib/parsers/JMdictParser/handlers/open/index.js';
import loadKanjidicClose from '@/lib/parsers/KanjidicParser/handlers/close/index.js';
import loadKanjidicOpen from '@/lib/parsers/KanjidicParser/handlers/open/index.js';
import { loadHandlerDir } from '@/lib/util/load-handler-dir.js';

describe('Tag handler loading', () => {
  it('loads every parser handler directory', async () => {
    const cases = [
      [await loadJMdictOpen(), ['entry', 'sense']],
      [await loadJMdictClose(), ['entry', 'gloss', 'keb', 'reb']],
      [await loadKanjidicOpen(), ['character', 'reading']],
      [await loadKanjidicClose(), ['character', 'literal']],
    ] as const;

    for (const [handlers, expected] of cases) {
      for (const name of expected) {
        equal(typeof handlers[name], 'function', `missing handler "${name}"`);
      }

      ok(!('index' in handlers), 'index module registered as a handler');
    }
  });

  describe('loadHandlerDir', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jmdict-handlers-'));
    // A space forces URL encoding (%20) of the directory path.
    const dir = path.join(tmp, 'handlers with space');

    after(() => fs.rmSync(tmp, { recursive: true, force: true }));

    it('works when the directory path needs URL encoding', async () => {
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
      fs.writeFileSync(path.join(dir, 'gloss.js'), 'export default () => 1;');
      fs.writeFileSync(path.join(dir, 'index.js'), 'export default null;');
      fs.writeFileSync(path.join(dir, 'notes.txt'), 'not a handler');

      const handlers = await loadHandlerDir<() => number>(
        pathToFileURL(path.join(dir, 'index.js')).href,
      );

      deepEqual(Object.keys(handlers), ['gloss']);
      equal(handlers.gloss(), 1);
    });
  });
});
