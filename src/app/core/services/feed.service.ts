import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, firstValueFrom } from 'rxjs';

import type { FeedEntry } from '../models/feed.model';
import { FeedComponent } from '../../components/feed/feed';
import { DiaperEntry } from '../models/diaper.model';
import { Diaper } from '../../components/diaper/diaper';
import { BabyEvent, CreateEventInput } from '../models/backend.model';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly dialog = inject(Dialog);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/events';

  async addFeed(entry: FeedEntry) {
    const payload: CreateEventInput = {
      type: 'feed',
      startTime: entry.timestamp.toISOString(),
      details: {
        feedType: entry.type === 'breast' ? 'breast' : 'bottle',
        amountMl: entry.amount
      }
    };
    await firstValueFrom(this.http.post(this.apiUrl, payload));
  }

  async addDiaper(entry: DiaperEntry) {
    // Map diaper types. If type doesn't perfectly match, default to 'wet'
    let kind = 'wet';
    if (entry.type === 'poop') kind = 'dirty';
    if (entry.type === 'mixed') kind = 'mixed';

    const payload: CreateEventInput = {
      type: 'diaper',
      startTime: entry.timestamp.toISOString(),
      details: { kind }
    };
    await firstValueFrom(this.http.post(this.apiUrl, payload));
  }

  async getTodayFeedCount(): Promise<number> {
    try {
      const events = await firstValueFrom(this.http.get<BabyEvent[]>(`${this.apiUrl}/today?type=feed`));
      return events.length;
    } catch {
      return 0;
    }
  }

  async getTodayDiaperCount(): Promise<number> {
    try {
      const events = await firstValueFrom(this.http.get<BabyEvent[]>(`${this.apiUrl}/today?type=diaper`));
      return events.length;
    } catch {
      return 0;
    }
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
}

