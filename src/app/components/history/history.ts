import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { HistoryCalendar } from './history-calendar/history-calendar';
import { HistoryCharts } from './history-charts/history-charts';

type TabId = 'calendar' | 'charts';

/**
 * History page — container with two accessible tabs: Calendar and Charts.
 */
@Component({
  selector: 'app-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, HistoryCalendar, HistoryCharts],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class History {
  protected readonly activeTab = signal<TabId>('calendar');

  protected selectTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  /**
   * Handle keyboard navigation within the tablist.
   * Arrow keys move between tabs per WAI-ARIA Tabs pattern.
   */
  protected onTabKeydown(event: KeyboardEvent): void {
    const tabs: TabId[] = ['calendar', 'charts'];
    const current = tabs.indexOf(this.activeTab());

    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (current + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (current - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = tabs.length - 1;
    }

    if (next >= 0) {
      event.preventDefault();
      this.activeTab.set(tabs[next]);
      // Focus the newly active tab button
      const tabEl = (event.target as HTMLElement)
        .closest('[role="tablist"]')
        ?.querySelector<HTMLElement>(`#tab-${tabs[next]}`);
      tabEl?.focus();
    }
  }
}
