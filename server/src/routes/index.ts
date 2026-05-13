import { Express } from 'express';
import performancesRouter from './performances.js';
import bookingsRouter from './bookings.js';
import usersRouter from './users.js';

export function mountRoutes(app: Express) {
    app.use('/performances', performancesRouter);
    app.use('/bookings', bookingsRouter);
    app.use('/users', usersRouter);
}
