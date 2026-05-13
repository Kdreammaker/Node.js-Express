import type { Performance } from '../types';

const GRADIENTS = [
  'linear-gradient(135deg, #1a0533, #7c3aed)',
  'linear-gradient(135deg, #0f172a, #0ea5e9)',
  'linear-gradient(135deg, #1c0522, #ec4899)',
  'linear-gradient(135deg, #0c1a0c, #16a34a)',
  'linear-gradient(135deg, #1a0a00, #ea580c)',
  'linear-gradient(135deg, #0a0a1a, #6366f1)',
];
const GENRES = ['뮤지컬', '콘서트', '연극', '오페라', '발레', '클래식'];
const EMOJIS = ['🎭', '🎵', '🎬', '🎼', '🩰', '🎻'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPrice(n: number) {
  return '₩' + n.toLocaleString('ko-KR');
}

interface Props {
  perf: Performance;
  index: number;
  onClick: (perf: Performance) => void;
}

export default function PerformanceCard({ perf, index, onClick }: Props) {
  const availCount = perf.available_count ?? perf.seats?.filter(s => s.is_available).length ?? 0;
  const totalCount = perf.total_count ?? perf.seats?.length ?? 0;
  const isFull     = availCount === 0;

  return (
    <div
      className={`bg-surface border border-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-brand ${isFull ? 'opacity-80' : ''}`}
      onClick={() => onClick(perf)}
    >
      {/* 포스터 */}
      <div
        className="h-[188px] relative flex items-end p-4"
        style={{ background: GRADIENTS[index % GRADIENTS.length] }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 60%)' }} />
        <span className="absolute top-3.5 left-3.5 z-10 bg-brand/85 text-[11px] font-bold px-2.5 py-[3px] rounded">
          {GENRES[index % GENRES.length]}
        </span>
        <span className="relative z-10 text-[44px]">{EMOJIS[index % EMOJIS.length]}</span>
      </div>

      {/* 정보 */}
      <div className="p-[18px]">
        <div className="text-base font-bold leading-snug mb-2.5">{perf.title}</div>

        <div className="flex flex-col gap-1.5 text-sm text-subtle mb-3.5">
          <div className="flex items-center gap-1.5">📅 {formatDate(perf.start_at)}</div>
          <div className="flex items-center gap-1.5">
            💺 잔여석 {availCount}/{totalCount}석
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${isFull ? 'bg-danger/15 text-danger-light' : 'bg-green-500/15 text-green-400'}`}>
              {isFull ? '매진' : '예매가능'}
            </span>
          </div>
        </div>

        <div className="text-xl font-extrabold text-brand-light mb-3.5">{formatPrice(perf.price)}</div>

        <button className="w-full py-2.5 bg-gradient-to-br from-brand to-brand-light border-none rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-85">
          좌석 선택
        </button>
      </div>
    </div>
  );
}
