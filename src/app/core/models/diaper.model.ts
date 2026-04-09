export type DiaperType = 'pee' | 'poop' | 'mixed';

export type DiaperEntry = {
  type: DiaperType;
  amount?: number;
  timestamp: Date;
};

export enum DiaperEnum {
    PEE = "Pee", 
    POOP = "Poop",
    MIXED = "Mixed"
}