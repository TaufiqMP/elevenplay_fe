'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, resendConfirmationEmail } from '@/api/member';
import { supabase } from '@/supabase';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [resendStatus, setResendStatus] = useState({ loading: false, success: false, message: '' });

  // Modal Lupa Kata Sandi
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });

  // Jika sudah login, langsung arahkan ke beranda
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        router.replace('/');
      }
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorCode('');
    setResendStatus({ loading: false, success: false, message: '' });

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Alamat email wajib diisi');
      return;
    }
    if (!password) {
      setErrorMsg('Kata sandi wajib diisi');
      return;
    }

    setLoading(true);

    try {
      await login(trimmedEmail, password);
      // Login sukses
      router.push('/');
      router.refresh();
    } catch (err) {
      setErrorCode(err.code || 'UNKNOWN');
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) return;
    setResendStatus({ loading: true, success: false, message: '' });
    try {
      await resendConfirmationEmail(email.trim());
      setResendStatus({
        loading: false,
        success: true,
        message: 'Tautan konfirmasi baru telah dikirim ke email Anda.',
      });
    } catch (err) {
      setResendStatus({
        loading: false,
        success: false,
        message: err.message || 'Gagal mengirim ulang email konfirmasi.',
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: 'error', text: 'Masukkan alamat email Anda' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/verifikasi?type=recovery`,
      });
      if (error) throw error;
      setForgotMsg({
        type: 'success',
        text: 'Tautan pemulihan kata sandi telah dikirim ke email Anda. Cek inbox/spam.',
      });
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: err.message || 'Gagal mengirim email pemulihan.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-2xl p-7 sm:p-10 transition-all border border-slate-100">
        {/* Header Form */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke Akun Anda
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Masukkan email dan kata sandi untuk mengakses platform Elevenplay.id
          </p>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>

                {/* Penanganan Khusus Email Belum Dikonfirmasi */}
                {errorCode === 'EMAIL_NOT_CONFIRMED' && (
                  <div className="mt-3 pt-2.5 border-t border-red-200">
                    {resendStatus.success ? (
                      <p className="text-xs text-emerald-700 font-medium">{resendStatus.message}</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resendStatus.loading}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 underline focus:outline-none disabled:opacity-50"
                      >
                        {resendStatus.loading ? 'Mengirim ulang...' : 'Kirim Ulang Email Konfirmasi'}
                      </button>
                    )}
                    {resendStatus.message && !resendStatus.success && (
                      <p className="text-xs text-red-600 mt-1">{resendStatus.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Alamat Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-800 mb-2">
              Alamat Email
            </label>
            <div className="flex items-center bg-[#f0f2f8] rounded-xl px-3.5 py-1 border border-transparent focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all">
              {/* Mail Icon */}
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full bg-transparent py-3 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-800">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-orange-600 transition-colors focus:outline-none"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <div className="flex items-center bg-[#f0f2f8] rounded-xl px-3.5 py-1 border border-transparent focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all">
              {/* Lock Icon */}
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent py-3 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {/* Toggle Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none shrink-0"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Ingat saya di perangkat ini */}
          <div className="flex items-center pt-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2.5 text-sm text-slate-700 select-none cursor-pointer">
              Ingat saya di perangkat ini
            </label>
          </div>

          {/* Tombol Masuk Sekarang */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#ff6a00] hover:bg-[#ea580c] active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer Card */}
        <div className="mt-8 text-center text-sm text-slate-700">
          <span>Belum memiliki akun? </span>
          <Link
            href="/register"
            className="font-bold underline text-slate-900 hover:text-orange-600 transition-colors"
          >
            Daftar Akun Baru di sini
          </Link>
        </div>
      </div>

      {/* Modal Lupa Kata Sandi */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Reset Kata Sandi</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotMsg({ type: '', text: '' });
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Masukkan alamat email Anda untuk menerima instruksi reset kata sandi.
            </p>

            {forgotMsg.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  forgotMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {forgotMsg.text}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Email Terdaftar
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full bg-[#f0f2f8] rounded-xl px-4 py-3 text-sm text-slate-800 border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#ff6a00] hover:bg-[#ea580c] text-white shadow-sm disabled:opacity-60"
                >
                  {forgotLoading ? 'Mengirim...' : 'Kirim Tautan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
