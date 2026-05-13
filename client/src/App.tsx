import { useState, useEffect, useCallback } from 'react';
import type { User, Performance, SelectedSeat, ModalState } from './types';
import { getPerformances, postBooking } from './api';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import PerformanceCard from './components/PerformanceCard';
import SeatMap from './components/SeatMap';
import BookingPanel, { makeSeatLabel } from './components/BookingPanel';
import MyBookingsPage from './components/MyBookingsPage';
import AdminPage from './components/AdminPage';
import Modal from './components/Modal';

type Page = 'login' | 'list' | 'seat' | 'my-bookings' | 'admin';

export default function App() {
  const [page, setPage]           = useState<Page>('login');
  const [user, setUser]           = useState<User | null>(null);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [status, setStatus]       = useState<'loading' | 'error' | 'ok'>('loading');
  const [currentPerf, setCurrentPerf] = useState<Performance | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set());
  const [modal, setModal]         = useState<ModalState | null>(null);
  const [booking, setBooking]     = useState(false);

  const loadPerformances = useCallback(async () => {
    try {
      setStatus('loading');
      setPerformances(await getPerformances());
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (page === 'list') loadPerformances();
  }, [page, loadPerformances]);

  /* ── 로그인 / 로그아웃 ─────────────────────────── */
  function handleLogin(u: User) {
    setUser(u);
    setPage('list');
  }

  function handleLogout() {
    setUser(null);
    setPage('login');
    setCurrentPerf(null);
  }

  /* ── 공연 선택 ──────────────────────────────────── */
  function openSeatPage(perf: Performance) {
    setCurrentPerf(perf);
    setSelectedSeats([]);
    setSelectedIds(new Set());
    setPage('seat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setPage('list');
    setCurrentPerf(null);
    loadPerformances();
  }

  /* ── 좌석 토글 ──────────────────────────────────── */
  function toggleSeat(seatId: number, row: number, col: number) {
    const label = makeSeatLabel(row, col);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
        setSelectedSeats(s => s.filter(x => x.id !== seatId));
      } else {
        next.add(seatId);
        setSelectedSeats(s => [...s, { id: seatId, label }]);
      }
      return next;
    });
  }

  function removeSeat(seatId: number) {
    setSelectedIds(prev => { const n = new Set(prev); n.delete(seatId); return n; });
    setSelectedSeats(s => s.filter(x => x.id !== seatId));
  }

  /* ── 예매 처리 ──────────────────────────────────── */
  async function confirmBooking() {
    if (!selectedSeats.length || !user) return;
    setBooking(true);

    const results = await Promise.allSettled(
      selectedSeats.map(s => postBooking(user.user_id, s.id))
    );

    const ok   = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.success).length;
    const fail = results.length - ok;

    if (fail === 0) {
      setModal({ icon: '🎉', title: '예매 완료!', message: `${ok}석이 성공적으로 예매되었습니다.\n즐거운 공연 관람 되세요!` });
    } else if (ok === 0) {
      setModal({ icon: '😓', title: '예매 실패', message: '선택한 좌석이 이미 예약되었거나\n오류가 발생했습니다.' });
    } else {
      setModal({ icon: '⚠️', title: '일부 예매 완료', message: `${ok}석 성공 / ${fail}석 실패\n일부 좌석이 이미 예약되었습니다.` });
    }

    setSelectedSeats([]);
    setSelectedIds(new Set());
    setBooking(false);

    const fresh = await getPerformances();
    setPerformances(fresh);
    setCurrentPerf(fresh.find(p => p.pf_id === currentPerf?.pf_id) ?? null);
  }

  /* ── 렌더 ───────────────────────────────────────── */
  if (page === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <Header
        user={user}
        onMyBookings={() => setPage('my-bookings')}
        onAdmin={() => setPage('admin')}
        onLogout={handleLogout}
      />

      {/* ── 공연 목록 ─────────────────────────────── */}
      {page === 'list' && (
        <>
          {/* Hero */}
          <div
            className="relative pt-[72px] pb-14 px-10 text-center overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #130426 0%, #0d0d1a 50%, #1a0020 100%)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 25% 50%, rgba(124,58,237,.25) 0%, transparent 55%), radial-gradient(ellipse at 75% 50%, rgba(244,63,94,.18) 0%, transparent 55%)' }}
            />
            <h1 className="relative text-[38px] font-extrabold leading-[1.3] tracking-tight">
              지금 이 순간,<br />최고의 공연을 만나세요
            </h1>
            <p className="relative mt-3 text-[15px] text-subtle">실시간 좌석 예매 · 간편 결제 · 즉시 발권</p>
          </div>

          <div className="max-w-[1120px] mx-auto px-6 py-11">
            <div className="text-xl font-bold mb-7 flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-sm bg-gradient-to-b from-brand-light to-danger shrink-0 inline-block" />
              현재 예매 가능한 공연
            </div>

            {status === 'loading' && (
              <div className="text-center py-20 text-subtle text-[15px]">
                <div className="w-[38px] h-[38px] border-[3px] border-panel border-t-brand-light rounded-full animate-spin mx-auto mb-[18px]" />
                공연 정보를 불러오는 중...
              </div>
            )}
            {status === 'error' && (
              <div className="text-center py-20 text-danger-light text-[15px]">
                서버에 연결할 수 없습니다.<br />백엔드 서버가 실행 중인지 확인해 주세요.
              </div>
            )}
            {status === 'ok' && performances.length === 0 && (
              <div className="text-center py-20 text-subtle text-[15px]">등록된 공연이 없습니다.</div>
            )}
            {status === 'ok' && performances.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] gap-[22px]">
                {performances.map((p, i) => (
                  <PerformanceCard key={p.pf_id} perf={p} index={i} onClick={openSeatPage} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── 좌석 선택 ─────────────────────────────── */}
      {page === 'seat' && currentPerf && (
        <div className="max-w-[1120px] mx-auto px-6 py-11">
          <button
            className="flex items-center gap-2 bg-transparent border border-panel text-subtle px-[18px] py-2 rounded-lg text-sm mb-8 transition-colors hover:border-brand-light hover:text-foreground"
            onClick={goBack}
          >
            ← 공연 목록으로
          </button>
          <div className="text-xl font-bold mb-7 flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-sm bg-gradient-to-b from-brand-light to-danger shrink-0 inline-block" />
            {currentPerf.title} — 좌석 선택
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-7 items-start">
            <SeatMap
              seats={currentPerf.seats ?? []}
              selectedIds={selectedIds}
              onToggle={toggleSeat}
              onCancel={() => {}}
            />
            <BookingPanel
              perf={currentPerf}
              selectedSeats={selectedSeats}
              onRemove={removeSeat}
              onConfirm={confirmBooking}
              loading={booking}
            />
          </div>
        </div>
      )}

      {/* ── 내 예매 내역 ──────────────────────────── */}
      {page === 'my-bookings' && user && (
        <MyBookingsPage user={user} onBack={() => setPage('list')} />
      )}

      {/* ── 관리자 패널 ───────────────────────────── */}
      {page === 'admin' && (
        <AdminPage onBack={() => setPage('list')} />
      )}

      {modal && <Modal modal={modal} onClose={() => setModal(null)} />}
    </>
  );
}
