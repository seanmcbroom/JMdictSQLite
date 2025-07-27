import sax from 'sax';

import type { JmdictDatabase } from '@/db/index.js';
import type Entry from '@/models/entry.js';

/**
 * Creates a SAX parser stream to parse JMDict XML.
 * 
 * @returns SAX parser stream
 */
export function createParser(db: JmdictDatabase) {
  const parser = sax.createStream(true, { trim: true });

  let currentEntry: Entry | undefined; // undefined until an <entry> tag is opened
  let currentText = '';

  parser.on('opentag', (node) => {
    if (node.name === 'entry') {
      currentEntry = {
        ent_seq: undefined,
        kanji: [],
        kana: [],
        senses: [],
      };
    }

    if (node.name === 'sense' && currentEntry) {
      currentEntry.senses.push({
        ent_seq: 0,
        glosses: [],
        pos: [],
        misc: [],
        field: [],
      });
    }
  });


  parser.on('text', (text) => {
    currentText += text;
  });

  parser.on('closetag', (name) => {
    const text = currentText.trim();
    currentText = '';

    if (!currentEntry) return;

    switch (name) {

    case 'r_ele':
      break;
    
    // Entry sequence number tag
    case 'ent_seq': {
      const parsed = parseInt(text, 10);
      if (!isNaN(parsed)) {
        currentEntry.ent_seq = parsed;
      }
      break;
    }

    // Kanji reading tag
    case 'keb':
      currentEntry.kanji.push(text);
      break;

    // Kana reading tag
    case 'reb':
      currentEntry.kana.push(text);
      break;

    // Glossary entry
    case 'gloss': {
      const lastSense = currentEntry.senses.at(-1);
      if (lastSense) lastSense.glosses.push(text);
      break;
    }

    // Part of speech tags
    case 'pos': {
      const lastSense = currentEntry.senses.at(-1);
      if (lastSense) lastSense.pos.push(text);
      break;
    }

    // Miscellaneous tags
    case 'misc': {
      const lastSense = currentEntry.senses.at(-1);
      if (lastSense) lastSense.misc?.push(text);
      break;
    }

    // Field tags
    case 'field': {
      const lastSense = currentEntry.senses.at(-1);
      if (lastSense) lastSense.field?.push(text);
      break;
    }

    // Closing entry tag
    case 'entry': {
      if (typeof currentEntry.ent_seq !== 'number') {
        console.warn('⚠️ Skipping entry with missing ent_seq:', JSON.stringify(currentEntry, null, 2));
        currentEntry = undefined;
        return;
      }

      db.insertEntry(currentEntry);

      currentEntry = undefined; // Reset for the next entry
      break;
    }
    }
  });

  parser.on('error', (err) => {
    console.warn('❌ SAX Parser Error:', err);
  });

  return parser;
}
