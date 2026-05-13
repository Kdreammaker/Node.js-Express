/**
 * /users 라우트 — HTTP 처리만.
 */
import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        res.json(await userController.listUsers());
    } catch (err) {
        next(err);
    }
});

router.get('/:userId/bookings', async (req, res, next) => {
    try {
        res.json(await userController.getUserBookings(req.params.userId));
    } catch (err) {
        next(err);
    }
});

export default router;
