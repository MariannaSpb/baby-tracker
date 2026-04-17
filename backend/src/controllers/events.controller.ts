import { Request, Response, NextFunction } from 'express';
import * as EventsService from '../services/events.service';
import { CreateEventInput } from '../models/event.model';

// POST /api/events
export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input: CreateEventInput = {
      ...req.body,
      // createdBy is always sourced from the verified auth token — never trusted from the client
      createdBy: req.user!.name || req.user!.email,
    };
    const event = await EventsService.createEvent(input);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

// GET /api/events/today?type=feed
export async function getTodayEvents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const type = req.query['type'] as string | undefined;
    const events = await EventsService.getTodayEvents(type);
    res.json(events);
  } catch (err) {
    next(err);
  }
}

// GET /api/events?limit=50&startAfterTime=2025-05-01T00:00:00Z
export async function getEvents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = parseInt(req.query['limit'] as string) || 50;
    const startAfterTime = req.query['startAfterTime'] as string | undefined;
    const events = await EventsService.getEvents(limit, startAfterTime);
    res.json(events);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/events/:id
export async function updateEvent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const event = await EventsService.updateEvent(id, req.body);
    res.json(event);
  } catch (err) {
    if ((err as Error).message === 'Event not found') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    next(err);
  }
}

// DELETE /api/events/:id
export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    await EventsService.deleteEvent(id);
    res.status(204).send();
  } catch (err) {
    if ((err as Error).message === 'Event not found') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    next(err);
  }
}
