/**
 * seats 테이블 — DB 과제에서 만든 테이블과 연결됩니다.
 *
 * [학습 포인트]
 * - is_available 컬럼이 예약 가능 여부를 표시합니다.
 * - 예약 시 트랜잭션 안에서 이 값을 false로 변경합니다.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Seat extends Model<
    InferAttributes<Seat>,
    InferCreationAttributes<Seat>
> {
    declare seat_id: number;
    declare pf_id: number;
    declare row_num: number;
    declare col_num: number;
    declare is_available: boolean;
}

Seat.init(
    {
        seat_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: false,
        },
        pf_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        row_num: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        col_num: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'seats',
        timestamps: false,
    }
);
