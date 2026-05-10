import {
  Component, ChangeDetectionStrategy, inject, signal,
  ViewChildren, ElementRef, AfterViewInit, OnDestroy, QueryList
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { EventsApiService } from '../../../core/services/events-api.service';
import type { BabyEvent, EventType } from '../../../core/models/backend.model';

// Register all Chart.js components
Chart.register(...registerables);

/**
 * Config-driven dataset definition.
 * Each config produces its own separate chart card.
 */
interface ChartDatasetConfig {
  label: string;
  type: EventType;
  color: string;
  yAxisLabel: string;
  /** Extract a numeric value from a day's events. */
  getValue: (events: BabyEvent[]) => number;
}

/** Each dataset gets its own chart card. */
const DATASET_CONFIGS: ChartDatasetConfig[] = [
  {
    label: 'Sleep',
    type: 'sleep',
    color: '#7c3aed',
    yAxisLabel: 'hours',
    getValue: (events) => {
      const totalMin = events.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
      return Math.round((totalMin / 60) * 100) / 100; // 2 decimal places
    }
  },
  {
    label: 'Feeds',
    type: 'feed',
    color: '#0891b2',
    yAxisLabel: 'count',
    getValue: (events) => events.length
  },
  {
    label: 'Diapers',
    type: 'diaper',
    color: '#0d9488',
    yAxisLabel: 'count',
    getValue: (events) => events.length
  }
];

/** Available range presets. */
interface RangeOption {
  value: number;
  label: string;
}

const RANGE_OPTIONS: RangeOption[] = [
  { value: 7, label: '7D' },
  { value: 14, label: '14D' },
  { value: 30, label: '30D' }
];

interface DayData {
  label: string;
  date: string;
}

/** Per-chart computed data. */
interface ChartCardData {
  config: ChartDatasetConfig;
  values: number[];
  days: DayData[];
}

/**
 * Charts tab — separate chart per metric with shared range selector.
 * Makes only 3 API calls (one per dataset type) regardless of range size.
 */
@Component({
  selector: 'app-history-charts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history-charts.html',
  styleUrl: './history-charts.scss'
})
export class HistoryCharts implements AfterViewInit, OnDestroy {
  private readonly api = inject(EventsApiService);
  private charts: Chart[] = [];

  protected readonly rangeOptions = RANGE_OPTIONS;
  protected readonly selectedRange = signal(7);
  protected readonly chartCards = signal<ChartCardData[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly datasetConfigs = DATASET_CONFIGS;

  @ViewChildren('chartCanvas')
  private canvasRefs!: QueryList<ElementRef<HTMLCanvasElement>>;

  ngAfterViewInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  /** Called when user taps a range preset button. */
  protected onRangeChange(range: number): void {
    if (range === this.selectedRange()) return;
    this.selectedRange.set(range);
    this.loadChartData();
  }

  /**
   * Load chart data using only 3 API calls (one per dataset type).
   * Events are grouped per day client-side.
   */
  private loadChartData(): void {
    const range = this.selectedRange();
    const days = this.getDays(range);
    const startDate = days[0].date;
    const endDate = days[days.length - 1].date;

    this.isLoading.set(true);
    this.hasError.set(false);

    // One request per dataset type — 3 total regardless of range
    const requests = DATASET_CONFIGS.map((config) =>
      this.api.getEventsByDateRange(startDate, endDate, config.type)
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        // Group each result set by YYYY-MM-DD
        const groupedByType: Map<string, BabyEvent[]>[] = results.map(
          (events) => this.groupByDay(events)
        );

        // Build per-chart data
        const cards: ChartCardData[] = DATASET_CONFIGS.map((config, configIdx) => {
          const values = days.map((day) => {
            const dayEvents = groupedByType[configIdx].get(day.date) || [];
            return config.getValue(dayEvents);
          });
          return { config, values, days };
        });

        this.chartCards.set(cards);
        this.isLoading.set(false);

        // Defer to next tick — canvases enter the DOM after @if re-evaluates
        setTimeout(() => this.renderAllCharts(cards));
      },
      error: () => {
        this.chartCards.set([]);
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  /** Group events by their startTime date (YYYY-MM-DD). */
  private groupByDay(events: BabyEvent[]): Map<string, BabyEvent[]> {
    const map = new Map<string, BabyEvent[]>();
    for (const event of events) {
      const dayKey = event.startTime.substring(0, 10);
      const existing = map.get(dayKey);
      if (existing) {
        existing.push(event);
      } else {
        map.set(dayKey, [event]);
      }
    }
    return map;
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  private renderAllCharts(cards: ChartCardData[]): void {
    this.destroyCharts();

    const canvases = this.canvasRefs?.toArray();
    if (!canvases || canvases.length === 0) return;

    const range = this.selectedRange();

    cards.forEach((card, idx) => {
      const canvas = canvases[idx];
      if (!canvas) return;

      const ctx = canvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: card.days.map((d) => d.label),
          datasets: [{
            label: card.config.label,
            data: card.values,
            backgroundColor: card.config.color + '33',
            borderColor: card.config.color,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              titleFont: { family: 'inherit', weight: 'bold' },
              bodyFont: { family: 'inherit' },
              cornerRadius: 8,
              padding: 10,
              callbacks: {
                label: (ctx) => {
                  const val = ctx.parsed.y || 0;
                  if (card.config.yAxisLabel === 'hours') {
                    const h = Math.floor(val);
                    const m = Math.round((val - h) * 60);
                    return h > 0 ? `${card.config.label}: ${h}h ${m}m` : `${card.config.label}: ${m}m`;
                  }
                  return `${card.config.label}: ${val}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                autoSkip: false, // We control skipping manually
                font: { family: 'inherit', weight: 'bold', size: range <= 14 ? 12 : 9 },
                color: '#475569',
                maxRotation: range > 14 ? 45 : 0,
                callback: function(val, index, ticks) {
                  // For 7D and 14D, show all labels
                  if (range <= 14) return this.getLabelForValue(val as number);
                  
                  // For 30D: Always show first, last ("Today"), and roughly every 6th label
                  if (index === 0 || index === ticks.length - 1 || index % 6 === 0) {
                    return this.getLabelForValue(val as number);
                  }
                  return null; // Skip drawing this label
                }
              },
              border: { display: false }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: card.config.yAxisLabel,
                font: { family: 'inherit', weight: 'bold', size: 12 },
                color: '#64748b'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.06)'
              },
              ticks: {
                font: { family: 'inherit', size: 11 },
                color: '#64748b',
                stepSize: card.config.yAxisLabel === 'count' ? 1 : undefined
              },
              border: { display: false }
            }
          }
        }
      });

      this.charts.push(chart);
    });
  }

  /** Generate day entries for the selected range. */
  private getDays(range: number): DayData[] {
    const days: DayData[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      const label = i === 0
        ? 'Today'
        : `${monthNames[d.getMonth()]} ${d.getDate()}`;

      days.push({ label, date: dateStr });
    }

    return days;
  }
}
