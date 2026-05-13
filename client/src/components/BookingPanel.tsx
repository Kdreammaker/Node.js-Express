import type { Performance, SelectedSeat } from '../types';

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

export function makeSeatLabel(row: number, col: number) {
  return `${ROW_LABELS[row - 1] ?? row}열 ${col}번`;
}

interface Props {
  perf: Performance;
  selectedSeats: SelectedSeat[];
  onRemove: (seatId: number) => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function BookingPanel({ perf, selectedSeats, onRemove, onConfirm, loading }: Props) {
  const total = selectedSeats.length * perf.price;

  return (
    <div className="bg-surface border border-panel rounded-xl p-6 sticky top-20">
      <div className="text-base font-bold pb-[18px] border-b border-panel mb-5">예매 정보</div>
      <div className="text-[15px] font-bold mb-1">{perf.title}</div>
      <div className="text-sm text-subtle mb-5">{formatDate(perf.start_at)}</div>

      <div className="text-sm text-subtle mb-2">선택한 좌석</div>
      <div className="min-h-16 bg-surface2 rounded-lg px-3 py-2.5 mb-[18px] text-sm">
        {selectedSeats.length === 0 ? (
          <div className="text-subtle text-center py-3">좌석을 선택해 주세요</div>
        ) : (
          selectedSeats.map(s => (
            <div key={s.id} className="flex items-center justify-between py-[7px] border-b border-panel last:border-b-0">
              <span>💺 {s.label}</span>
              <span className="text-subtle text-xs ml-auto mr-2">{formatPrice(perf.price)}</span>
              <button
                className="bg-transparent border-none text-danger text-lg leading-none px-0.5 hover:opacity-70"
                onClick={() => onRemove(s.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center p-3.5 bg-surface2 rounded-lg mb-[18px]">
        <span className="text-sm text-subtle">총 결제금액</span>
        <span className="text-2xl font-extrabold text-brand-light">{formatPrice(total)}</span>
      </div>

      <button
        className="w-full py-3.5 bg-gradient-to-br from-danger to-danger-light border-none rounded-[10px] text-white text-base font-extrabold tracking-tight transition-all enabled:hover:opacity-90 enabled:active:scale-[.98] disabled:from-surface2 disabled:to-surface2 disabled:text-subtle disabled:cursor-not-allowed"
        disabled={selectedSeats.length === 0 || loading}
        onClick={onConfirm}
      >
        {loading ? '처리 중...' : '예매하기'}
      </button>
    </div>
  );
}
