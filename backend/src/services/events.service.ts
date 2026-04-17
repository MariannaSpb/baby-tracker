import { db } from '../config/firebase';
import { BabyEvent, CreateEventInput, UpdateEventInput } from '../models/event.model';

const BABY_ID = process.env['BABY_ID'] ?? 'baby';

function eventsCol() {
  return db.collection(`babies/${BABY_ID}/events`);
}

function docToEvent(doc: FirebaseFirestore.DocumentSnapshot): BabyEvent {
  return { id: doc.id, ...doc.data() } as BabyEvent;
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createEvent(input: CreateEventInput): Promise<BabyEvent> {
  const now = new Date().toISOString();

  // Auto-compute durationMinutes for sleep if both times are present
  let durationMinutes = input.durationMinutes;
  if (input.type === 'sleep' && input.endTime && !durationMinutes) {
    const ms = new Date(input.endTime).getTime() - new Date(input.startTime).getTime();
    durationMinutes = Math.round(ms / 60_000);
  }

  const data = {
    ...input,
    durationMinutes: durationMinutes ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await eventsCol().add(data);
  const doc = await docRef.get();
  return docToEvent(doc);
}

// ── Read: today's events ───────────────────────────────────────────────────────

export async function getTodayEvents(type?: string): Promise<BabyEvent[]> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // Single-field range query (no composite index needed)
  const snapshot = await eventsCol()
    .where('startTime', '>=', todayStart.toISOString())
    .orderBy('startTime', 'desc')
    .get();

  let events = snapshot.docs.map(docToEvent);

  // Type filter applied in-memory to avoid requiring a composite Firestore index
  if (type) {
    events = events.filter((e) => e.type === type);
  }

  return events;
}

// ── Read: history ──────────────────────────────────────────────────────────────

export async function getEvents(limit = 50, startAfterTime?: string): Promise<BabyEvent[]> {
  let query = eventsCol()
    .orderBy('startTime', 'desc')
    .limit(limit) as FirebaseFirestore.Query;

  if (startAfterTime) {
    query = query.startAfter(startAfterTime);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(docToEvent);
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateEvent(id: string, input: UpdateEventInput): Promise<BabyEvent> {
  const docRef = eventsCol().doc(id);
  const existing = await docRef.get();

  if (!existing.exists) throw new Error('Event not found');

  const current = existing.data() as BabyEvent;
  const updates: Record<string, unknown> = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  // Recompute durationMinutes when endTime is added to a sleep event
  if (input.endTime && current.type === 'sleep') {
    const ms = new Date(input.endTime).getTime() - new Date(current.startTime).getTime();
    updates['durationMinutes'] = Math.round(ms / 60_000);
  }

  await docRef.update(updates);
  const updated = await docRef.get();
  return docToEvent(updated);
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export async function deleteEvent(id: string): Promise<void> {
  const docRef = eventsCol().doc(id);
  const existing = await docRef.get();
  if (!existing.exists) throw new Error('Event not found');
  await docRef.delete();
}
