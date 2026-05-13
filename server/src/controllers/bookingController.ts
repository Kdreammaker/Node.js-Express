/**
 * 예약 관련 비즈니스 로직.
 *
 * [핵심 학습 포인트: 트랜잭션]
 * 예약은 두 가지 작업이 동시에 성공해야 합니다:
 *   1. Booking 레코드 생성 (예약 이력)
 *   2. Seat.is_available = false (좌석 상태 변경)
 *
 * 둘 중 하나라도 실패하면 → 전체 롤백 (데이터 불일치 방지)
 * 이것이 트랜잭션의 역할입니다.
 */
import { sequelize } from '../config/database.js';
import { Seat, Booking, Performance, User } from '../models/index.js';

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

function forbidden(msg: string) {
    const err: any = new Error(msg);
    err.status = 403;
    return err;
}

// ══════════════════════════════════════════════════════════
// 💡 [과제 3] 좌석 예약 — 트랜잭션 사용
//    POST /bookings   Body: { userId, seatId }
// ══════════════════════════════════════════════════════════
export async function createBooking({ userId, seatId }: { userId: string; seatId: number }) {
  if (!userId || !seatId) throw badRequest('userId와 seatId가 필요합니다.');

  // 💡 [과제 3-1] sequelize.transaction()으로 트랜잭션을 시작하세요.
  //    콜백(t)에서 에러가 나면 자동 rollback, 정상이면 자동 commit입니다.
  return /* ??? */.transaction(async (t) => {

    // 💡 [과제 3-2] seat_id가 seatId인 좌석을 조회하세요.
    //    - 비관적 락(lock: true)을 걸어 동시 예약을 막아야 합니다.
    //    - 반드시 transaction: t 를 전달해야 합니다.
    const seat = await Seat.findOne({
      where: /* ??? */,
      lock: /* ??? */,
      transaction: /* ??? */,
    });

    // 💡 [과제 3-3] 좌석이 없거나 이미 예약된 경우 에러를 던지세요.
    //    throw되면 트랜잭션이 자동 롤백됩니다.
    if (/* ??? */) {
      throw badRequest('이미 예약되었거나 존재하지 않는 좌석입니다.');
    }

    // 💡 [과제 3-4] bookings 테이블에 예약 레코드를 생성하세요.
    //    필요한 필드: user_id, seat_id, pf_id, status: 'confirmed'
    //    반드시 { transaction: t } 를 두 번째 인자로 전달하세요.
    const booking = await Booking.create(
      { /* ??? */ },
      { transaction: t }
    );

    // 💡 [과제 3-5] 좌석 상태를 예약 불가로 바꾸고 저장하세요.
    //    seat.is_available = ???
    //    await seat.save({ transaction: ??? })
    /* ??? */

    return { success: true, booking_id: booking.booking_id, message: '예약 완료' };
  });
}

// ══════════════════════════════════════════════════════════
// 💡 [과제 4] 예약 취소
//    PATCH /bookings/:id/cancel   Body: { userId }
// ══════════════════════════════════════════════════════════
export async function cancelBooking(bookingId: number, userId: string) {

  // 💡 [과제 4-1] bookingId로 예약을 조회하세요.
  //    좌석 상태를 되돌려야 하므로 Seat 모델도 include 해야 합니다.
  //    (as 별칭: 'seat')
  const booking = await Booking.findOne({
    where: /* ??? */,
    include: /* ??? */,
  });

  if (!booking) throw notFound('예약을 찾을 수 없습니다.');

  // 💡 [과제 4-2] 본인 예약인지 확인하세요.
  //    booking.user_id와 요청으로 받은 userId를 비교합니다.
  //    힌트: forbidden() 함수가 파일 상단에 정의되어 있습니다.
  if (/* ??? */) throw forbidden('본인 예약만 취소할 수 있습니다.');

  if (booking.status === 'cancelled') throw badRequest('이미 취소된 예약입니다.');

  // 💡 [과제 4-3] 트랜잭션 안에서 취소 처리를 하세요.
  //    1) booking.status = 'cancelled' 후 save
  //    2) 연결된 좌석(seat)의 is_available = true 후 save
  return sequelize.transaction(async (t) => {
    /* ??? */

    return { success: true, message: '예약이 취소되었습니다.' };
  });
}