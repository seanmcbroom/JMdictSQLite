import { tagCategoryMap } from '@/lib/constants/tags.js';
import type { JmdictParser } from '@/lib/parser/index.js';

export default function pos(parser: JmdictParser, text: string) {
  const lastSense = parser.lastSense;

  if (!lastSense) return;

  const category = tagCategoryMap[text];
  const verbData = lastSense.verb_data;
  const isVerb = category === 'verbGroup';
  const isTransitivity = category === 'transitivity';

  if (verbData && isVerb) {
    verbData.verb_group = text;
    lastSense.pos.push('v');
  } else if (verbData && isTransitivity) {
    verbData.transivity = text;
  } else {
    lastSense.pos.push(text);
  }
}
