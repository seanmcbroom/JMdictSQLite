import entry from './entry.js';
import k_ele from './k_ele.js';
import lsource from './lsource.js';
import r_ele from './r_ele.js';
import sense from './sense.js';

import { type OpenTagHandlers } from '@/lib/types/parser.js';

export default {
  entry,
  k_ele,
  r_ele,
  sense,
  lsource,
} as OpenTagHandlers;
