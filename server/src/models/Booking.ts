/**
 * bookings 테이블 — 누가 어떤 좌석을 예약했는지 기록합니다.
 *
 * [학습 포인트]
 * - 기존 방식: seat.is_available만 false로 바꿈 → 누가 예약했는지 알 수 없음
 * - 개선된 방식: Booking 레코드를 따로 만들어 예약 이력을 관리
 * - status: 'confirmed'(예약 확정) | 'cancelled'(취소)
 *
 * [관계]
 * Booking → User    (N:1) : 예약자
 * Booking → Seat    (N:1) : 좌석
 * Booking → Performance (N:1) : 공연
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Booking extends Model<
    InferAttributes<Booking>,
    InferCreationAttributes<Booking>
> {
    declare booking_id: CreationOptional<number>;
    declare user_id: string;
    declare seat_id: number;
    declare pf_id: number;
    declare status: CreationOptional<'confirmed' | 'cancelled'>;
    declare booked_at: CreationOptional<Date>;
}

Booking.init(
    {
        booking_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        seat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pf_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('confirmed', 'cancelled'),
            defaultValue: 'confirmed',
        },
        booked_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'bookings',
        timestamps: false,
    }
);
