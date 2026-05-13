/**
 * /bookings 라우트 — HTTP 처리만.
 */
import express from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { userId, seatId } = req.body;
        const result = await bookingController.createBooking({ userId, seatId });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/cancel', async (req, res, next) => {
    try {
        const bookingId = Number(req.params.id);
        const { userId } = req.body;
        const result = await bookingController.cancelBooking(bookingId, userId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
