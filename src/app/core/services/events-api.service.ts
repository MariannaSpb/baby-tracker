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
