import { equal, rejects } from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import zlib from 'node:zlib';

import { gunzipFile } from '@/lib/util/download-edrdg-archive.js';

describe('Source archive decompression', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jmdict-gunzip-'));

  after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it('decompresses a gzip file', async () => {
    const gz = path.join(tmp, 'ok.xml.gz');
    const out = path.join(tmp, 'ok.xml');

    fs.writeFileSync(gz, zlib.gzipSync('<JMdict></JMdict>'));

    await gunzipFile(gz, out);

    equal(fs.readFileSync(out, 'utf8'), '<JMdict></JMdict>');
    equal(fs.existsSync(`${out}.tmp`), false);
  });

  it('leaves no partial output when the archive is truncated', async () => {
    const gz = path.join(tmp, 'truncated.xml.gz');
    const out = path.join(tmp, 'truncated.xml');
    const full = zlib.gzipSync('<JMdict>' + 'x'.repeat(100_000) + '</JMdict>');

    fs.writeFileSync(gz, full.subarray(0, full.length / 2));

    await rejects(gunzipFile(gz, out));

    equal(fs.existsSync(out), false, 'truncated XML was left behind');
    equal(fs.existsSync(`${out}.tmp`), false);
  });
});
