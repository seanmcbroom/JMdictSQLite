import fs from 'node:fs';

import { JMdictTags } from '@/lib/constants/JMdictTags.js';
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
  private readonly verbose: boolean;

  /**
   * Creates a new Processor instance.
   *
   * @param params - Configuration options for the processor
   * @param params.jmdictXMLPath - Path to the JMdict XML file
   * @param params.kanjidicXMLPath - Path to the Kanjidic XML file
   * @param params.outputPath - Path where the SQLite database will be created
   * @param params.verbose - Whether to log timing information to the console
   */
  constructor({
    jmdictXMLPath,
    kanjidicXMLPath,
    outputPath,
    verbose = true,
  }: {
    jmdictXMLPath: string;
    kanjidicXMLPath: string;
    outputPath: string;
    verbose?: boolean;
  }) {
    this.jmdictXMLPath = jmdictXMLPath;
    this.kanjidicXMLPath = kanjidicXMLPath;
    this.outputPath = outputPath;
    this.verbose = verbose;

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

    // JMdict
    try {
      const jmdictParser = await JMdictParser.create(this.db);
      await jmdictParser.parse(
        fs
          .createReadStream(this.jmdictXMLPath, {
            encoding: 'utf8',
          })
          .pipe(new EntityReplace(JMdictTags)),
      );

      if (this.verbose)
        logger.info(
          `[${((Date.now() - startTime) / 1000).toFixed(2)}s] Done parsing JMdict.`,
        );
    } catch (err) {
      logger.error(`JMdict parsing failed: ${err}`);
    }

    // Kanjidic
    try {
      const kanjidicParser = await KanjidicParser.create(this.db);
      await kanjidicParser.parse(
        fs.createReadStream(this.kanjidicXMLPath, { encoding: 'utf8' }),
      );

      if (this.verbose)
        logger.info(
          `[${((Date.now() - startTime) / 1000).toFixed(2)}s] Done parsing Kanjidic.`,
        );
    } catch (err) {
      logger.error(`Kanjidic parsing failed: ${err}`);
    }

    this.db.close();

    if (this.verbose) {
      logger.success(
        `[${((Date.now() - startTime) / 1000).toFixed(2)}s] All processing complete. Database saved to ${this.outputPath}`,
      );
    }
  }
}
