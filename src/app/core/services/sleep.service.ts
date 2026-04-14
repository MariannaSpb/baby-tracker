import { Injectable } from '@angular/core';
import { SleepEntry } from '../models/sleep.model';

const SLEEP_KEY = 'baby_sleep';
const ACTIVE_SLEEP_KEY = 'baby_active_sleep';

@Injectable({ providedIn: 'root' })
export class SleepService {
  startSleep(): void {
    localStorage.setItem(ACTIVE_SLEEP_KEY, new Date().toISOString());
  }

  stopSleep(): SleepEntry | null {
    const activeStart = this.getActiveSleepStart();
    if (!activeStart) return null;

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - activeStart.getTime()) / 60000);

    const entry: SleepEntry = {
      startTime: activeStart,
      endTime,
      durationMinutes
    };

    const all = this.getAll();
    all.push(entry);
    this.setAll(all);

    localStorage.removeItem(ACTIVE_SLEEP_KEY);
    return entry;
  }

  isSleeping(): boolean {
    return this.getActiveSleepStart() !== null;
  }

  getActiveSleepStart(): Date | null {
    const active = localStorage.getItem(ACTIVE_SLEEP_KEY);
    return active ? new Date(active) : null;
  }

  getTodayTotalMinutes(): number {
    return this.getToday().reduce((total, entry) => total + entry.durationMinutes, 0);
  }

  getToday(): SleepEntry[] {
    const today = new Date();
    return this.getAll().filter(e => this.isSameLocalDay(e.startTime, today));
  }

  private getAll(): SleepEntry[] {
    try {
      const raw = localStorage.getItem(SLEEP_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as (Omit<SleepEntry, 'startTime' | 'endTime'> & { startTime: string, endTime: string })[];
      return parsed.map(e => ({
        ...e,
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime)
      }));
    } catch { return []; }
  }

  private setAll(entries: SleepEntry[]) {
    const stored = entries.map(e => ({
      ...e,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString()
    }));
    localStorage.setItem(SLEEP_KEY, JSON.stringify(stored));
  }

  private isSameLocalDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
