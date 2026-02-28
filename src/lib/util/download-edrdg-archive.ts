import * as ftp from 'basic-ftp';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import * as zlib from 'node:zlib';

import { logger } from '@/lib/util/log.js';

const pipe = promisify(pipeline);

/**
 * Downloads and decompresses a specified archive file (.gz) from the FTP server.
 * @param filename File name without the extension
 * @param basePath Optional base path to save the downloaded and decompressed files (default: 'data')
 * @returns Path to the decompressed XML file, e.g., 'data/JMdict_e.xml'
 */
async function downloadEDRDGArchive(
  filename: string,
  basePath: string = 'data',
): Promise<string> {
  const ftpUrl = 'ftp.edrdg.org';
  const ftpPath = `/pub/Nihongo/${filename}.gz`;
  const localGzPath = path.join(basePath, `${filename}.gz`);
  const localXmlPath = path.join(
    basePath,
    `${filename.endsWith('.xml') ? filename.slice(0, -4) : filename}.xml`, // Prevents double file extensions
  );

  // Ensure data directory exists
  fs.mkdirSync(basePath, { recursive: true });

  const client = new ftp.Client();

  /* Check if the XML file already exists,
   if it does, skip download and decompression. */
  if (fs.existsSync(localXmlPath)) {
    logger.info(`${filename} already exists. Skipping download.`);

    return localXmlPath;
  }

  // Download the .gz file from the FTP server
  try {
    await client.access({
      host: ftpUrl,
      secure: false,
    });

    await client.downloadTo(localGzPath, ftpPath);
  } catch (err) {
    console.error('FTP download failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }

  // Decompress the .gz file to .xml
  try {
    const fileContents = fs.createReadStream(localGzPath);
    const writeStream = fs.createWriteStream(localXmlPath);
    const unzip = zlib.createGunzip();

    await pipe(fileContents, unzip, writeStream);
  } catch (err) {
    console.error('Decompression failed:', err);
    process.exit(1);
  }

  // Delete the .gz file after decompression
  fs.unlinkSync(localGzPath);

  console.log(`Downloaded ${filename} to ${localXmlPath}`);

  return path.resolve(localXmlPath);
}

const downloadJMdict = (outputPath?: string) =>
  downloadEDRDGArchive('JMdict_e', outputPath);
const downloadJMnedict = (outputPath?: string) =>
  downloadEDRDGArchive('JMnedict_e', outputPath);
const downloadKanjidic = (outputPath?: string) =>
  downloadEDRDGArchive('kanjidic2.xml', outputPath);

export { downloadJMdict, downloadJMnedict, downloadKanjidic };
