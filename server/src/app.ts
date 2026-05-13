/**
 * Express 앱 팩토리.
 * index.ts는 "언제 띄울지", app.ts는 "어떻게 구성할지"만 담당합니다.
 *
 * [oz-dev-log 패턴]
 * routes/   — HTTP 처리만 (next(err)로 에러 위임)
 * controllers/ — 비즈니스 로직 + 데이터 접근
 * models/   — Sequelize 스키마 정의
 */
import express from 'express';
import cors from 'cors';
import { mountRoutes } from './routes/index.js';

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    mountRoutes(app);

    // 404 핸들러
    app.use((_req, res) => {
        res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
    });

    // 전역 에러 핸들러 — routes에서 next(err)로 넘어온 에러를 처리
    app.use((err: any, _req: any, res: any, _next: any) => {
        const status = Number(err.status) || 500;
        res.status(status).json({ error: err.message || '서버 오류가 발생했습니다.' });
    });

    return app;
}
