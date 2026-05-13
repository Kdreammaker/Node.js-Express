import type { ModalState } from '../types';

interface Props {
  modal: ModalState;
  onClose: () => void;
}

export default function Modal({ modal, onClose }: Props) {
  const isConfirm = !!modal.onConfirm;

  return (
    <div
      className="fixed inset-0 bg-black/72 backdrop-blur-[5px] z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-panel rounded-[18px] px-10 py-11 max-w-[380px] w-[90%] text-center"
        style={{ animation: 'modal-pop .25s cubic-bezier(.34,1.56,.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-[54px] mb-[18px]">{modal.icon}</div>
        <div className="text-[22px] font-extrabold mb-2.5">{modal.title}</div>
        <div className="text-sm text-subtle leading-[1.7] mb-[30px] whitespace-pre-line">{modal.message}</div>
        {isConfirm ? (
          <div className="flex gap-2.5 justify-center">
            <button
              className="px-7 py-3 bg-surface2 text-subtle border border-panel rounded-lg text-[15px] font-bold hover:opacity-85"
              onClick={onClose}
            >
              {modal.cancelText ?? '닫기'}
            </button>
            <button
              className="px-7 py-3 bg-gradient-to-br from-danger to-danger-light border-none rounded-lg text-white text-[15px] font-bold hover:opacity-85"
              onClick={() => { modal.onConfirm!(); onClose(); }}
            >
              {modal.confirmText ?? '확인'}
            </button>
          </div>
        ) : (
          <button
            className="px-11 py-3 bg-gradient-to-br from-brand to-brand-light border-none rounded-lg text-white text-[15px] font-bold hover:opacity-85"
            onClick={onClose}
          >
            확인
          </button>
        )}
      </div>
    </div>
  );
}
