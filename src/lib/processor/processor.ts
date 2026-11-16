import fs from 'node:fs';

import { JMDictSQLiteDatabase } from '@/lib/database/index.js';
import { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';
import { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';
import { EntityReplace } from '@/lib/util/EntityReplace.js';
import { logger } from '@/lib/util/log.js';

/**
 * Orchestrates parsing of JMdict and Kanjidic XML files and
 * persists the parsed data into a SQLite database.
 *
 * This class is responsible for:
 * - Creating and managing the database connection
 * - Streaming XML files from disk
 * - Replacing XML entities using predefined tag mappings
 * - Delegating parsing logic to the appropriate parser
 */
export class Processor {
  private readonly jmdictXMLPath: string;
  private readonly kanjidicXMLPath: string;
  private readonly outputPath: string;
  private readonly db: JMDictSQLiteDatabase;

  /**
   * Creates a new Processor instance.
   *
   * @param params - Configuration options for the processor
   * @param params.jmdictXMLPath - Path to the JMdict XML file
   * @param params.kanjidicXMLPath - Path to the Kanjidic XML file
   * @param params.outputPath - Path where the SQLite database will be created
   */
  constructor({
    jmdictXMLPath,
    kanjidicXMLPath,
    outputPath,
  }: {
    jmdictXMLPath: string;
    kanjidicXMLPath: string;
    outputPath: string;
    verbose?: boolean;
  }) {
    this.jmdictXMLPath = jmdictXMLPath;
    this.kanjidicXMLPath = kanjidicXMLPath;
    this.outputPath = outputPath;

    this.db = new JMDictSQLiteDatabase(this.outputPath);
  }

  /**
   * Executes the full parsing pipeline.
   *
   * This method:
   * 1. Streams and parses the JMdict XML file
   * 2. Streams and parses the Kanjidic XML file
   * 3. Logs timing information for each stage
   * 4. Closes the database connection when complete
   *
   * @returns A promise that resolves when processing is finished
   */
  public async process(): Promise<void> {
    const startTime = Date.now();

    try {
      // JMdict
      // Streams are opened only after the parser exists, so `parse()` is
      // listening before any read error can be emitted.
      const jmdictParser = await JMdictParser.create(this.db);
      const jmdictSource = fs.createReadStream(this.jmdictXMLPath, {
        encoding: 'utf8',
      });
      const jmdictInput = jmdictSource.pipe(new EntityReplace());

      // `pipe` does not forward errors, so pass read errors downstream.
      jmdictSource.once('error', err => jmdictInput.destroy(err));

      await jmdictParser.parse(jmdictInput).catch(err => {
        throw new Error(`JMdict parsing failed (${this.jmdictXMLPath})`, {
          cause: err,
        });
      });

      logger.info(
        `[${((Date.now() - startTime) / 1000).toFixed(2)}s] Done parsing JMdict.`,
      );

      // Kanjidic
      const kanjidicParser = await KanjidicParser.create(this.db);
      await kanjidicParser
        .parse(fs.createReadStream(this.kanjidicXMLPath, { encoding: 'utf8' }))
        .catch(err => {
          throw new Error(`Kanjidic parsing failed (${this.kanjidicXMLPath})`, {
            cause: err,
          });
        });

      logger.info(
        `[${((Date.now() - startTime) / 1000).toFixed(2)}s] Done parsing Kanjidic.`,
      );
    } catch (err) {
      // Don't run post-processing on a partial database.
      this.db.abort();

      throw err;
    }

    await this.db.close();

    logger.success(
      `[${((Date.now() - startTime) / 1000).toFixed(2)}s] All processing complete. Database saved to ${this.outputPath}`,
    );
  }
}
