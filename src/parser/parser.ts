import sax from 'sax';

import { tagCategoryMap } from '@/constants/tags.js';
import type { JmdictDatabase } from '@/db/index.js';
import type { Entry } from '@/types/database.js';

/**
 * SAX-based JMDict parser using a class to encapsulate state and logic.
 */
export class JmdictParser {
  private readonly parser = sax.createStream(true, { trim: true });
  private currentEntry: Entry | undefined;
  private currentText = '';
  private readonly buffer: Entry[] = [];
  private readonly batchSize = 500;

  constructor(private readonly db: JmdictDatabase) {
    this.parser.on('opentag', this.onOpenTag.bind(this));
    this.parser.on('text', this.onText.bind(this));
    this.parser.on('closetag', this.onCloseTag.bind(this));
    this.parser.on('error', this.onError.bind(this));
    this.parser.on('end', this.flushBuffer.bind(this)); // flush remaining
  }

  getStream() {
    return this.parser;
  }

  private flushBuffer() {
    if (this.buffer.length > 0) {
      this.db.insertEntries(this.buffer);
      this.buffer.length = 0;
    }
  }

  private onOpenTag(node: sax.Tag) {
    switch (node.name) {
      case 'entry':
        this.currentEntry = {
          ent_seq: 0,
          kanji: [],
          kana: [],
          senses: [],
        };
        break;

      case 'sense':
        this.currentEntry?.senses.push({
          id: 0,
          ent_seq: 0,
          note: undefined,
          glosses: [],
          pos: [],
          fields: [],
          tags: [],
          verb_group: undefined,
          transivity: undefined,
        });
        break;

      case 'k_ele':
        this.currentEntry?.kanji?.push({ written: '', tags: [] });
        break;

      case 'r_ele':
        this.currentEntry?.kana.push({ written: '', tags: [] });
        break;
    }
  }

  private onText(text: string) {
    this.currentText += text;
  }

  private onCloseTag(name: string) {
    const entry = this.currentEntry;
    const text = this.currentText.trim();

    this.currentText = '';

    if (!entry) return;

    const lastKanji = entry.kanji?.at(-1);
    const lastKana = entry.kana.at(-1);
    const lastSense = entry.senses.at(-1);

    switch (name) {
      case 'entry': {
        this.buffer.push(entry);

        if (this.buffer.length >= this.batchSize) {
          this.flushBuffer();
        }

        this.currentEntry = undefined;

        return;
      }

      case 'ent_seq': {
        const parsed = parseInt(text, 10);

        if (!isNaN(parsed)) entry.ent_seq = parsed;

        break;
      }

      case 'keb':
        if (lastKanji) lastKanji.written = text;

        break;

      case 'ke_pri':
      case 'ke_inf':
        lastKanji?.tags?.push(text);
        break;

      case 'reb':
        if (lastKana) lastKana.written = text;

        break;

      case 're_pri':
      case 're_inf':
        lastKana?.tags?.push(text);
        break;

      case 's_inf':
        if (lastSense) lastSense.note = text;

        break;

      case 'gloss':
        lastSense?.glosses.push(text);
        break;

      case 'pos':
        if (!lastSense) break;

        const category = tagCategoryMap[text];

        if (category === 'verbGroup') {
          lastSense.verb_group = text;
        } else if (category === 'transitivity') {
          lastSense.transivity = text;
        } else {
          lastSense?.pos.push(text);
        }

        break;

      case 'field':
        lastSense?.fields?.push(text);
        break;

      case 'misc':
        lastSense?.tags?.push(text);
        break;
    }
  }

  private onError(err: Error) {
    console.warn('❌ SAX Parser Error:', err);
  }
}
