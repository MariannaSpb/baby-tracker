import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';
import { DashboardStore } from '../../core/services/dashboard.store';
import { FeedComponent } from '../feed/feed';
import { Diaper } from '../diaper/diaper';
import type { FeedEntry } from '../../core/models/feed.model';
import type { DiaperEntry } from '../../core/models/diaper.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  protected readonly store = inject(DashboardStore);
  private readonly dialog = inject(Dialog);

  // ── Auth actions ──

  protected onLoginClick(): void {
    this.auth.loginWithGoogle();
  }

  protected onLogoutClick(): void {
    this.auth.logout();
  }

  // ── Feed ──

  protected onFeedClick(): void {
    const ref = this.dialog.open<FeedEntry | undefined>(FeedComponent, {
      ariaLabel: 'Log feed',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      width: 'min(430px, calc(100vw - 32px))',
      maxWidth: '430px',
      panelClass: ['feed-dialog-panel']
    });

    ref.closed.subscribe((entry) => {
      if (entry) {
        this.store.addFeed(entry).subscribe();
      }
    });
  }

  // ── Diaper ──

  protected onDiaperClick(): void {
    const ref = this.dialog.open<DiaperEntry | undefined>(Diaper, {
      ariaLabel: 'Log diaper',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      width: 'min(430px, calc(100vw - 32px))',
      maxWidth: '430px',
      panelClass: ['feed-dialog-panel']
    });

    ref.closed.subscribe((entry) => {
      if (entry) {
        this.store.addDiaper(entry).subscribe();
      }
    });
  }

  // ── Sleep ──

  protected onSleepClick(): void {
    if (this.store.sleepTimer.isActive()) return;
    this.store.startSleep();
  }

  protected onStopSleepClick(): void {
    const result = this.store.stopSleep();
    if (result) {
      result.subscribe();
    }
  }

  // ── Other ──

  protected onOtherClick(): void {
    console.log('Other clicked');
  }
}
