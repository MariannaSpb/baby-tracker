import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { tap } from 'rxjs';

import type { FeedEntry } from '../models/feed.model';
import { FeedComponent } from '../../components/feed/feed';
import { DiaperEntry } from '../models/diaper.model';
import { Diaper } from '../../components/diaper/diaper';
import { ActivityEntry } from '../../shared/models/models';

type StoredFeedEntry = Omit<FeedEntry | DiaperEntry, 'timestamp'> & { timestamp: string };
type StoredActivityEntry = Omit<ActivityEntry, 'timestamp'> & { timestamp: string };
const FEED_KEY = 'baby_feeds';
const DIAPER_KEY = 'baby_diapers';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly dialog = inject(Dialog);

  addFeed(entry: FeedEntry) {
    const all = this.getFeeds();
    all.push(entry);
    this.setAll(FEED_KEY, all);
  }

  addDiaper(entry: DiaperEntry) {
    const all = this.getDiapers();
    all.push(entry);
    this.setAll(DIAPER_KEY, all);
  }

  getTodayFeedCount(): number {
    const today = new Date();
    return this.getFeeds().filter(e => this.isSameLocalDay(e.timestamp, today)).length;
  }

  getTodayDiaperCount(): number {
    const today = new Date();
    return this.getDiapers().filter(e => this.isSameLocalDay(e.timestamp, today)).length;
  }

  openDiaperModal() {
    const ref = this.dialog.open<DiaperEntry | undefined>(Diaper, {
      ariaLabel: 'Log diaper',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      width: 'min(430px, calc(100vw - 32px))',
      maxWidth: '430px',
      panelClass: ['feed-dialog-panel']
    });

    return ref.closed.pipe(
      tap((entry) => {
        if (entry) this.addDiaper(entry);
      })
    );
  }

  openFeedModal() {
    const ref = this.dialog.open<FeedEntry | undefined>(FeedComponent, {
      ariaLabel: 'Log feed',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      width: 'min(430px, calc(100vw - 32px))',
      maxWidth: '430px',
      panelClass: ['feed-dialog-panel']
    });

    return ref.closed.pipe(
      tap((entry) => {
        console.log('ENTRY')
        if (entry) this.addFeed(entry);
      })
    );
  }

  private getFeeds(): FeedEntry[] { return this.getAll(FEED_KEY); }
  private getDiapers(): DiaperEntry[] { return this.getAll(DIAPER_KEY); }

  private getAll(key: string): any[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      return parsed.map(e => ({ ...e, timestamp: new Date(e.timestamp) }));
    } catch { return []; }
  }

  private setAll(key: string, entries: any[]) {
    const stored = entries.map(e => ({ ...e, timestamp: e.timestamp.toISOString() }));
    localStorage.setItem(key, JSON.stringify(stored));
  }

  private isSameLocalDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}

