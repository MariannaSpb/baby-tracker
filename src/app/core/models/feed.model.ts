export type FeedType = 'breast' | 'bottle' | 'formula' | 'solids';

export interface FeedEntry {
  type: FeedType;
  amount?: number;
  timestamp: Date;
}

