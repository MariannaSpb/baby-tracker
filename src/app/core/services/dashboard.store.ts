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

  // ── Actions ──

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

  /**
   * Start a sleep session (local timer only — no API call until stop).
   */
  startSleep(): void {
    this.sleepTimer.start();
  }

  /**
   * Stop the sleep session, send the completed event to the API,
   * then refresh the sleep total.
   */
  stopSleep(): Observable<BabyEvent> | null {
    const startTime = this.sleepTimer.stop();
    if (!startTime) return null;

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    const payload: CreateEventInput = {
      type: 'sleep',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes,
      details: {}
    };

    return this.api.createEvent(payload).pipe(
      tap(() => this.refreshSleepTotal())
    );
  }

  // ── Refresh methods ──

  refreshAll(): void {
    this.isLoading.set(true);
    this.refreshFeedCount();
    this.refreshDiaperCount();
    this.refreshSleepTotal();
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

  private refreshSleepTotal(): void {
    this.api.getTodayEvents('sleep').subscribe({
      next: (events) => {
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
  }
}
