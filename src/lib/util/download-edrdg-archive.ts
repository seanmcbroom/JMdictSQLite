import * as ftp from 'basic-ftp';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import * as zlib from 'node:zlib';

import { logger } from '@/lib/util/log.js';

const FTP_HOST = 'ftp.edrdg.org';

/**
 * Decompresses `gzPath` into `outPath`.
 *
 * Output goes to `<outPath>.tmp` and is renamed only once decompression
 * succeeds, so a failed or interrupted run never leaves a truncated file
 * at `outPath`.
 *
 * @throws If the input can't be read or isn't valid gzip data
 */
export async function gunzipFile(gzPath: string, outPath: string) {
  const tmpPath = `${outPath}.tmp`;

  try {
    await pipeline(
      fs.createReadStream(gzPath),
      zlib.createGunzip(),
      fs.createWriteStream(tmpPath),
    );
    fs.renameSync(tmpPath, outPath);
  } finally {
    fs.rmSync(tmpPath, { force: true });
  }
}

/**
 * Downloads a gzipped file from the EDRDG FTP server and decompresses it.
 * An existing decompressed file is reused.
 *
 * @param filename File name without the `.gz` extension
 * @param basePath Directory to save into (default: 'data')
 * @returns Absolute path to the decompressed XML file, e.g. `…/data/JMdict_e.xml`
 * @throws If the download or decompression fails
 */
async function downloadEDRDGArchive(
  filename: string,
  basePath: string = 'data',
): Promise<string> {
  const ftpPath = `/pub/Nihongo/${filename}.gz`;
  const localGzPath = path.resolve(basePath, `${filename}.gz`);
  const localXmlPath = path.resolve(
    basePath,
    `${filename.endsWith('.xml') ? filename.slice(0, -4) : filename}.xml`, // Prevents double file extensions
  );

  if (fs.existsSync(localXmlPath)) {
    logger.info(`${filename} already exists. Skipping download.`);

    return localXmlPath;
  }

  fs.mkdirSync(basePath, { recursive: true });

  const client = new ftp.Client();

  try {
    await client.access({ host: FTP_HOST, secure: false });
    await client.downloadTo(localGzPath, ftpPath);
  } catch (err) {
    fs.rmSync(localGzPath, { force: true });

    throw new Error(`FTP download of ${FTP_HOST}${ftpPath} failed`, {
      cause: err,
    });
  } finally {
    client.close();
  }

  try {
    await gunzipFile(localGzPath, localXmlPath);
  } catch (err) {
    throw new Error(`Decompressing ${localGzPath} failed`, { cause: err });
  } finally {
    fs.rmSync(localGzPath, { force: true });
  }

  logger.info(`Downloaded ${filename} to ${localXmlPath}`);

  return localXmlPath;
}

const downloadJMdict = (outputPath?: string) =>
  downloadEDRDGArchive('JMdict_e', outputPath);
const downloadJMnedict = (outputPath?: string) =>
  downloadEDRDGArchive('JMnedict_e', outputPath);
const downloadKanjidic = (outputPath?: string) =>
  downloadEDRDGArchive('kanjidic2.xml', outputPath);

export { downloadJMdict, downloadJMnedict, downloadKanjidic };
