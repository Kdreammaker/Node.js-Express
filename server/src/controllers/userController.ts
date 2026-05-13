/**
 * 유저 관련 비즈니스 로직.
 */
import { User, Booking, Seat, Performance } from '../models/index.js';

function notFound(msg: string) {
    const err: any = new Error(msg);
    err.status = 404;
    return err;
}

// 유저 목록 조회 (데모 로그인용)
export async function listUsers() {
    const users = await User.findAll({ order: [['created_at', 'ASC']] });
    return users.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        email: u.email,
    }));
}

// ══════════════════════════════════════════════════════════
// 💡 [과제 5] 유저의 예약 목록 조회
//    GET /users/:userId/bookings
//    특정 유저가 예약한 내역을 공연·좌석 정보와 함께 반환합니다.
// ══════════════════════════════════════════════════════════
export async function getUserBookings(userId: string) {
  const user = await User.findByPk(userId);
  if (!user) throw notFound('유저를 찾을 수 없습니다.');

  const bookings = await Booking.findAll({
    where: { user_id: userId },

    // 💡 [과제 5-1] include 배열에 Seat, Performance를 동시에 넣어 JOIN하세요.
    //    Booking → Seat (as: 'seat')
    //    Booking → Performance (as: 'performance')
    include: [
      /* ??? */,
      /* ??? */,
    ],

    // 💡 [과제 5-2] booked_at 기준 내림차순(최신순)으로 정렬하세요.
    order: /* ??? */,
  });

  return bookings.map((b) => {
    const seat = (b as any).seat as Seat;
    const perf = (b as any).performance as Performance;
    return {
      booking_id: b.booking_id,
      status: b.status,
      booked_at: b.booked_at,
      seat: seat
        ? { seat_id: seat.seat_id, row_num: seat.row_num, col_num: seat.col_num }
        : null,
      performance: perf
        ? { pf_id: perf.pf_id, title: perf.title, start_at: perf.start_at, price: perf.price }
        : null,
    };
  });
}