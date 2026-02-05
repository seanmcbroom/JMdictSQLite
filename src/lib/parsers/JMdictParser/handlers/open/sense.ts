import type { JMdictParser } from '@/lib/parsers/JMdictParser/index.js';

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
      transitive: undefined,
      auxiliary: undefined,
    },
    fields: [],
    tags: [],
    ant: [],
    see: [],
  });
}
