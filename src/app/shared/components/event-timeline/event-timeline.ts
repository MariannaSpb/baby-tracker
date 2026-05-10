import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

import type { BabyEvent } from '../../../core/models/backend.model';

/**
 * Reusable timeline component that renders a list of BabyEvent items.
 * Used by both the Dashboard (today's events) and the History Calendar tab.
 */
@Component({
  selector: 'app-event-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, DatePipe],
  templateUrl: './event-timeline.html',
  styleUrl: './event-timeline.scss'
})
export class EventTimeline {
  /** The events to display, sorted by caller. */
  readonly events = input.required<BabyEvent[]>();

  /** Message to display when no events exist. */
  readonly emptyMessage = input<string>('No events');

  /** Whether the event list is empty. */
  readonly isEmpty = computed(() => this.events().length === 0);

  /** Get the Material icon name for an event type. */
  protected getIcon(type: string): string {
    switch (type) {
      case 'feed': return 'child_care';
      case 'sleep': return 'bedtime';
      case 'diaper': return 'water_drop';
      default: return 'event';
    }
  }

  /** Get a CSS modifier class for the event type color. */
  protected getTypeClass(type: string): string {
    switch (type) {
      case 'feed': return 'timeline-item--feed';
      case 'sleep': return 'timeline-item--sleep';
      case 'diaper': return 'timeline-item--diaper';
      default: return '';
    }
  }

  /** Format event details into a human-readable string. */
  protected getDetails(event: BabyEvent): string {
    const details = event.details;
    switch (event.type) {
      case 'feed': {
        const feedType = (details['feedType'] as string) || '';
        const amount = details['amountMl'] as number | undefined;
        const parts = [feedType.charAt(0).toUpperCase() + feedType.slice(1)];
        if (amount) parts.push(`${amount} ml`);
        return parts.join(' · ');
      }
      case 'sleep': {
        if (event.durationMinutes) {
          const h = Math.floor(event.durationMinutes / 60);
          const m = event.durationMinutes % 60;
          return h > 0 ? `${h}h ${m}m` : `${m}m`;
        }
        return event.endTime ? 'Completed' : 'In progress';
      }
      case 'diaper': {
        const kind = (details['kind'] as string) || '';
        return kind.charAt(0).toUpperCase() + kind.slice(1);
      }
      default:
        return '';
    }
  }

  /** Human-readable label for the event type. */
  protected getTypeLabel(type: string): string {
    switch (type) {
      case 'feed': return 'Feed';
      case 'sleep': return 'Sleep';
      case 'diaper': return 'Diaper';
      default: return type;
    }
  }
}
