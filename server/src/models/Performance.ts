/**
 * performances 테이블 — DB 과제에서 만든 테이블과 연결됩니다.
 *
 * [학습 포인트]
 * - synchronize: false(TypeORM) / sync({ force: false })(Sequelize) 덕분에
 *   이미 존재하는 테이블의 구조를 변경하지 않고 그대로 읽습니다.
 * - pf_id는 DB 과제에서 AUTO_INCREMENT 없이 만들었으므로 autoIncrement: false.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Performance extends Model<
    InferAttributes<Performance>,
    InferCreationAttributes<Performance>
> {
    declare pf_id: number;
    declare title: string;
    declare start_at: Date;
    declare price: number;
}

Performance.init(
    {
        pf_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        start_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'performances',
        timestamps: false,
    }
);
