/**
 * DB 초기화 순서: 연결 확인 → 테이블 동기화 → 시드 데이터 주입
 *
 * [학습 포인트]
 * - sequelize.sync()는 모델 정의를 보고 없는 테이블만 새로 만듭니다.
 *   (force: false가 기본값 — 기존 테이블은 건드리지 않음)
 * - DB 과제에서 만든 performances, seats 테이블은 그대로 유지됩니다.
 * - users, bookings 테이블은 이 과정에서 자동으로 생성됩니다.
 */
import { sequelize } from '../config/database.js';
import '../models/index.js'; // 모델 정의 + 관계 선언 실행
import { runSeed } from '../seed/runSeed.js';

export async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log('[DB] MySQL 연결 성공');

        // 기존 테이블(performances, seats)은 건드리지 않고,
        // 없는 테이블(users, bookings)만 새로 생성합니다.
        await sequelize.sync({ force: false });
        console.log('[DB] 테이블 동기화 완료');

        if (process.env.SEED_ON_BOOT === 'true') {
            await runSeed();
        }
    } catch (err) {
        console.error('[DB] 초기화 실패:', err);
        throw err;
    }
}
