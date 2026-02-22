import type { KanjidicParser } from '@/lib/parsers/KanjidicParser/index.js';

export default function rad_name(parser: KanjidicParser, text: string) {
  if (parser.character?.misc) {
    parser.character.misc.rad_name ??= []; // If the array doesn't exist, create it

    parser.character.misc.rad_name.push(text);
  }
}
