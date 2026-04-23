import { Injectable, signal, OnDestroy } from '@angular/core';

const ACTIVE_SLEEP_KEY = 'baby_active_sleep';

/**
 * Dedicated service for the active sleep timer.
 * Manages localStorage persistence and the live duration counter.
 */
@Injectable({ providedIn: 'root' })
export class SleepTimerService implements OnDestroy {
  /** Whether a sleep session is currently in progress. */
  readonly isActive = signal(false);

  /** Duration of the active sleep session in minutes. */
  readonly durationMinutes = signal(0);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.syncFromStorage();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  /** Start a new sleep session. Persists to localStorage. */
  start(): void {
    localStorage.setItem(ACTIVE_SLEEP_KEY, new Date().toISOString());
    this.isActive.set(true);
    this.updateDuration();
    this.startTimer();
  }

  /**
   * End the current sleep session.
   * Returns the start time so the caller can create the API event.
   * Clears localStorage and stops the timer.
   */
  stop(): Date | null {
    const start = this.getStartTime();
    if (!start) return null;

    localStorage.removeItem(ACTIVE_SLEEP_KEY);
    this.isActive.set(false);
    this.durationMinutes.set(0);
    this.stopTimer();

    return start;
  }

  /** Get the stored start time, or null if no active session. */
  getStartTime(): Date | null {
    const stored = localStorage.getItem(ACTIVE_SLEEP_KEY);
    return stored ? new Date(stored) : null;
  }

  /** Read localStorage and sync signals on init (e.g., after page refresh). */
  private syncFromStorage(): void {
    const start = this.getStartTime();
    if (start) {
      this.isActive.set(true);
      this.updateDuration();
      this.startTimer();
    }
  }

  private updateDuration(): void {
    const start = this.getStartTime();
    if (start) {
      const mins = Math.floor(
        (new Date().getTime() - start.getTime()) / 60000
      );
      this.durationMinutes.set(mins);
    }
  }

  private startTimer(): void {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      this.updateDuration();
    }, 60000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
