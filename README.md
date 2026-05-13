# 티켓 예매 시스템 — Node.js 최종 과제

DB 과제에서 설계한 `ticket_db`를 바탕으로 Express + Sequelize REST API 서버를 완성하세요.

## 서비스 구조

```
ticket-booking/
├── server/                       ← 백엔드 (Express + Sequelize + MySQL)
│   ├── src/
│   │   ├── index.ts              ← 제공: 진입점
│   │   ├── app.ts                ← 제공: Express 앱 팩토리
│   │   ├── config/database.ts    ← 제공: Sequelize 인스턴스
│   │   ├── bootstrap/database.ts ← 제공: DB 연결 + 테이블 동기화 + 시드
│   │   ├── models/               ← 제공: 스키마 정의 + 관계 선언
│   │   │   ├── User.ts, Performance.ts, Seat.ts, Booking.ts
│   │   │   └── index.ts          (hasMany / belongsTo 관계)
│   │   ├── controllers/          ← 💡 과제: 비즈니스 로직
│   │   │   ├── performanceController.ts  (과제 1, 2)
│   │   │   ├── bookingController.ts      (과제 3, 4 — 트랜잭션 핵심)
│   │   │   └── userController.ts         (과제 5)
│   │   └── routes/               ← 제공: HTTP 라우팅만
│   └── .env.example
└── client/                       ← 제공: React + Vite 프론트엔드
```

## DB 구조 (DB 과제 + 신규)

```
[DB 과제에서 설계]          [이 과제에서 추가 — Sequelize가 자동 생성]
performances                users
  pf_id (PK)                  user_id (UUID, PK)
  title                       name
  start_at                    email
  price                       created_at

seats                       bookings
  seat_id (PK)                booking_id (PK, AUTO_INCREMENT)
  pf_id (FK)                  user_id (FK → users)
  row_num                     seat_id (FK → seats)
  col_num                     pf_id  (FK → performances)
  is_available                status ('confirmed' | 'cancelled')
                              booked_at
```

## 시작하기

### 1. DB 준비 (DB 과제에서 이미 완료)

`ticket_db`에 아래 데이터가 들어있어야 합니다.
```sql
INSERT INTO performances VALUES (1, '2026 월드 투어: 아델 내한공연',  '2026-03-15 19:30:00', 180000);
INSERT INTO performances VALUES (2, '뮤지컬 <알라딘> 한국 초연',      '2026-05-20 14:00:00', 160000);
INSERT INTO performances VALUES (3, '2026 AI 아트 & 재즈 페스티벌',   '2026-06-10 18:00:00',  99000);
-- seats 데이터도 DB 과제의 내용 그대로
```

### 2. 서버 설정

```bash
cd server
cp .env.example .env        # DB_PASSWORD를 본인 비밀번호로 수정
npm install
npm run dev                 # 서버 기동 + users/bookings 테이블 자동 생성 + 시드
```

### 3. 클라이언트 실행 (새 터미널)

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

---

## 과제 목표

`controllers/` 폴더의 `💡 [과제]` 주석이 달린 부분을 읽고 이해하세요.

| 과제 | 파일 | 핵심 개념 |
|------|------|-----------|
| 과제 1, 2 | `performanceController.ts` | `findAll` + `include` (JOIN 조회), `findOne` + `where`, 404 처리 |
| 과제 3, 4 | `bookingController.ts`     | `sequelize.transaction()`, 비관적 락, `Booking.create`, `seat.save` |
| 과제 5    | `userController.ts`        | 중첩 `include` (여러 테이블 동시 JOIN) |

## API 명세

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/performances` | 공연 목록 + 잔여석 수 |
| GET | `/performances/:id` | 공연 상세 + 좌석 현황 |
| GET | `/users` | 유저 목록 (데모 로그인) |
| GET | `/users/:userId/bookings` | 유저의 예매 내역 |
| POST | `/bookings` | 좌석 예매 `{ userId, seatId }` |
| PATCH | `/bookings/:id/cancel` | 예매 취소 `{ userId }` |
