import { Component, inject, signal, OnDestroy } from '@angular/core';
import { DialogModule } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';

import { FeedService } from '../../core/services/feed.service';
import { SleepService } from '../../core/services/sleep.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnDestroy {
  private readonly feedService = inject(FeedService);
  private readonly sleepService = inject(SleepService);

  protected readonly feedCount = signal(0);
  protected readonly diperCount = signal(0);
  protected readonly sleepTotalMins = signal(0);

  protected readonly isSleeping = signal(false);
  protected readonly activeSleepDuration = signal(0);
  private sleepTimerInterval: any;

  constructor() {
    this.refreshFeedCount();
    this.refreshDiaperCount();
    this.refreshSleepCount();
    this.checkActiveSleep();
  }

  ngOnDestroy() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
    }
  }

  protected onFeedClick() {
    this.feedService.openFeedModal().subscribe(() => {
      this.refreshFeedCount();
    });
  }

  protected onDiaperClick() {
    this.feedService.openDiaperModal().subscribe(() => {
      this.refreshDiaperCount();
    });
  }

  protected onSleepClick() {
    if (this.isSleeping()) return;
    this.sleepService.startSleep();
    this.checkActiveSleep();
  }

  protected onStopSleepClick() {
    this.sleepService.stopSleep();
    this.checkActiveSleep();
    this.refreshSleepCount();
  }

  private checkActiveSleep() {
    const active = this.sleepService.isSleeping();
    this.isSleeping.set(active);
    
    if (active) {
      this.updateActiveSleepDuration();
      if (!this.sleepTimerInterval) {
        this.sleepTimerInterval = setInterval(() => {
          this.updateActiveSleepDuration();
        }, 60000);
      }
    } else {
      this.activeSleepDuration.set(0);
      if (this.sleepTimerInterval) {
        clearInterval(this.sleepTimerInterval);
        this.sleepTimerInterval = null;
      }
    }
  }

  private updateActiveSleepDuration() {
    const start = this.sleepService.getActiveSleepStart();
    if (start) {
      const mins = Math.floor((new Date().getTime() - start.getTime()) / 60000);
      this.activeSleepDuration.set(mins);
    }
  }

  private refreshFeedCount() {
    this.feedCount.set(this.feedService.getTodayFeedCount());
  }

  private refreshDiaperCount() {
    this.diperCount.set(this.feedService.getTodayDiaperCount());
  }

  private refreshSleepCount() {
    this.sleepTotalMins.set(this.sleepService.getTodayTotalMinutes());
  }
}

