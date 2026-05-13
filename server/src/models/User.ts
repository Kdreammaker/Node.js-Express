/**
 * users 테이블.
 *
 * [학습 포인트]
 * - user_id는 UUID 문자열 (CHAR 36)입니다.
 *   정수 자동증가(AUTO_INCREMENT) 대신 UUID를 쓰면
 *   분산 환경에서도 ID 충돌 없이 생성할 수 있습니다.
 * - Sequelize에서 모델 = 테이블 하나.
 *   TypeORM의 @Entity 클래스와 같은 역할입니다.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database.js';

export class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare user_id: string;
    declare name: string;
    declare email: string;
    declare created_at: CreationOptional<Date>;
}

User.init(
    {
        user_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: false,
    }
);
