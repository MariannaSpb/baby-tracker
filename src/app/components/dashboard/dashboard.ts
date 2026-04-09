import { Component, inject, signal } from '@angular/core';
import { DialogModule } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';

import { FeedService } from '../../core/services/feed.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly feedService = inject(FeedService);

  protected readonly feedCount = signal(0);
  protected readonly diperCount = signal(0);

  constructor() {
    this.refreshFeedCount();
    this.refreshDiaperCount();
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

  private refreshFeedCount() {
    this.feedCount.set(this.feedService.getTodayFeedCount());
  }

  private refreshDiaperCount() {
    this.diperCount.set(this.feedService.getTodayDiaperCount());
  }
}

