import type { JmdictParser } from '@/parser/index.js';

export default function sense(parser: JmdictParser) {
  parser.entry?.senses.push({
    id: 0,
    ent_seq: 0,
    note: undefined,
    glosses: [],
    pos: [],
    verb_data: {
      verb_group: '',
      transivity: undefined,
    },
    fields: [],
    tags: [],
  });
}
