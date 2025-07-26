import sax from 'sax';
import type Entry from '@/models/entry';
import { insertEntry, insertSense } from "@/db/index"

/**
 * Creates a SAX parser stream to parse JMDict XML.
 * 
 * @returns SAX parser stream
 */
export function createParser() {
  const parser = sax.createStream(true, { trim: true });

  let currentEntry: Entry | null = null;
  let currentText = '';
  let currentTag = '';

  parser.on('opentag', (node) => {
    currentTag = node.name;

    if (currentTag === 'entry') {
      currentEntry = {
        ent_seq: null,
        kanji: [],
        kana: [],
        senses: [],
      };
    }
  });

  parser.on('text', (text) => {
    currentText += text;
  });

  parser.on('closetag', (tagName) => {
    const text = currentText.trim();
    currentText = '';

    if (!currentEntry) return;

    switch (tagName) {
    case 'ent_seq': {
      const parsed = parseInt(text, 10);
      if (!isNaN(parsed)) {
        currentEntry.ent_seq = parsed;
      }
      break;
    }

    case 'keb':
      currentEntry.kanji.push(text);
      break;

    case 'reb':
      currentEntry.kana.push(text);
      break;

    case 'gloss': {
      const lastSense = currentEntry.senses[currentEntry.senses.length - 1];
      if (lastSense) {
        lastSense.glosses.push(text);
      }
      break;
    }

    case 'pos': {
      const lastSense = currentEntry.senses[currentEntry.senses.length - 1];
      if (lastSense) {
        lastSense.pos.push(text);
      }
      break;
    }

    case 'entry': {
      if (typeof currentEntry.ent_seq !== 'number') {
        console.warn('⚠️ Skipping entry with missing ent_seq:', JSON.stringify(currentEntry, null, 2));
        currentEntry = null;
        return;
      }

      insertEntry(
        currentEntry.ent_seq,
        currentEntry.kanji.length ? currentEntry.kanji.join('; ') : null,
        currentEntry.kana.length ? currentEntry.kana.join('; ') : null
      );

      for (const sense of currentEntry.senses) {
        for (const gloss of sense.glosses) {
          const posList = sense.pos.length ? sense.pos : [''];
          for (const pos of posList) {
            insertSense(currentEntry.ent_seq, gloss, pos);
          }
        }
      }

      currentEntry = null;
      break;
    }
    }
  });

  parser.on('error', (err) => {
    console.error('❌ SAX Parser Error:', err);
  });

  return parser;
}
