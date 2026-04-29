export type EventType = 'sleep' | 'feed' | 'diaper';

export interface BabyEvent {
  id: string;
  type: EventType;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  details: Record<string, unknown>;
}

export type CreateEventInput = Omit<BabyEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
