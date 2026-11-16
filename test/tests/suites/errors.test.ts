import { rejects } from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Processor } from '@/lib/processor/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kanjidicSample = path.resolve(
  __dirname,
  '../../data/kanjidic2-sample.xml',
);

describe('Processor error handling', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jmdict-errors-'));

  after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it('rejects when the JMdict XML is malformed', async () => {
    const xml = path.join(tmp, 'malformed.xml');

    // <entry> is never closed
    fs.writeFileSync(xml, '<JMdict><entry><ent_seq>1</ent_seq></JMdict>');

    await rejects(
      new Processor({
        jmdictXMLPath: xml,
        kanjidicXMLPath: kanjidicSample,
        outputPath: path.join(tmp, 'malformed.sqlite'),
      }).process(),
      /JMdict parsing failed/,
    );
  });

  it('rejects when the JMdict XML file is missing', async () => {
    await rejects(
      new Processor({
        jmdictXMLPath: path.join(tmp, 'does-not-exist.xml'),
        kanjidicXMLPath: kanjidicSample,
        outputPath: path.join(tmp, 'missing.sqlite'),
      }).process(),
      /JMdict parsing failed/,
    );
  });
});
