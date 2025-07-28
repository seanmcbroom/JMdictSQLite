import sax from 'sax';

import type { JmdictDatabase } from '@/db/index.js';
import type { Entry } from '@/types/database.js';

/**
 * Creates a SAX parser stream to parse JMDict XML.
 * 
 * @returns SAX parser stream
 */
export function createParser(db: JmdictDatabase) {
  const parser = sax.createStream(true, { trim: true });

  let currentEntry: Entry | undefined;
  let currentText = '';
  
  parser.on('opentag', (node) => {
    switch (node.name) {
    case 'entry':
      currentEntry = {
        ent_seq: 0,
        kanji: [],
        kana: [],
        senses: [],
      };
      break;

    case 'sense':
      if (currentEntry) {
        currentEntry.senses.push({
          id: 0, // Placeholder, will be set by DB
          ent_seq: 0,
          glosses: [],
          pos: [],
          misc: [],
          field: [],
        });
      }
      break;

    case 'k_ele':
      if (currentEntry) {
        currentEntry.kanji?.push({ kanji: "", tags: [] });
      }
      
      break;

    case 'r_ele':
      if (currentEntry) {
        currentEntry.kana.push({ kana: "", tags: [] });
      }
      break;
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

    // Entry sequence number tag
    case 'ent_seq': {
      const parsed = parseInt(text, 10);
      if (!isNaN(parsed)) {
        currentEntry.ent_seq = parsed;
      }
      break;
    }

    // Kanji reading tag
    case 'keb': {
      const lastKanji = currentEntry.kanji?.at(-1);
      if (lastKanji) lastKanji.kanji = text
      break;
    }
      
    case 'ke_pri':
    case 'ke_inf': {
      const lastKanji = currentEntry.kanji?.at(-1);
      if (lastKanji) lastKanji.tags?.push(text)
      break;
    }

    // Kana reading tag
    case 'reb': {
      const lastKana = currentEntry.kana.at(-1);
      if (lastKana) lastKana.kana = text
      break;
    }
      
    case 're_pri':
    case 're_inf': {
      const lastKana = currentEntry.kana.at(-1);
      if (lastKana) lastKana.tags?.push(text)
      break;
    }
      
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
