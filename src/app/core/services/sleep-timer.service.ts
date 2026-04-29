import { Injectable, signal, OnDestroy } from '@angular/core';

/**
 * Pure timer service — manages the live duration counter for UI display.
 * No API calls, no localStorage. Just ticks and exposes signals.
 * The DashboardStore tells it when to start/stop.
 */
@Injectable({ providedIn: 'root' })
export class SleepTimerService implements OnDestroy {
  /** Whether a sleep session is currently in progress. */
  readonly isActive = signal(false);

  /** Duration of the active sleep session in minutes. */
  readonly durationMinutes = signal(0);

  private startTime: Date | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.stopTimer();
  }

  /**
   * Start ticking from the given start time.
   * Called by DashboardStore after the API confirms the sleep event was created.
   */
  start(startTime: Date): void {
    this.startTime = startTime;
    this.isActive.set(true);
    this.updateDuration();
    this.startTimer();
  }

  /**
   * Stop ticking and reset.
   * Called by DashboardStore after the API confirms the sleep was ended.
   */
  stop(): void {
    this.startTime = null;
    this.isActive.set(false);
    this.durationMinutes.set(0);
    this.stopTimer();
  }

  private updateDuration(): void {
    if (this.startTime) {
      const mins = Math.floor(
        (new Date().getTime() - this.startTime.getTime()) / 60000
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
