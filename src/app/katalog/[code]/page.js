import React from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getAccountByCode } from '@/api/accounts';
import DetailGallery from '@/components/detail/DetailGallery';
import DetailEdition from '@/components/detail/DetailEdition';

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  return new Intl.NumberFormat('id-ID').format(num);
}

function formatPlatform(platform) {
  if (!platform || typeof platform !== 'string') {
    return '—';
  }
  const lower = platform.trim().toLowerCase();
  if (lower === 'android') return 'Android';
  if (lower === 'ios') return 'iOS';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  try {
    const account = await getAccountByCode(code);
    if (!account) return { title: 'Detail Akun | Elevenplay' };
    return {
      title: `${account.title || 'Detail Akun'} (${account.code || code}) | Elevenplay`,
      description: account.subtitle || `Spesifikasi squad akun eFootball ${account.code || code} di Elevenplay.`,
    };
  } catch {
    return {
      title: `Detail Akun ${code} | Elevenplay`,
    };
  }
}

export default async function AccountDetailPage({ params }) {
  await connection();
  const { code } = await params;

  let account = null;
  try {
    account = await getAccountByCode(code);
  } catch (err) {
    // Bedakan 404 dari error server/koneksi lainnya
    const is404 =
      err?.status === 404 ||
      err?.code === 'NOT_FOUND' ||
      err?.message?.toLowerCase().includes('tidak ditemukan') ||
      err?.message?.includes('404');

    if (is404) {
      notFound();
    }

    // Jika error server/jaringan, jangan disamarkan sebagai 404; tampilkan kartu error server
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-red-200/80 p-8 sm:p-12 text-center shadow-card max-w-lg mx-auto">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Gagal Memuat Detail Akun
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {err?.message || 'Terjadi kesalahan saat memuat data akun dari backend.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Kembali ke Katalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    notFound();
  }

  // Konfigurasi WhatsApp Inquiry
  const WHATSAPP_NUMBER = '6281234567890';
  const waAccountTitle = account.title || 'Akun eFootball';
  const waAccountCode = account.code || code || 'ACC';
  const waMessage = encodeURIComponent(
    `Halo Admin Elevenplay, saya tertarik dengan akun "${waAccountTitle}" (Kode: ${waAccountCode}). Apakah masih tersedia?`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8">
      {/* 1. Navigasi Kembali & Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 shadow-sm transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
          title="Kembali ke E-Katalog"
          aria-label="Kembali ke E-Katalog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        <nav className="flex items-center text-sm font-medium text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-orange-600 transition-colors">
            E-Katalog
          </Link>
          <span className="mx-2 text-slate-400 font-bold">&gt;</span>
          <span className="text-orange-600 font-bold">Detail Akun</span>
        </nav>
      </div>

      {/* 2. Header Akun & Tombol Hubungi WhatsApp */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {account.title || 'Detail Akun eFootball'}
            </h1>
            {account.tier_label && (
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-md shadow-sm uppercase tracking-wide">
                {account.tier_label}
              </span>
            )}
          </div>
          {account.subtitle && (
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-3xl">
              {account.subtitle}
            </p>
          )}
        </div>

        {/* Tombol WhatsApp Hubungi Admin */}
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm sm:text-base font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 shrink-0 self-start sm:self-auto"
          title={`Hubungi Admin untuk akun ${account.code || code}`}
        >
          <span>Hubungi</span>
          {/* WhatsApp SVG Icon */}
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.234-.244-.587-.492-.507-.677-.517-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.802.376-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.913 1.23 3.114.15.201 2.124 3.243 5.144 4.549.719.311 1.28.497 1.718.636.722.229 1.378.197 1.897.119.579-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.076-.125-.276-.201-.577-.351z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.177L2 22l4.981-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.62 0-3.136-.46-4.428-1.258l-.317-.194-2.96.83.844-2.884-.213-.341A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z" />
          </svg>
        </a>
      </div>

      {/* 3. Grid Dua Kolom: Gambar Utama & Ringkasan Spesifikasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        {/* Kolom Kiri: Galeri Gambar Interaktif */}
        <div className="lg:col-span-7">
          <DetailGallery
            mainImageUrl={account.main_image_url}
            gallery={account.gallery}
            title={account.title}
            code={account.code}
            tierLabel={account.tier_label}
          />
        </div>

        {/* Kolom Kanan: Ringkasan Spesifikasi Akun */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 xl:p-8 shadow-card">
            {/* Bagian 1: Identitas Dasar */}
            <div className="space-y-2.5 text-sm">
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Kode</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-mono font-bold text-slate-900">{account.code || '—'}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Judul</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{account.title || '—'}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Platform</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatPlatform(account.platform)}</span>
              </div>
            </div>

            {/* Garis Pemisah Horizontal */}
            <hr className="my-4 border-slate-200" />

            {/* Bagian 2: Statistik Game */}
            <div className="space-y-2.5 text-sm">
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Team Strength</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatNumber(account.team_strength)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Epic</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatNumber(account.epic)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Big Time</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatNumber(account.big_time)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Showtime</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatNumber(account.showtime)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Koin</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatNumber(account.coins)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">GP</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatNumber(account.gp)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Divisi</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">
                  {account.division !== null && account.division !== undefined && account.division !== ''
                    ? String(account.division).toLowerCase().startsWith('divisi')
                      ? account.division
                      : `Divisi ${account.division}`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Bagian 3: Note (Hanya muncul jika tersedia) */}
            {account.note && account.note.trim() && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-1.5">
                  Note
                </span>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {account.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Section Detail Edisi & Info Akun */}
      <DetailEdition
        detail={account.detail}
        linkedTo={account.linked_to}
        loginMethod={account.login_method}
        lastCheckedAt={account.last_checked_at}
      />
    </div>
  );
}
