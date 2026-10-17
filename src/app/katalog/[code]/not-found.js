import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12 sm:py-16">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-card max-w-lg mx-auto">
        {/* Ikon Pencarian Akun Kosong */}
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Akun Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Akun yang Anda cari tidak ditemukan atau belum dipublikasikan di katalog Elevenplay.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    </div>
  );
}
