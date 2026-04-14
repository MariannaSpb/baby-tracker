export type DiaperType = 'pee' | 'poop' | 'mixed';

export interface DiaperEntry {
  type: DiaperType;
  amount?: number;
  timestamp: Date;
}

export enum DiaperEnum {
    PEE = "Pee", 
    POOP = "Poop",
    MIXED = "Mixed"
}