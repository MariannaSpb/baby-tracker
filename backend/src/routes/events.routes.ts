import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as EventsController from '../controllers/events.controller';

export const eventsRouter = Router();

// All event routes require a valid Google Sign-in token
eventsRouter.use(authMiddleware);

// Note: /today must be declared BEFORE /:id to avoid Express treating "today" as an id param
eventsRouter.get('/today', EventsController.getTodayEvents);
eventsRouter.get('/', EventsController.getEvents);
eventsRouter.post('/', EventsController.createEvent);
eventsRouter.patch('/:id', EventsController.updateEvent);
eventsRouter.delete('/:id', EventsController.deleteEvent);
