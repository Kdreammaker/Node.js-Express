/**
 * /performances 라우트 — HTTP 처리만.
 * 비즈니스 로직은 performanceController에 위임합니다.
 */
import express from 'express';
import * as performanceController from '../controllers/performanceController.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const data = await performanceController.listPerformances();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const data = await performanceController.getPerformance(id);
        res.json(data);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const data = await performanceController.createPerformance(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/seats', async (req, res, next) => {
    try {
        const pfId = Number(req.params.id);
        const data = await performanceController.addSeats(pfId, req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

export default router;
