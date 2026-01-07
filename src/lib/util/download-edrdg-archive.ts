import * as ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import * as zlib from 'zlib';

const pipe = promisify(pipeline);

/**
 * Downloads and decompresses a specified archive file (.gz) from the FTP server.
 * @param filename File name without the extension
 * @returns Path to the decompressed XML file, e.g., 'data/JMdict_e.xml'
 */
async function downloadEDRDGArchive(filename: string): Promise<string> {
  const ftpUrl = 'ftp.edrdg.org';
  const ftpPath = `/pub/Nihongo/${filename}.gz`;
  const localGzPath = path.join('data', `${filename}.gz`);
  const localXmlPath = path.join(
    'data',
    `${filename.endsWith('.xml') ? filename.slice(0, -4) : filename}.xml`, // Prevents double file extensions
  );

  // Ensure data directory exists
  fs.mkdirSync('data', { recursive: true });

  const client = new ftp.Client();

  /* Check if the XML file already exists,
   if it does, skip download and decompression. */
  if (fs.existsSync(localXmlPath)) {
    console.log(`${filename} already exists. Skipping download.`);

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

  return localXmlPath;
}

const downloadJMdict = () => downloadEDRDGArchive('JMdict_e');
const downloadJMnedict = () => downloadEDRDGArchive('JMnedict_e');
const downloadKanjidic = () => downloadEDRDGArchive('kanjidic2.xml');

export { downloadJMdict, downloadJMnedict, downloadKanjidic };
