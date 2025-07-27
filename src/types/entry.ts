import type Sense from "@/types/sense.js";

export default interface Entry {
  ent_seq: number | undefined; // Undefined until parsed, must be handled accordingly
  kanji: string[];
  kana: string[];
  senses: Sense[];
}
