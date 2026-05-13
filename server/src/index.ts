/**
 * 진입점: 환경 변수 로드 → DB 초기화 → 서버 기동
 *
 * [학습 포인트]
 * - 비동기 초기화가 완료된 후에 서버를 띄워야 합니다.
 * - DB 연결 실패 시 process.exit(1)로 안전하게 종료합니다.
 */
import 'dotenv/config';
import { createApp } from './app.js';
import { initDatabase } from './bootstrap/database.js';

const PORT = Number(process.env.PORT) || 3001;

async function main() {
    await initDatabase();
    const app = createApp();
    app.listen(PORT, () => {
        console.log(`서버 실행 중: http://localhost:${PORT}`);
    });
}

main().catch((err) => {
    console.error('서버 기동 실패:', err);
    process.exit(1);
});
