// ── Event types ────────────────────────────────────────────────────────────────

export type EventType = 'sleep' | 'feed' | 'diaper';

// Feed: track type (breast/bottle) and amount for bottle
export interface FeedDetails {
  feedType: 'breast' | 'bottle';
  side?: 'left' | 'right' | 'both'; // breast only
  amountMl?: number;                 // bottle only
}

// Diaper: wet, dirty, or mixed (wet+dirty)
export interface DiaperDetails {
  kind: 'wet' | 'dirty' | 'mixed';
  hasRash?: boolean;
}

// Sleep: extra detail is optional (quality note etc.)
export interface SleepDetails {
  quality?: 'good' | 'poor';
}

// ── Core event document ────────────────────────────────────────────────────────

export interface BabyEvent {
  id: string;
  type: EventType;
  startTime: string;          // ISO 8601 UTC
  endTime?: string;           // ISO 8601 UTC — sleep only
  durationMinutes?: number;   // computed from start/end — sleep only
  notes?: string;
  createdBy: string;          // display name or email from Google token
  createdAt: string;          // ISO 8601 UTC
  updatedAt: string;          // ISO 8601 UTC
  details: Record<string, unknown>;
}

// ── Input shapes ───────────────────────────────────────────────────────────────

export type CreateEventInput = Omit<BabyEvent, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateEventInput = Partial<
  Pick<BabyEvent, 'endTime' | 'durationMinutes' | 'notes' | 'details'>
>;
