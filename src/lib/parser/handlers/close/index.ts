import ant from './ant.js';
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
import re_restr from './re_restr.js';
import reb from './reb.js';
import s_inf from './s_inf.js';
import xref from './xref.js';

import { type CloseHandler } from '@/lib/types/parser.js';

export default {
  ant,
  entry,
  ent_seq,
  keb,
  ke_pri,
  ke_inf,
  reb,
  re_pri,
  re_inf,
  re_restr,
  s_inf,
  gloss,
  pos,
  field,
  misc,
  xref,
} as Record<string, CloseHandler>;
