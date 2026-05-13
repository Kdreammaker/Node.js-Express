import { useState, useEffect, useCallback } from 'react';
import type { Booking, User } from '../types';
import { getUserBookings, cancelBooking } from '../api';
import Modal from './Modal';
import type { ModalState } from '../types';

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPrice(n: number) {
  return '₩' + n.toLocaleString('ko-KR');
}

function seatLabel(row: number, col: number) {
  return `${ROW_LABELS[row - 1] ?? row}열 ${col}번`;
}

interface Props {
  user: User;
  onBack: () => void;
}

export default function MyBookingsPage({ user, onBack }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus]     = useState<'loading' | 'error' | 'ok'>('loading');
  const [modal, setModal]       = useState<ModalState | null>(null);

  const load = useCallback(async () => {
    try {
      setStatus('loading');
      setBookings(await getUserBookings(user.user_id));
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }, [user.user_id]);

  useEffect(() => { load(); }, [load]);

  function requestCancel(booking: Booking) {
    setModal({
      icon: '🗑️',
      title: '예매를 취소하시겠습니까?',
      message: `${booking.performance?.title ?? ''}\n${booking.seat ? seatLabel(booking.seat.row_num, booking.seat.col_num) : ''} 예매가 취소됩니다.`,
      confirmText: '예매 취소',
      cancelText: '닫기',
      onConfirm: () => executeCancel(booking.booking_id),
    });
  }

  async function executeCancel(bookingId: number) {
    try {
      await cancelBooking(bookingId, user.user_id);
      setModal({ icon: '✅', title: '취소 완료', message: '예매가 취소되었습니다.' });
      await load();
    } catch {
      setModal({ icon: '❌', title: '취소 실패', message: '취소 중 오류가 발생했습니다.' });
    }
  }

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  return (
    <>
      <div className="max-w-[1120px] mx-auto px-6 py-11">
        <button
          className="flex items-center gap-2 bg-transparent border border-panel text-subtle px-[18px] py-2 rounded-lg text-sm mb-8 transition-colors hover:border-brand-light hover:text-foreground"
          onClick={onBack}
        >
          ← 공연 목록으로
        </button>

        <div className="text-xl font-bold mb-7 flex items-center gap-2.5">
          <span className="w-1 h-5 rounded-sm bg-gradient-to-b from-brand-light to-danger shrink-0 inline-block" />
          내 예매 내역
        </div>

        {status === 'loading' && (
          <div className="text-center py-20 text-subtle text-[15px]">
            <div className="w-[38px] h-[38px] border-[3px] border-panel border-t-brand-light rounded-full animate-spin mx-auto mb-[18px]" />
          </div>
        )}
        {status === 'error' && (
          <div className="text-center py-20 text-danger-light text-[15px]">불러오지 못했습니다.</div>
        )}
        {status === 'ok' && bookings.length === 0 && (
          <div className="text-center py-20 text-subtle text-[15px]">예매 내역이 없습니다.</div>
        )}

        {status === 'ok' && confirmed.length > 0 && (
          <div className="mb-8">
            <div className="text-sm font-bold text-subtle mb-3 tracking-wide uppercase">
              예매 확정 ({confirmed.length}건)
            </div>
            <div className="flex flex-col gap-3">
              {confirmed.map(b => (
                <div key={b.booking_id} className="flex justify-between items-center bg-surface border border-panel rounded-xl px-6 py-5 gap-4">
                  <div className="flex-1">
                    <div className="text-base font-bold mb-1">{b.performance?.title ?? '-'}</div>
                    <div className="text-sm text-brand-light font-semibold mb-1">
                      {b.seat ? seatLabel(b.seat.row_num, b.seat.col_num) : '-'}
                    </div>
                    <div className="text-sm text-subtle">{b.performance ? formatDate(b.performance.start_at) : '-'}</div>
                    <div className="text-xs text-panel mt-1">예매일: {formatDate(b.booked_at)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-extrabold text-brand-light">
                      {b.performance ? formatPrice(b.performance.price) : '-'}
                    </div>
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-green-500/15 text-green-400">
                      예매확정
                    </span>
                    <button
                      className="px-3.5 py-1.5 bg-transparent border border-danger rounded-md text-danger text-xs font-bold transition-colors hover:bg-danger hover:text-white"
                      onClick={() => requestCancel(b)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'ok' && cancelled.length > 0 && (
          <div>
            <div className="text-sm font-bold text-subtle mb-3 tracking-wide uppercase">
              취소된 예매 ({cancelled.length}건)
            </div>
            <div className="flex flex-col gap-3">
              {cancelled.map(b => (
                <div key={b.booking_id} className="flex justify-between items-center bg-surface border border-panel rounded-xl px-6 py-5 gap-4 opacity-55">
                  <div className="flex-1">
                    <div className="text-base font-bold mb-1">{b.performance?.title ?? '-'}</div>
                    <div className="text-sm text-brand-light font-semibold mb-1">
                      {b.seat ? seatLabel(b.seat.row_num, b.seat.col_num) : '-'}
                    </div>
                    <div className="text-sm text-subtle">{b.performance ? formatDate(b.performance.start_at) : '-'}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-danger/15 text-danger-light">
                      취소됨
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && <Modal modal={modal} onClose={() => setModal(null)} />}
    </>
  );
}
