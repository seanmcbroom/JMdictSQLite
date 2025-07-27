export default interface Sense {
  ent_seq: number; // link to the entry
  glosses: string[];
  pos: string[];
  misc?: string[];
  field?: string[];
}