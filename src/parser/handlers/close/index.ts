import ent_seq from './ent_seq.js';
import entry from './entry.js';
import field from './field.js';
import gloss from './gloss.js';
import ke_inf from './ke_inf.js';
import ke_pri from './ke_pri.js';
import keb from './keb.js';
import misc from './misc.js';
import pos from './pos.js';
import re_inf from './re_inf.js';
import re_pri from './re_pri.js';
import reb from './reb.js';
import s_inf from './s_inf.js';

import type { JmdictParser } from '@/parser/index.js';

type CloseHandler = (parser: JmdictParser, text: string) => void;

export default {
  entry,
  ent_seq,
  keb,
  ke_pri,
  ke_inf,
  reb,
  re_pri,
  re_inf,
  s_inf,
  gloss,
  pos,
  field,
  misc,
} as Record<string, CloseHandler>;
