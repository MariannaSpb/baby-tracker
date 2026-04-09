export type FeedType = 'breast' | 'bottle' | 'formula' | 'solids';

export type FeedEntry = {
  type: FeedType;
  amount?: number;
  timestamp: Date;
};

