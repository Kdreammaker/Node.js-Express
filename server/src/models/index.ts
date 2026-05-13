/**
 * 모델 모듈 진입점 — 관계(Association) 선언.
 *
 * [학습 포인트: oz-dev-log 패턴]
 * - 각 모델 파일은 스키마 정의만 합니다.
 * - 모델 간 관계(hasMany / belongsTo)는 이 파일에 한꺼번에 선언합니다.
 * - 관계를 선언하면 include 옵션으로 JOIN 조회가 가능해집니다.
 *
 * [관계 구조]
 * Performance 1 — N Seat       (공연 1개에 좌석 여러 개)
 * User        1 — N Booking    (유저 1명이 여러 번 예약)
 * Seat        1 — N Booking    (좌석 1개에 예약 이력 여러 개)
 * Performance 1 — N Booking    (공연 1개에 여러 예약)
 */
import { User } from './User.js';
import { Performance } from './Performance.js';
import { Seat } from './Seat.js';
import { Booking } from './Booking.js';

// Performance — Seat (1:N)
Performance.hasMany(Seat, { foreignKey: 'pf_id', as: 'seats' });
Seat.belongsTo(Performance, { foreignKey: 'pf_id', as: 'performance' });

// User — Booking (1:N)
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Seat — Booking (1:N)
Seat.hasMany(Booking, { foreignKey: 'seat_id', as: 'bookings' });
Booking.belongsTo(Seat, { foreignKey: 'seat_id', as: 'seat' });

// Performance — Booking (1:N)
Performance.hasMany(Booking, { foreignKey: 'pf_id', as: 'bookings' });
Booking.belongsTo(Performance, { foreignKey: 'pf_id', as: 'performance' });

export { User, Performance, Seat, Booking };
