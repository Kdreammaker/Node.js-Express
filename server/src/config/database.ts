/**
 * Sequelize 인스턴스 생성.
 *
 * [학습 포인트]
 * - TypeORM의 DataSource와 같은 역할입니다.
 * - dialect: 'mysql' — Sequelize는 MySQL, PostgreSQL 등 여러 DB를 지원합니다.
 * - 접속 정보는 .env에서 읽어 코드에 하드코딩하지 않습니다.
 */
import { Sequelize } from 'sequelize';

const host     = process.env.DB_HOST     ?? 'localhost';
const port     = Number(process.env.DB_PORT) || 3306;
const database = process.env.DB_NAME     ?? 'ticket_db';
const username = process.env.DB_USER     ?? 'root';
const password = process.env.DB_PASSWORD ?? '';

export const sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    timezone: '+09:00',
    dialectOptions: { charset: 'utf8mb4' },
    define: {
        underscored: false,
        timestamps: false,
        charset: 'utf8mb4',
    },
});
