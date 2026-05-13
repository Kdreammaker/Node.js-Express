import { useState, useEffect } from 'react';
import type { User } from '../types';
import { getUsers } from '../api';

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ok'>('loading');

  useEffect(() => {
    getUsers()
      .then((data) => { setUsers(data); setStatus('ok'); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #130426 0%, #0d0d1a 50%, #1a0020 100%)' }}
    >
      <div className="w-full max-w-[400px] px-9 py-12 bg-surface border border-panel rounded-[20px] text-center">
        <div className="text-[22px] font-extrabold tracking-tight bg-gradient-to-br from-brand-light to-danger bg-clip-text text-transparent mb-7">
          ✦ TICKETFLOW
        </div>
        <h2 className="text-[22px] font-bold mb-2">데모 로그인</h2>
        <p className="text-sm text-subtle mb-7">계속할 계정을 선택하세요</p>

        {status === 'loading' && (
          <div className="text-center py-20 text-subtle text-[15px]">
            <div className="w-[38px] h-[38px] border-[3px] border-panel border-t-brand-light rounded-full animate-spin mx-auto mb-[18px]" />
            불러오는 중...
          </div>
        )}
        {status === 'error' && (
          <div className="text-center py-20 text-danger-light text-[15px]">서버에 연결할 수 없습니다.</div>
        )}
        {status === 'ok' && (
          <div className="flex flex-col gap-2.5 text-left">
            {users.map((u) => (
              <button
                key={u.user_id}
                className="flex items-center gap-3.5 px-4 py-3.5 bg-surface2 border border-panel rounded-xl w-full text-left transition-colors hover:border-brand hover:bg-brand/12"
                onClick={() => onLogin(u)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-lg font-extrabold text-white shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold">{u.name}</div>
                  <div className="text-xs text-subtle mt-0.5">{u.email}</div>
                </div>
                <span className="text-xl text-subtle">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
