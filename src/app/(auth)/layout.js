import React from 'react';
import Link from 'next/link';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

//Latar halaman auth dibuat oranye polos seperti navbar. Tanpa navbar, hanya tombol kembali ke beranda
export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#FF7F00] px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 sm:left-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Kembali ke Beranda
      </Link>
      {children}
    </div>
  );
}
