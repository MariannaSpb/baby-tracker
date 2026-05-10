import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BabyEvent, CreateEventInput, EventType } from '../models/backend.model';

/**
 * Pure HTTP layer for the events API.
 * Stateless — returns Observables, holds no signals, performs no side effects.
 */
@Injectable({ providedIn: 'root' })
export class EventsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl + '/events';

  getTodayEvents(type: EventType): Observable<BabyEvent[]> {
    return this.http.get<BabyEvent[]>(`${this.baseUrl}/today`, {
      params: { type }
    });
  }

  // Read yesterday's events
  getYesterdayEvents(type: EventType): Observable<BabyEvent[]> {
    return this.http.get<BabyEvent[]>(`${this.baseUrl}/yesterday`, {
      params: { type }
    });
  }

  createEvent(input: CreateEventInput): Observable<BabyEvent> {
    return this.http.post<BabyEvent>(this.baseUrl, input);
  }

  getEvents(params?: {
    limit?: number;
    startAfter?: string;
    type?: EventType;
  }): Observable<BabyEvent[]> {
    return this.http.get<BabyEvent[]>(this.baseUrl, {
      params: params as Record<string, string>
    });
  }

  /**
   * Fetch events for a specific date (YYYY-MM-DD format).
   * Optionally filter by event type.
   */
  getEventsByDate(date: string, type?: EventType): Observable<BabyEvent[]> {
    const params: Record<string, string> = { date };
    if (type) {
      params['type'] = type;
    }
    return this.http.get<BabyEvent[]>(this.baseUrl, { params });
  }

  /**
   * Fetch events for a date range (both YYYY-MM-DD format, inclusive).
   * Optionally filter by event type.
   */
  getEventsByDateRange(startDate: string, endDate: string, type?: EventType): Observable<BabyEvent[]> {
    const params: Record<string, string> = { startDate, endDate };
    if (type) {
      params['type'] = type;
    }
    return this.http.get<BabyEvent[]>(this.baseUrl, { params });
  }

  updateEvent(
    id: string,
    input: Partial<CreateEventInput>
  ): Observable<BabyEvent> {
    return this.http.patch<BabyEvent>(`${this.baseUrl}/${id}`, input);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
