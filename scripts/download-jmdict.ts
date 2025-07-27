import * as ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import * as zlib from 'zlib';

const pipe = promisify(pipeline);

async function downloadJmdict() {
  const ftpUrl = 'ftp.edrdg.org';
  const ftpPath = '/pub/Nihongo/JMdict_e.gz';
  const localGzPath = path.join('data', 'JMdict_e.gz');
  const localXmlPath = path.join('data', 'jmdict.xml');

  // Ensure data directory exists
  fs.mkdirSync('data', { recursive: true });

  // Download file via FTP
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('Connecting to FTP server...');
    await client.access({
      host: ftpUrl,
      secure: false,
    });

    console.log('Downloading JMdict_e.gz...');
    await client.downloadTo(localGzPath, ftpPath);
    console.log(`Downloaded to ${localGzPath}`);
  } catch (err) {
    console.error('FTP download failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }

  // Decompress the .gz file to .xml
  try {
    console.log('Decompressing file...');
    const fileContents = fs.createReadStream(localGzPath);
    const writeStream = fs.createWriteStream(localXmlPath);
    const unzip = zlib.createGunzip();

    await pipe(fileContents, unzip, writeStream);
    console.log(`Decompressed to ${localXmlPath}`);
  } catch (err) {
    console.error('Decompression failed:', err);
    process.exit(1);
  }

  // Clean up the .gz file
  fs.unlinkSync(localGzPath);
  console.log('Cleanup complete.');
}

downloadJmdict();
