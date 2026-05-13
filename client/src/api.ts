import type { Performance, User, Booking } from './types';

const BASE = '';

// ── 공연 ────────────────────────────────────────────────
export async function getPerformances(): Promise<Performance[]> {
  const res = await fetch(`${BASE}/performances`);
  if (!res.ok) throw new Error('공연 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function getPerformance(id: number): Promise<Performance> {
  const res = await fetch(`${BASE}/performances/${id}`);
  if (!res.ok) throw new Error('공연 정보를 불러오지 못했습니다.');
  return res.json();
}

// ── 유저 ────────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}/users`);
  if (!res.ok) throw new Error('유저 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const res = await fetch(`${BASE}/users/${userId}/bookings`);
  if (!res.ok) throw new Error('예약 목록을 불러오지 못했습니다.');
  return res.json();
}

// ── 관리 ────────────────────────────────────────────────
export async function createPerformance(body: { title: string; start_at: string; price: number }) {
  const res = await fetch(`${BASE}/performances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? '공연 추가에 실패했습니다.');
  return data as { pf_id: number; title: string };
}

export async function addSeats(pfId: number, body: { rows: number; cols: number }) {
  const res = await fetch(`${BASE}/performances/${pfId}/seats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? '좌석 추가에 실패했습니다.');
  return data as { added: number; pf_id: number };
}

// ── 예약 ────────────────────────────────────────────────
export async function postBooking(userId: string, seatId: number) {
  const res = await fetch(`${BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, seatId }),
  });
  return res.json() as Promise<{ success: boolean; message: string }>;
}

export async function cancelBooking(bookingId: number, userId: string) {
  const res = await fetch(`${BASE}/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json() as Promise<{ success: boolean; message: string }>;
}
