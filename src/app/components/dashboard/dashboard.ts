import { Component, inject, signal, OnDestroy, effect } from '@angular/core';
import { DialogModule } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';
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
  protected readonly authService = inject(AuthService);
  private readonly feedService = inject(FeedService);
  private readonly sleepService = inject(SleepService);

  protected readonly feedCount = signal(0);
  protected readonly diperCount = signal(0);
  protected readonly sleepTotalMins = signal(0);

  protected readonly isSleeping = signal(false);
  protected readonly activeSleepDuration = signal(0);
  private sleepTimerInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.checkActiveSleep();

    effect(() => {
      if (this.authService.user()) {
        console.log('1');
        this.refreshFeedCount();
        this.refreshDiaperCount();
        this.refreshSleepCount();
      } else {
        this.feedCount.set(0);
        this.diperCount.set(0);
        this.sleepTotalMins.set(0);
      }
    });
  }

  ngOnDestroy() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
    }
  }

  protected onLoginClick() {
    this.authService.loginWithGoogle();
  }

  protected onLogoutClick() {
    this.authService.logout();
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

  protected async onStopSleepClick() {
    await this.sleepService.stopSleep();
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

  private async refreshFeedCount() {
    this.feedCount.set(await this.feedService.getTodayFeedCount());
  }

  private async refreshDiaperCount() {
    this.diperCount.set(await this.feedService.getTodayDiaperCount());
  }

  private async refreshSleepCount() {
    this.sleepTotalMins.set(await this.sleepService.getTodayTotalMinutes());
  }

  public onOtherClick() {
    console.log('Other clicked');
  }
}

