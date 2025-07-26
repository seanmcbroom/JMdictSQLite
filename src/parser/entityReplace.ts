// The purpose for string replacement is to replace elements in the XML file
// that cannot be read by the parser directly.
import { Transform } from 'stream';

// Map of XML entities to their replacements
const ENTITY_MAP: Record<string, string> = {
  '&adj-na;': 'adj-na',
  '&adj-no;': 'adj-no',
  '&adj-i;': 'adj-i',
  '&n;': 'n',
  '&v1;': 'v1',
  '&vs;': 'vs',
  '&vi;': 'vi',
  '&vt;': 'vt',
  '&exp;': 'exp',
  '&int;': 'int',
  '&chn;': 'chn',
  '&uk;': 'uk',
  '&io;': 'io',
};

export default class entityReplace extends Transform {
  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: Function) {
    let data = chunk.toString();
    data = data.replace(/&[a-zA-Z0-9\-]+?;/g, (entity) => {
      return ENTITY_MAP[entity] ?? entity; // Replace if known, else keep original
    });
    this.push(data);
    callback();
  }
}
