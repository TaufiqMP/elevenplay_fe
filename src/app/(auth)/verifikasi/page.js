'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resendConfirmationEmail } from '@/api/member';
import { supabase } from '@/supabase';

function VerifikasiContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const typeParam = searchParams.get('type') || '';

  const [email, setEmail] = useState(emailParam);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState({ success: false, message: '' });
  const [countdown, setCountdown] = useState(0);

  // Periksa apakah user sudah memiliki sesi aktif (misalnya setelah mengklik link verifikasi di email)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setVerified(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          setVerified(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Timer cooldown pengiriman ulang email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setResendStatus({ success: false, message: 'Masukkan alamat email Anda terlebih dahulu.' });
      return;
    }

    setResending(true);
    setResendStatus({ success: false, message: '' });

    try {
      await resendConfirmationEmail(targetEmail);
      setResendStatus({
        success: true,
        message: 'Tautan konfirmasi baru telah dikirim! Cek inbox atau folder spam email Anda.',
      });
      setCountdown(60);
    } catch (err) {
      setResendStatus({
        success: false,
        message: err.message || 'Gagal mengirim ulang email konfirmasi.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] bg-white rounded-3xl shadow-2xl p-7 sm:p-10 transition-all border border-slate-100 text-center">
      {verified ? (
        // Tampilan Jika Sudah Terverifikasi
        <div className="space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verifikasi Berhasil!
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Selamat! Akun komunitas Anda telah aktif dan siap digunakan di platform Elevenplay.id.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-block w-full py-3.5 px-6 bg-[#ff6a00] hover:bg-[#ea580c] text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              Mulai Jelajahi Katalog
            </Link>
          </div>
        </div>
      ) : (
        // Tampilan Menunggu Konfirmasi Email
        <div className="space-y-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {typeParam === 'recovery' ? 'Reset Kata Sandi' : 'Konfirmasi Email Anda'}
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Kami telah mengirimkan tautan verifikasi ke{' '}
              {email ? (
                <strong className="text-slate-900 font-semibold">{email}</strong>
              ) : (
                'alamat email terdaftar'
              )}
              . Silakan buka inbox atau folder spam Anda dan klik tautan untuk melanjutkan.
            </p>
          </div>

          {/* Status Pesan Kirim Ulang */}
          {resendStatus.message && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium ${
                resendStatus.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {resendStatus.message}
            </div>
          )}

          {/* Form Kirim Ulang Email jika belum terisi */}
          {!email && (
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email Terdaftar
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#f0f2f8] rounded-xl px-4 py-3 text-sm text-slate-800 border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="w-full py-3.5 px-4 bg-[#ff6a00] hover:bg-[#ea580c] text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {resending ? (
                <span>Mengirim Ulang...</span>
              ) : countdown > 0 ? (
                <span>Kirim Ulang ({countdown}d)</span>
              ) : (
                <span>Kirim Ulang Email Konfirmasi</span>
              )}
            </button>

            <Link
              href="/login"
              className="inline-block text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors pt-2"
            >
              ← Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifikasiPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[500px] bg-white rounded-3xl p-10 text-center animate-pulse">
          <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto mb-2" />
          <div className="h-4 w-64 bg-slate-100 rounded mx-auto" />
        </div>
      }
    >
      <VerifikasiContent />
    </Suspense>
  );
}
