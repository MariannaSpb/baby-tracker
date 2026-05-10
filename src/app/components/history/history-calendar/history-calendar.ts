import {
  Component, ChangeDetectionStrategy, inject, signal, effect
} from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';

import { EventsApiService } from '../../../core/services/events-api.service';
import { EventTimeline } from '../../../shared/components/event-timeline/event-timeline';
import type { BabyEvent } from '../../../core/models/backend.model';

/**
 * Calendar tab — date picker with event timeline for the selected date.
 */
@Component({
  selector: 'app-history-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    EventTimeline
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './history-calendar.html',
  styleUrl: './history-calendar.scss'
})
export class HistoryCalendar {
  private readonly api = inject(EventsApiService);

  protected readonly selectedDate = signal<Date>(new Date());
  protected readonly events = signal<BabyEvent[]>([]);
  protected readonly isLoading = signal(false);

  /** Today's date for max-date on datepicker. */
  protected readonly today = new Date();

  constructor() {
    // Fetch events whenever selectedDate changes
    effect(() => {
      const date = this.selectedDate();
      this.loadEventsForDate(date);
    });
  }

  protected onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate.set(date);
    }
  }

  private loadEventsForDate(date: Date): void {
    const dateStr = this.formatDate(date);
    this.isLoading.set(true);

    this.api.getEventsByDate(dateStr).subscribe({
      next: (events) => {
        // Sort newest first
        const sorted = events.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        this.events.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.isLoading.set(false);
      }
    });
  }

  /** Format a Date to YYYY-MM-DD string. */
  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
