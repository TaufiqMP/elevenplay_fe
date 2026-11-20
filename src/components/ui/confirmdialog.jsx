'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

//Dialog konfirmasi sendiri, pengganti window.confirm.
//Pemakaian: const confirm = useConfirm(); if (!(await confirm({ message: '...', danger: true }))) return;
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        const opts = typeof options === 'string' ? { message: options } : options;
        setDialog({
          title: 'Yakin ingin melanjutkan?',
          confirmText: 'Ya, lanjutkan',
          cancelText: 'Batal',
          danger: false,
          ...opts,
          resolve,
        });
      }),
    []
  );

  function close(result) {
    dialog?.resolve(result);
    setDialog(null);
  }

  //Esc untuk batal, Enter untuk konfirmasi
  useEffect(() => {
    if (!dialog) return;

    function handleKey(e) {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  //Tombol berbahaya diberi fokus awal di Batal, supaya tidak terhapus tidak sengaja
  useEffect(() => {
    if (!dialog) return;
    (dialog.danger ? cancelRef : confirmRef).current?.focus();
  }, [dialog]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                    dialog.danger ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}
                  aria-hidden="true"
                >
                  {dialog.danger ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0">
                  <h2 id="confirm-title" className="text-lg font-extrabold text-slate-900">
                    {dialog.title}
                  </h2>
                  <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {dialog.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => close(false)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                {dialog.cancelText}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={() => close(true)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  dialog.danger
                    ? 'bg-red-600 shadow-red-500/30 hover:bg-red-700 focus-visible:outline-red-600'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600 focus-visible:outline-orange-600'
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm harus dipakai di dalam ConfirmProvider');
  return confirm;
}
