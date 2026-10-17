'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';

export default function AccountCard({ account }) {
  const [imageError, setImageError] = useState(false);

  const {
    code = 'ACC',
    title = 'Akun eFootball',
    subtitle = 'Spesifikasi squad eFootball',
    tier_label = 'Starter',
    main_image_url,
  } = account || {};

  // Nomor WhatsApp admin tujuan inquiry (standar komunikasi e-katalog Elevenplay)
  const WHATSAPP_NUMBER = '6281234567890';
  const waMessage = encodeURIComponent(
    `Halo Admin Elevenplay, saya tertarik dengan akun "${title}" (Kode: ${code}). Apakah masih tersedia?`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover:shadow-card-hover hover:border-orange-300 transition-all duration-300 flex flex-col">
      {/* Tautan Card Menuju Halaman Detail */}
      <Link
        href={`/katalog/${encodeURIComponent(code)}`}
        className="block relative aspect-[16/9] w-full bg-slate-900 overflow-hidden focus:outline-none"
      >
        {/* Gambar Utama / Fallback eFootball Field */}
        {!imageError && main_image_url ? (
          <img
            src={main_image_url}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
            <svg
              className="w-10 h-10 text-orange-400/80 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0H9.496m5.004 0a1.125 1.125 0 001.125-1.125V8.25m-7.254 6.375a1.125 1.125 0 01-1.125-1.125V8.25m7.254 0A2.25 2.25 0 0013.5 6h-3a2.25 2.25 0 00-2.25 2.25m7.254 0v-.625c0-.621-.504-1.125-1.125-1.125H9.871c-.621 0-1.125.504-1.125 1.125V8.25"
              />
            </svg>
            <span className="text-xs font-semibold text-slate-300">Preview Squad</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{code}</span>
          </div>
        )}

        {/* Badge Tier (Kiri Bawah Gambar sesuai referensi desain) */}
        <div className="absolute bottom-0 left-0 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-tr-lg shadow-md uppercase tracking-wide">
          {tier_label || 'Sultan'}
        </div>

        {/* Badge Kode Akun (Kanan Atas Gambar) */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 shadow-sm">
          {code}
        </div>
      </Link>

      {/* Konten Card */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <Link href={`/katalog/${encodeURIComponent(code)}`} className="block focus:outline-none">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 mt-1 min-h-[2.5rem]">
            {subtitle || 'Klik untuk melihat rincian spesifikasi lengkap akun.'}
          </p>
        </Link>

        {/* Baris Tombol Aksi Bawah */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <Link
            href={`/katalog/${encodeURIComponent(code)}`}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            <span>Detail Akun</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Tombol Hubungi WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
            title={`Hubungi Admin untuk akun ${code}`}
          >
            <span>Hubungi</span>
            {/* WhatsApp Icon SVG */}
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.234-.244-.587-.492-.507-.677-.517-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.802.376-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.913 1.23 3.114.15.201 2.124 3.243 5.144 4.549.719.311 1.28.497 1.718.636.722.229 1.378.197 1.897.119.579-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.076-.125-.276-.201-.577-.351z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.177L2 22l4.981-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.62 0-3.136-.46-4.428-1.258l-.317-.194-2.96.83.844-2.884-.213-.341A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
