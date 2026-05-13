import { useState, useEffect, useCallback } from 'react';
import type { Performance } from '../types';
import { getPerformances, createPerformance, addSeats } from '../api';

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function formatPrice(n: number) {
  return '₩' + n.toLocaleString('ko-KR');
}

interface Props { onBack: () => void; }

export default function AdminPage({ onBack }: Props) {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [seatTarget, setSeatTarget] = useState<Performance | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPerformances(await getPerformances()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-11">
      <button
        className="flex items-center gap-2 bg-transparent border border-panel text-subtle px-[18px] py-2 rounded-lg text-sm mb-8 transition-colors hover:border-brand-light hover:text-foreground"
        onClick={onBack}
      >
        ← 공연 목록으로
      </button>

      <div className="text-xl font-bold mb-7 flex items-center gap-2.5">
        <span className="w-1 h-5 rounded-sm bg-gradient-to-b from-brand-light to-danger shrink-0 inline-block" />
        관리자 패널
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-7 items-start">
        {/* ── 좌측: 공연 추가 폼 ── */}
        <AddPerformanceForm onAdded={load} />

        {/* ── 우측: 공연 목록 ── */}
        <div>
          <div className="text-xs font-bold text-subtle tracking-wider uppercase mb-[18px]">공연 관리</div>
          {loading && (
            <div className="text-center py-20 text-subtle">
              <div className="w-[38px] h-[38px] border-[3px] border-panel border-t-brand-light rounded-full animate-spin mx-auto mb-[18px]" />
            </div>
          )}
          {!loading && performances.length === 0 && (
            <div className="text-center py-20 text-subtle text-[15px]">공연이 없습니다. 왼쪽에서 추가해보세요.</div>
          )}
          {!loading && performances.map(p => (
            <PerfAdminCard key={p.pf_id} perf={p} onAddSeats={() => setSeatTarget(p)} />
          ))}
        </div>
      </div>

      {seatTarget && (
        <AddSeatsModal
          perf={seatTarget}
          onClose={() => setSeatTarget(null)}
          onAdded={() => { setSeatTarget(null); load(); }}
        />
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   공연 추가 폼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AddPerformanceForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle]       = useState('');
  const [startAt, setStartAt]   = useState('');
  const [price, setPrice]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startAt || !price) return;
    setStatus('loading');
    try {
      const result = await createPerformance({
        title: title.trim(),
        start_at: new Date(startAt).toISOString(),
        price: Number(price),
      });
      setStatus('ok');
      setMessage(`"${result.title}" 공연이 추가되었습니다.`);
      setTitle(''); setStartAt(''); setPrice('');
      onAdded();
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 bg-surface2 border border-panel rounded-lg text-foreground text-sm outline-none transition-colors focus:border-brand-light placeholder:text-subtle/60";
  const labelCls = "text-xs font-bold text-subtle tracking-wide mt-2.5 first:mt-0";

  return (
    <div className="bg-surface border border-panel rounded-xl p-7 sticky top-20">
      <div className="text-xs font-bold text-subtle tracking-wider uppercase mb-[18px]">공연 추가</div>
      <form className="flex flex-col gap-1.5" onSubmit={handleSubmit}>
        <label className={labelCls}>공연명</label>
        <input
          className={inputCls}
          placeholder="예) 2026 BTS 월드투어"
          value={title}
          onChange={e => { setTitle(e.target.value); setStatus('idle'); }}
          required
        />

        <label className={labelCls}>공연 일시</label>
        <input
          className={inputCls}
          type="datetime-local"
          value={startAt}
          onChange={e => { setStartAt(e.target.value); setStatus('idle'); }}
          required
        />

        <label className={labelCls}>가격 (원)</label>
        <input
          className={inputCls}
          type="number"
          placeholder="예) 150000"
          min={0}
          value={price}
          onChange={e => { setPrice(e.target.value); setStatus('idle'); }}
          required
        />

        {price && (
          <div className="text-[22px] font-extrabold text-brand-light text-right py-1">
            {formatPrice(Number(price))}
          </div>
        )}

        {status === 'ok' && (
          <div className="text-sm px-3.5 py-2.5 rounded-lg mt-1.5 bg-green-500/12 text-green-400">{message}</div>
        )}
        {status === 'error' && (
          <div className="text-sm px-3.5 py-2.5 rounded-lg mt-1.5 bg-danger/12 text-danger-light">{message}</div>
        )}

        <button
          className="w-full py-3.5 mt-2 bg-gradient-to-br from-danger to-danger-light border-none rounded-[10px] text-white text-base font-extrabold tracking-tight transition-all enabled:hover:opacity-90 disabled:from-surface2 disabled:to-surface2 disabled:text-subtle disabled:cursor-not-allowed"
          type="submit"
          disabled={status === 'loading' || !title || !startAt || !price}
        >
          {status === 'loading' ? '추가 중...' : '공연 추가하기'}
        </button>
      </form>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   공연 카드 (관리용)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function PerfAdminCard({ perf, onAddSeats }: { perf: Performance; onAddSeats: () => void }) {
  const pct = perf.total_count > 0
    ? Math.round((1 - perf.available_count / perf.total_count) * 100)
    : 0;

  return (
    <div className="flex items-center gap-4 bg-surface border border-panel rounded-xl px-5 py-[18px] mb-3 transition-colors hover:border-brand">
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold mb-1 truncate">{perf.title}</div>
        <div className="text-xs text-subtle mb-2.5">
          {formatDate(perf.start_at)} · {formatPrice(perf.price)}
        </div>
        {perf.total_count > 0 ? (
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] text-subtle whitespace-nowrap shrink-0">
              예매 {perf.total_count - perf.available_count}/{perf.total_count}석 ({pct}%)
            </span>
          </div>
        ) : (
          <div className="text-xs text-subtle italic">좌석 없음</div>
        )}
      </div>
      <button
        className="shrink-0 px-4 py-2 bg-transparent border border-brand rounded-lg text-brand-light text-sm font-bold transition-colors hover:bg-brand hover:text-white"
        onClick={onAddSeats}
      >
        + 좌석 추가
      </button>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   좌석 추가 모달
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AddSeatsModal({ perf, onClose, onAdded }: {
  perf: Performance;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [rows, setRows]         = useState(3);
  const [cols, setCols]         = useState(5);
  const [status, setStatus]     = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const total = rows * cols;

  async function handleAdd() {
    setStatus('loading');
    try {
      await addSeats(perf.pf_id, { rows, cols });
      onAdded();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  const numInputCls = "w-full px-2 py-2.5 bg-surface2 border border-panel rounded-lg text-foreground text-xl font-bold text-center outline-none transition-colors focus:border-brand-light";

  return (
    <div className="fixed inset-0 bg-black/72 backdrop-blur-[5px] z-[200] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface border border-panel rounded-[18px] px-10 py-11 max-w-[500px] w-[90%]"
        style={{ animation: 'modal-pop .25s cubic-bezier(.34,1.56,.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-[22px] font-extrabold mb-1">좌석 추가</div>
        <div className="text-sm text-subtle mb-6">{perf.title}</div>

        {/* 행/열 입력 */}
        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-subtle tracking-wide">행 수 (열 이름)</label>
            <input
              className={numInputCls}
              type="number" min={1} max={26}
              value={rows}
              onChange={e => setRows(Math.min(26, Math.max(1, Number(e.target.value))))}
            />
            <span className="text-xs text-brand-light font-semibold text-center">A ~ {ROW_LABELS[rows - 1]}열</span>
          </div>
          <div className="text-[22px] font-bold text-subtle pb-7">×</div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-subtle tracking-wide">열 수 (번호)</label>
            <input
              className={numInputCls}
              type="number" min={1} max={30}
              value={cols}
              onChange={e => setCols(Math.min(30, Math.max(1, Number(e.target.value))))}
            />
            <span className="text-xs text-brand-light font-semibold text-center">1 ~ {cols}번</span>
          </div>
        </div>

        {/* 좌석 그리드 프리뷰 */}
        <div className="bg-surface2 border border-panel rounded-xl p-5 mb-5">
          <div className="bg-gradient-to-r from-brand to-brand-light text-center py-[7px] rounded-md text-[11px] font-bold tracking-[3px] mb-[18px]">
            S T A G E
          </div>
          <div className="flex flex-col gap-1.5 mb-3.5">
            {Array.from({ length: Math.min(rows, 6) }, (_, ri) => (
              <div key={ri} className="flex items-center gap-1.5">
                <span className="w-[18px] text-[10px] font-bold text-subtle text-center shrink-0">{ROW_LABELS[ri]}</span>
                {Array.from({ length: Math.min(cols, 10) }, (_, ci) => (
                  <div key={ci} className="w-[22px] h-[22px] bg-brand/70 rounded-t-md rounded-b-sm" />
                ))}
                {cols > 10 && <span className="text-[10px] text-subtle ml-1 whitespace-nowrap">+{cols - 10}</span>}
              </div>
            ))}
            {rows > 6 && (
              <div className="text-[11px] text-subtle text-center py-1">··· +{rows - 6}행 더</div>
            )}
          </div>
          <div className="text-right text-sm font-bold text-brand-light">총 {total}석 추가 예정</div>
        </div>

        {status === 'error' && (
          <div className="text-sm px-3.5 py-2.5 rounded-lg mb-4 bg-danger/12 text-danger-light">{errorMsg}</div>
        )}

        <div className="flex gap-2.5 justify-center">
          <button
            className="px-7 py-3 bg-surface2 text-subtle border border-panel rounded-lg text-[15px] font-bold hover:opacity-85"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-7 py-3 bg-gradient-to-br from-brand to-brand-light border-none rounded-lg text-white text-[15px] font-bold hover:opacity-85 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleAdd}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '추가 중...' : `${total}석 추가`}
          </button>
        </div>
      </div>
    </div>
  );
}
