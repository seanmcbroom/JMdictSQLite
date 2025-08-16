import type { JMdictParser } from '@/lib/parser/index.js';

export default function sense(parser: JMdictParser) {
  parser.entry?.senses.push({
    id: 0,
    ent_seq: 0,
    lang: '',
    note: undefined,
    glosses: [],
    pos: [],
    verb_data: {
      verb_group: '',
      transivity: undefined,
    },
    fields: [],
    tags: [],
    ant: [],
    see: [],
  });
}
