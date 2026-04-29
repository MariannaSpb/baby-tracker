import { Injectable, inject, signal, effect } from '@angular/core';
import { tap } from 'rxjs';
import type { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { EventsApiService } from './events-api.service';
import { SleepTimerService } from './sleep-timer.service';
import type { FeedEntry } from '../models/feed.model';
import type { DiaperEntry } from '../models/diaper.model';
import type { BabyEvent, CreateEventInput } from '../models/backend.model';

/**
 * DashboardStore — owns all dashboard state signals and coordinates
 * data operations. This is the single source of truth for dashboard data.
 *
 * Components read signals from here and call action methods.
 * The store handles: save → refresh sequencing, auth-gated loading,
 * and payload mapping.
 */
@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly api = inject(EventsApiService);
  private readonly auth = inject(AuthService);
  readonly sleepTimer = inject(SleepTimerService);

  // ── Dashboard state ──
  readonly feedCount = signal(0);
  readonly diaperCount = signal(0);
  readonly sleepTotalMins = signal(0);
  readonly isLoading = signal(false);

  /** The Firestore document ID of the in-progress sleep event (no endTime). */
  private activeSleepEventId: string | null = null;

  constructor() {
    // React to auth state changes — load data when user signs in,
    // reset when they sign out. effect() in a service is the correct place.
    effect(() => {
      if (this.auth.user()) {
        this.refreshAll();
      } else {
        this.resetAll();
      }
    });
  }

  // ── Feed actions ──

  /**
   * Save a feed event, then refresh the feed count.
   * Returns an Observable so the caller knows when it's done.
   */
  addFeed(entry: FeedEntry): Observable<BabyEvent> {
    const payload: CreateEventInput = {
      type: 'feed',
      startTime: entry.timestamp.toISOString(),
      details: {
        feedType: entry.type === 'breast' ? 'breast' : 'bottle',
        amountMl: entry.amount
      }
    };

    return this.api.createEvent(payload).pipe(
      tap(() => this.refreshFeedCount())
    );
  }

  // ── Diaper actions ──

  /**
   * Save a diaper event, then refresh the diaper count.
   */
  addDiaper(entry: DiaperEntry): Observable<BabyEvent> {
    let kind = 'wet';
    if (entry.type === 'poop') kind = 'dirty';
    if (entry.type === 'mixed') kind = 'mixed';

    const payload: CreateEventInput = {
      type: 'diaper',
      startTime: entry.timestamp.toISOString(),
      details: { kind }
    };

    return this.api.createEvent(payload).pipe(
      tap(() => this.refreshDiaperCount())
    );
  }

  // ── Sleep actions ──

  /**
   * Start a sleep session by POSTing to the API immediately.
   * Both phones will see the in-progress sleep.
   */
  startSleep(): void {
    const startTime = new Date();

    const payload: CreateEventInput = {
      type: 'sleep',
      startTime: startTime.toISOString(),
      // No endTime — this marks it as "in progress"
      details: {}
    };

    this.api.createEvent(payload).subscribe({
      next: (event) => {
        this.activeSleepEventId = event.id;
        this.sleepTimer.start(startTime);
      },
      error: (err) => {
        console.error('Failed to start sleep', err);
      }
    });
  }

  /**
   * Stop the sleep session by PATCHing the event with endTime.
   * Backend auto-computes durationMinutes.
   * Returns an Observable so the caller can react to completion.
   */
  stopSleep(): Observable<BabyEvent> | null {
    if (!this.activeSleepEventId) return null;

    const eventId = this.activeSleepEventId;
    const endTime = new Date().toISOString();

    this.sleepTimer.stop();
    this.activeSleepEventId = null;

    return this.api.updateEvent(eventId, { endTime }).pipe(
      tap(() => this.refreshSleepData())
    );
  }

  // ── Refresh methods ──

  refreshAll(): void {
    this.isLoading.set(true);
    this.refreshFeedCount();
    this.refreshDiaperCount();
    this.refreshSleepData();
  }

  /**
   * Fetch today's sleep events once.
   * - Computes total duration of completed sleeps.
   * - Checks if there is an in-progress sleep (no endTime).
   */
  private refreshSleepData(): void {
    this.api.getTodayEvents('sleep').subscribe({
      next: (events) => {
        // 1. Check for active sleep
        const active = events.find((e) => !e.endTime);
        if (active) {
          this.activeSleepEventId = active.id;
          this.sleepTimer.start(new Date(active.startTime));
        } else {
          this.activeSleepEventId = null;
          this.sleepTimer.stop();
        }

        // 2. Compute total of completed sleeps
        const total = events.reduce(
          (acc, ev) => acc + (ev.durationMinutes || 0),
          0
        );
        this.sleepTotalMins.set(total);
        this.isLoading.set(false);
      },
      error: () => {
        this.sleepTotalMins.set(0);
        this.isLoading.set(false);
      }
    });
  }

  private resetAll(): void {
    this.feedCount.set(0);
    this.diaperCount.set(0);
    this.sleepTotalMins.set(0);
    this.activeSleepEventId = null;
    this.sleepTimer.stop();
  }

  private refreshFeedCount(): void {
    this.api.getTodayEvents('feed').subscribe({
      next: (events) => this.feedCount.set(events.length),
      error: () => this.feedCount.set(0)
    });
  }

  private refreshDiaperCount(): void {
    this.api.getTodayEvents('diaper').subscribe({
      next: (events) => this.diaperCount.set(events.length),
      error: () => this.diaperCount.set(0)
    });
  }
}
