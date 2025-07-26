import Sense from "./sense";

export default interface Entry {
  ent_seq: number;
  kanji: string[];
  kana: string[];
  senses: Sense[];
}
