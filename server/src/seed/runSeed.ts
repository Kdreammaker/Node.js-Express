/**
 * 시드 데이터 주입.
 * 각 테이블이 비어있을 때만 실행합니다 (중복 방지).
 *
 * [동작 방식]
 * - DB 과제 SQL을 이미 실행했으면 → performances, seats는 건너뜀
 * - 아직 실행하지 않았으면 → 자동으로 생성 (DB 과제 없이도 바로 실행 가능)
 */
import { Performance, Seat, User, Booking } from '../models/index.js';

// ── 공연 데이터 (DB 과제와 동일) ────────────────────────
const DEMO_PERFORMANCES = [
    { pf_id: 1, title: '2026 월드 투어: 아델 내한공연', start_at: new Date('2026-03-15T19:30:00'), price: 180000 },
    { pf_id: 2, title: '뮤지컬 <알라딘> 한국 초연',     start_at: new Date('2026-05-20T14:00:00'), price: 160000 },
    { pf_id: 3, title: '2026 AI 아트 & 재즈 페스티벌',  start_at: new Date('2026-06-10T18:00:00'), price:  99000 },
];

// ── 좌석 데이터 (공연당 그리드) ──────────────────────────
// 아델(1): 4행 × 5열 = 20석 (seat_id 1~20)
// 알라딘(2): 3행 × 4열 = 12석 (seat_id 21~32)
// 재즈(3): 2행 × 5열 = 10석 (seat_id 33~42)
function generateSeats(pfId: number, rows: number, cols: number, startId: number) {
    const seats = [];
    let id = startId;
    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            seats.push({ seat_id: id++, pf_id: pfId, row_num: r, col_num: c, is_available: true });
        }
    }
    return seats;
}

function buildSeedSeats() {
    return [
        ...generateSeats(1, 4, 5, 1),   // seat_id  1~20
        ...generateSeats(2, 3, 4, 21),  // seat_id 21~32
        ...generateSeats(3, 2, 5, 33),  // seat_id 33~42
    ];
}

// ── 유저 데이터 ──────────────────────────────────────────
const DEMO_USERS = [
    { user_id: 'user-001', name: '김민준', email: 'minjun@example.com' },
    { user_id: 'user-002', name: '이서연', email: 'seoyeon@example.com' },
    { user_id: 'user-003', name: '박지훈', email: 'jihun@example.com' },
];

export async function runSeed() {
    // 1. 공연
    const perfCount = await Performance.count();
    if (perfCount === 0) {
        await Performance.bulkCreate(DEMO_PERFORMANCES);
        console.log('[Seed] 공연 3개 생성');
    } else {
        console.log('[Seed] 공연 데이터 있음 — 건너뜀');
    }

    // 2. 좌석
    const seatCount = await Seat.count();
    if (seatCount === 0) {
        await Seat.bulkCreate(buildSeedSeats());
        // 아델 공연 1열2번, 2열3번은 이미 예약된 상태로 시작
        await Seat.update({ is_available: false }, { where: { seat_id: [2, 8] } });
        console.log('[Seed] 좌석 42석 생성 (2석 예약 상태)');
    } else {
        console.log('[Seed] 좌석 데이터 있음 — 건너뜀');
    }

    // 3. 유저
    const userCount = await User.count();
    if (userCount === 0) {
        await User.bulkCreate(DEMO_USERS);
        console.log('[Seed] 유저 3명 생성');
    } else {
        console.log('[Seed] 유저 데이터 있음 — 건너뜀');
    }

    // 4. 샘플 예약 (예약된 좌석과 연결)
    const bookingCount = await Booking.count();
    if (bookingCount === 0) {
        const bookedSeats = await Seat.findAll({ where: { is_available: false } });
        if (bookedSeats.length >= 2) {
            await Booking.bulkCreate([
                { user_id: 'user-001', seat_id: bookedSeats[0].seat_id, pf_id: bookedSeats[0].pf_id, status: 'confirmed' },
                { user_id: 'user-002', seat_id: bookedSeats[1].seat_id, pf_id: bookedSeats[1].pf_id, status: 'confirmed' },
            ]);
            console.log('[Seed] 샘플 예약 2건 생성');
        }
    } else {
        console.log('[Seed] 예약 데이터 있음 — 건너뜀');
    }

    console.log('[Seed] 완료!');
}
