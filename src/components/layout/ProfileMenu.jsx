'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

//Profil di navbar (desktop): avatar inisial + nama, dibuka jadi menu
export default function ProfileMenu({ displayName, email, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  //Tutup menu saat klik di luar atau tekan Esc
  useEffect(() => {
    if (!open) return;

    function handlePointer(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const initial = (displayName || '?').charAt(0).toUpperCase();
  const itemClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50 hover:text-orange-600';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 py-1 pl-1 pr-3 transition-all hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-base font-extrabold text-orange-600 shadow-sm">
          {initial}
        </span>
        <span className="max-w-[140px] truncate text-sm font-bold text-white">{displayName}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 text-white/90 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-orange-500 text-lg font-extrabold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{email}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>

          <div className="p-2">
            <Link href="/profil" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              Pengaturan Profil
            </Link>
            <Link href="/forum/saya" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              Thread Saya
            </Link>
            {isAdmin && (
              <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                Pusat Kendali Admin
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
