import type { Seat } from '../types';

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface Props {
  seats: Seat[];
  selectedIds: Set<number>;
  onToggle: (seatId: number, row: number, col: number) => void;
  onCancel: (seatId: number, row: number, col: number) => void;
}

export default function SeatMap({ seats, selectedIds, onToggle, onCancel }: Props) {
  if (!seats.length) {
    return <p className="text-subtle">좌석 정보가 없습니다.</p>;
  }

  const maxRow = Math.max(...seats.map(s => s.row_num));
  const maxCol = Math.max(...seats.map(s => s.col_num));

  const seatMap: Record<number, Record<number, Seat>> = {};
  seats.forEach(s => {
    (seatMap[s.row_num] ??= {})[s.col_num] = s;
  });

  return (
    <div className="bg-surface border border-panel rounded-xl p-7">
      {/* 무대 */}
      <div className="bg-gradient-to-r from-brand to-brand-light text-center py-2.5 rounded-md text-[13px] font-bold tracking-[3px] mb-9">
        S T A G E
      </div>

      {/* 좌석 그리드 */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-2">
          {Array.from({ length: maxRow }, (_, ri) => {
            const r = ri + 1;
            return (
              <div key={r} className="flex items-center gap-2">
                <div className="w-[22px] text-[11px] text-subtle font-bold text-center shrink-0">
                  {ROW_LABELS[ri] ?? r}
                </div>
                {Array.from({ length: maxCol }, (_, ci) => {
                  const c = ci + 1;
                  const seat = seatMap[r]?.[c];
                  if (!seat) return <div key={c} className="w-[34px] h-[34px]" />;

                  const isSelected = selectedIds.has(seat.seat_id);
                  const seatCls = isSelected
                    ? 'bg-brand-light hover:bg-brand-light/80'
                    : seat.is_available
                      ? 'bg-green-500 hover:bg-green-500/50'
                      : 'bg-danger/35 text-red-300 hover:bg-danger hover:text-white';

                  return (
                    <button
                      key={c}
                      className={`w-[34px] h-[34px] border-none rounded-t-md rounded-b-sm text-[10px] font-semibold text-white transition-all duration-150 shadow-[0_4px_0_0_rgba(0,0,0,0.3)] ${seatCls} ${!seat.is_available && !isSelected ? 'cursor-pointer' : ''}`}
                      title={seat.is_available ? `${ROW_LABELS[ri]}열 ${c}번` : `${ROW_LABELS[ri]}열 ${c}번 (클릭하여 취소)`}
                      onClick={() => {
                        if (seat.is_available) onToggle(seat.seat_id, r, c);
                        else onCancel(seat.seat_id, r, c);
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex gap-[22px] mt-7 justify-center text-xs text-subtle flex-wrap">
        <div className="flex items-center gap-[7px]">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-green-500" />
          예매 가능
        </div>
        <div className="flex items-center gap-[7px]">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-brand-light" />
          선택됨
        </div>
        <div className="flex items-center gap-[7px]">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-danger" />
          예매됨 (클릭 시 취소)
        </div>
      </div>
    </div>
  );
}
