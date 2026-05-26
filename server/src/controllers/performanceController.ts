/**
 * 공연 관련 비즈니스 로직.
 *
 * [oz-dev-log 패턴]
 * - routes/는 HTTP 처리만 담당합니다 (req/res 파싱, next(err) 위임).
 * - 실제 데이터 조회·가공 로직은 이 controller에 작성합니다.
 */
import { sequelize } from '../config/database.js';
import { Performance, Seat } from '../models/index.js';

function badRequest(msg: string) {
    const err: any = new Error(msg);
    err.status = 400;
    return err;
}

function notFound(msg: string) {
    const err: any = new Error(msg);
    err.status = 404;
    return err;
}

// ══════════════════════════════════════════════════════════
// 💡 [과제 1] 공연 목록 조회
//    GET /performances
//    모든 공연과 각 공연에 속한 좌석 목록을 함께 반환합니다.
// ══════════════════════════════════════════════════════════
export async function listPerformances() {
  const performances = await Performance.findAll({

    // 💡 [과제 1-1] Seat 모델을 함께 가져오도록 include 옵션을 작성하세요.
    //    힌트: models/index.ts에서 as 별칭을 확인하세요. ('seats')
    include: [{ model: Seat, as: 'seats' }],

    // 💡 [과제 1-2] pf_id 기준 오름차순으로 정렬하세요.
    //    힌트: order: [['컬럼명', 'ASC'|'DESC']]
    order: [['pf_id', 'ASC']],
  });

  // 💡 [과제 1-3] 아래 형태로 직렬화해서 반환하세요.
  //    available_count: is_available이 true인 좌석 수
  //    total_count: 전체 좌석 수
  return performances.map((p) => {
    const seats = (p as any).seats as Seat[];
    return {
      pf_id: p.pf_id,
      title: p.title,
      start_at: p.start_at,
      price: p.price,
      seats,
      available_count: seats.filter((s) => s.is_available).length,
      total_count: seats.length,
    };
  });
}

// ══════════════════════════════════════════════════════════
// 💡 [과제 2] 공연 상세 조회
//    GET /performances/:id
//    특정 공연 1개 + 좌석 목록을 반환합니다. 없으면 404 에러.
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
export async function getPerformance(id: number) {
  const performance = await Performance.findOne({

    // 💡 [과제 2-1] pf_id가 id인 공연을 찾는 where 조건을 작성하세요.
    //    좌석 목록도 함께 가져와야 합니다.
    where: { pf_id: id },
    include: [{ model: Seat, as: 'seats' }],
  });

  // 💡 [과제 2-2] 공연이 없을 때 404 에러를 던지세요.
  //    힌트: notFound() 함수가 이미 파일 상단에 정의되어 있습니다.
  if (!performance) throw notFound('공연을 찾을 수 없습니다.');

  const seats = (performance as any).seats as Seat[];
  return {
    pf_id: performance.pf_id,
    title: performance.title,
    start_at: performance.start_at,
    price: performance.price,
    seats,
    available_count: seats.filter((s) => s.is_available).length,
    total_count: seats.length,
  };
}

// ══════════════════════════════════════════════════════════
// 공연 추가 — POST /performances
// Body: { title, start_at, price }
//
// [AUTO_INCREMENT 없는 PK 처리]
// DB 과제 스키마는 pf_id를 수동으로 관리합니다.
// 트랜잭션 안에서 MAX(pf_id) + 1로 다음 ID를 계산해
// 동시 요청이 와도 ID가 겹치지 않게 합니다.
// ══════════════════════════════════════════════════════════
export async function createPerformance({ title, start_at, price }: {
    title: string;
    start_at: string;
    price: number;
}) {
    if (!title || !start_at || !price) throw badRequest('title, start_at, price가 필요합니다.');

    return sequelize.transaction(async (t) => {
        const maxId = (await Performance.max('pf_id', { transaction: t }) as number) ?? 0;
        const nextId = maxId + 1;

        const perf = await Performance.create(
            { pf_id: nextId, title, start_at: new Date(start_at), price },
            { transaction: t }
        );
        return { pf_id: perf.pf_id, title: perf.title, start_at: perf.start_at, price: perf.price };
    });
}

// ══════════════════════════════════════════════════════════
// 좌석 일괄 추가 — POST /performances/:id/seats
// Body: { rows, cols }  →  rows × cols 격자 좌석을 자동 생성
//
// 예) rows: 3, cols: 5 → A~C열, 1~5번 총 15석 추가
// ══════════════════════════════════════════════════════════
export async function addSeats(pfId: number, { rows, cols }: { rows: number; cols: number }) {
    if (!rows || !cols || rows < 1 || cols < 1) {
        throw badRequest('rows와 cols는 1 이상의 숫자여야 합니다.');
    }

    const performance = await Performance.findByPk(pfId);
    if (!performance) throw notFound('공연을 찾을 수 없습니다.');

    return sequelize.transaction(async (t) => {
        const maxSeatId = (await Seat.max('seat_id', { transaction: t }) as number) ?? 0;

        const newSeats = [];
        let nextId = maxSeatId + 1;
        for (let r = 1; r <= rows; r++) {
            for (let c = 1; c <= cols; c++) {
                newSeats.push({ seat_id: nextId++, pf_id: pfId, row_num: r, col_num: c, is_available: true });
            }
        }

        await Seat.bulkCreate(newSeats, { transaction: t });
        return { added: newSeats.length, pf_id: pfId };
    });
}
