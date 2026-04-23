import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BabyEvent, CreateEventInput } from '../models/backend.model';
import { firstValueFrom } from 'rxjs';
import { SleepEntry } from '../models/sleep.model';

const ACTIVE_SLEEP_KEY = 'baby_active_sleep';

@Injectable({ providedIn: 'root' })
export class SleepService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/events';

  startSleep(): void {
    localStorage.setItem(ACTIVE_SLEEP_KEY, new Date().toISOString());
  }

  async stopSleep(): Promise<BabyEvent | null> {
    const activeStart = this.getActiveSleepStart();
    if (!activeStart) return null;

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - activeStart.getTime()) / 60000);

    const payload: CreateEventInput = {
      type: 'sleep',
      startTime: activeStart.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes,
      details: {}
    };

    try {
      const event = await firstValueFrom(this.http.post<BabyEvent>(this.apiUrl, payload));
      localStorage.removeItem(ACTIVE_SLEEP_KEY);
      return event;
    } catch (e) {
      console.error('Failed to save sleep', e);
      return null;
    }
  }

  isSleeping(): boolean {
    return this.getActiveSleepStart() !== null;
  }

  getActiveSleepStart(): Date | null {
    const active = localStorage.getItem(ACTIVE_SLEEP_KEY);
    return active ? new Date(active) : null;
  }

  async getTodayTotalMinutes(): Promise<number> {
    try {
      const events = await firstValueFrom(this.http.get<BabyEvent[]>(`${this.apiUrl}/today?type=sleep`));
      return events.reduce((acc, ev) => acc + (ev.durationMinutes || 0), 0);
    } catch {
      return 0;
    }
  }
}
