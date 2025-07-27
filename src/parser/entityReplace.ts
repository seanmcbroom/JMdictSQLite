// The purpose for string replacement is to replace elements in the XML file
// that cannot be read by the parser directly.
import { Transform } from 'stream';

// Map of XML entities to their replacements, grouped by category
const categories = {
  pos: [
    'adj-f','adj-i','adj-ix','adj-kari','adj-ku','adj-na','adj-nari','adj-no','adj-pn','adj-shiku','adj-t',
    'adv','adv-to','aux','aux-adj','aux-v','conj','cop','ctr','exp','int','n','n-adv','n-pr','n-pref','n-suf',
    'n-t','num','pn','pref','prt','suf','unc','v-unspec','v1','v1-s','v2a-s','v2b-k','v2b-s','v2d-k','v2d-s',
    'v2g-k','v2g-s','v2h-k','v2h-s','v2k-k','v2k-s','v2m-k','v2m-s','v2n-s','v2r-k','v2r-s','v2s-s','v2t-k',
    'v2t-s','v2w-s','v2y-k','v2y-s','v2z-s','v4b','v4g','v4h','v4k','v4m','v4n','v4r','v4s','v4t','v5aru',
    'v5b','v5g','v5k','v5k-s','v5m','v5n','v5r','v5r-i','v5s','v5t','v5u','v5u-s','v5uru','vi','vk','vn',
    'vr','vs','vs-c','vs-i','vs-s','vt','vz'
  ],
  misc: [
    'abbr','aphorism','arch','char','chn','col','company','creat','dated','dei','derog','doc','euph','ev',
    'fam','fem','fict','form','given','group','hist','hon','hum','id','joc','leg','m-sl','male','myth','net-sl',
    'obj','obs','on-mim','organization','oth','person','place','poet','pol','product','proverb','quote','rare',
    'relig','sens','serv','ship','sl','station','surname','uk','unclass','vulg','work','X','yoji'
  ],
  field: [
    'agric','anat','archeol','archit','art','astron','audvid','aviat','baseb','biochem','biol','bot','boxing',
    'Buddh','bus','cards','chem','chmyth','Christn','civeng','cloth','comp','cryst','dent','ecol','econ','elec',
    'electr','embryo','engr','ent','figskt','film','finc','fish','food','gardn','genet','geogr','geol','geom',
    'go','golf','gramm','grmyth','hanaf','horse','internet','jpmyth','kabuki','law','ling','logic','MA','mahj',
    'manga','math','mech','med','met','mil','min','mining','motor','music','noh','ornith','paleo','pathol',
    'pharm','phil','photo','physics','physiol','politics','print','prowres','psy','psyanal','psych','rail',
    'rommyth','Shinto','shogi','ski','sports','stat','stockm','sumo','surg','telec','tradem','tv','vet','vidg','zool'
  ],
  priority: [
    'news1','news2','spec1','spec2','nf01','ichi1','ichi2','gai1','gai2'
  ],
  dialect: [
    'ksb','hob','bra','ktb','kyb','kyu','nab','osb','rkb','tsb','thb','tsug'
  ],
  kanji: [
    'ateji','ik','iK','io','oK','ok','rK','sK','sk','rk'
  ]
};

const entityMap: Record<string, string> = {};

Object.values(categories).forEach((codes) => {
  for (const code of codes) {
    entityMap[`&${code};`] = code;
  }
});

export default class EntityReplace extends Transform {
  private leftover = '';

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    let data = this.leftover + chunk.toString();
    
    // Check for a dangling '&' near the end
    const lastAmp = data.lastIndexOf('&');
    const semicolonAfterLastAmp = data.indexOf(';', lastAmp);

    if (lastAmp !== -1 && semicolonAfterLastAmp === -1) {
      this.leftover = data.slice(lastAmp);
      data = data.slice(0, lastAmp);
    } else {
      this.leftover = '';
    }

    const replaced = data.replace(/&([a-zA-Z0-9\-]+);/g, (entity, code) => {
      const replacement = entityMap[entity] ?? code;
      return replacement;
    });

    this.push(replaced);
    callback();
  }

  _flush(callback: (error?: Error | null) => void) {
    if (this.leftover) {
      const flushed = this.leftover.replace(/&([a-zA-Z0-9\-]+);/g, (entity, code) => {
        const replacement = entityMap[entity] ?? code;

        return replacement;
      });
      this.push(flushed);
    }
    callback();
  }
}
