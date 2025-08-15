import entry from './entry.js';
import k_ele from './k_ele.js';
import r_ele from './r_ele.js';
import sense from './sense.js';

import type { JmdictParser } from '@/lib/parser/index.js';

type OpenHandler = (parser: JmdictParser) => void;

export default {
  entry,
  k_ele,
  r_ele,
  sense,
} as Record<string, OpenHandler>;
