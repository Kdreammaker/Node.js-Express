import type { User } from '../types';

interface Props {
  user: User | null;
  onMyBookings?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
}

export default function Header({ user, onMyBookings, onAdmin, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-50 h-[60px] px-10 flex items-center justify-between bg-canvas/88 backdrop-blur-[14px] border-b border-panel">
      <div className="text-xl font-extrabold tracking-tight bg-gradient-to-br from-brand-light to-danger bg-clip-text text-transparent">
        ✦ TICKETFLOW
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-subtle">{user.name}님</span>
          <button
            className="px-3.5 py-1.5 border border-panel rounded-md bg-transparent text-foreground text-sm font-semibold transition-colors hover:border-brand-light hover:text-brand-light"
            onClick={onMyBookings}
          >
            내 예매
          </button>
          <button
            className="px-3.5 py-1.5 border border-brand/50 rounded-md bg-transparent text-brand-light text-sm font-semibold transition-colors hover:border-brand-light hover:bg-brand/15"
            onClick={onAdmin}
          >
            관리자
          </button>
          <button
            className="px-3.5 py-1.5 border border-panel rounded-md bg-transparent text-subtle text-sm font-semibold transition-colors hover:border-brand-light hover:text-foreground"
            onClick={onLogout}
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
}
