'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerMember, isUsernameAvailable } from '@/api/member';
import { supabase } from '@/supabase';

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: '',
  });
  const checkUsernameTimer = useRef(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Modals for Ketentuan Layanan & Kebijakan Privasi
  const [termsModal, setTermsModal] = useState({ open: false, title: '', content: '' });

  // Jika sudah login, langsung arahkan ke beranda
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        router.replace('/');
      }
    });
  }, [router]);

  // Live checking untuk Username dengan debounce
  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(val);

    if (checkUsernameTimer.current) {
      clearTimeout(checkUsernameTimer.current);
    }

    if (!val) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }

    if (val.length < 3) {
      setUsernameStatus({ checking: false, available: false, message: 'Minimal 3 karakter' });
      return;
    }

    if (val.length > 20) {
      setUsernameStatus({ checking: false, available: false, message: 'Maksimal 20 karakter' });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: 'Memeriksa ketersediaan...' });

    checkUsernameTimer.current = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(val);
        setUsernameStatus({
          checking: false,
          available,
          message: available ? 'Username tersedia' : 'Username sudah dipakai',
        });
      } catch (err) {
        // Jika fungsi RPC database belum siap atau error koneksi, jangan blokir input form
        console.warn('Gagal memeriksa username via RPC:', err);
        setUsernameStatus({
          checking: false,
          available: null,
          message: '',
        });
      }
    }, 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi awal di UI sebelum panggil registerMember
    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setErrorMsg('Username komunitas minimal 3 karakter (hanya huruf, angka, dan _)');
      return;
    }
    if (usernameStatus.available === false) {
      setErrorMsg('Username sudah dipakai, pilih username lain');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Alamat email wajib diisi');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('Silakan setujui Ketentuan Layanan dan Kebijakan Privasi terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const result = await registerMember({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        password,
        confirmPassword,
        acceptedTerms,
      });

      setRegisteredEmail(email.trim());

      // Jika butuh konfirmasi email, arahkan ke alur verifikasi
      if (result.needsEmailConfirmation) {
        router.push(`/verifikasi?email=${encodeURIComponent(email.trim())}`);
      } else {
        setRegistrationSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Pendaftaran gagal. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  const openTerms = () => {
    setTermsModal({
      open: true,
      title: 'Ketentuan Layanan Komunitas',
      content:
        'Elevenplay.id adalah hub komunitas eFootball Indonesia. Seluruh member diwajibkan menjunjung tinggi sportivitas, kejujuran dalam berkomunikasi, dan tidak menyalahgunakan platform untuk aktivitas ilegal. Elevenplay tidak berafiliasi dengan KONAMI Digital Entertainment.',
    });
  };

  const openPrivacy = () => {
    setTermsModal({
      open: true,
      title: 'Kebijakan Privasi',
      content:
        'Data Anda (nama, username, email, WhatsApp) disimpan dengan aman untuk keperluan otorisasi akun komunitas dan verifikasi komunikasi. Kami tidak menjual data pribadi Anda kepada pihak ketiga mana pun.',
    });
  };

  return (
    <>
      <div className="w-full max-w-[680px] bg-white rounded-3xl shadow-2xl p-7 sm:p-10 transition-all border border-slate-100 my-4 sm:my-8">
        {/* Header Form */}
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Lengkapi data di bawah ini untuk bergabung dengan komunitas Elevenplay.id
          </p>
        </div>

        {/* Notifikasi Sukses Sesi Langsung Aktif */}
        {registrationSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h2>
              <p className="text-sm text-slate-600 mt-1">
                Akun Anda telah aktif dan siap digunakan untuk menjelajahi komunitas Elevenplay.id.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block py-3 px-6 bg-[#ff6a00] hover:bg-[#ea580c] text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              Mulai Jelajahi Katalog
            </Link>
          </div>
        ) : (
          <>
            {/* Notifikasi Error */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 font-semibold">{errorMsg}</div>
              </div>
            )}

            {/* Form Register */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Baris 1: Nama Lengkap & Username Komunitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-fullname" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    required
                    className="w-full bg-[#f0f2f8] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="reg-username" className="text-sm font-semibold text-slate-800">
                      Username Komunitas <span className="text-red-500">*</span>
                    </label>
                    {usernameStatus.message && (
                      <span
                        className={`text-xs font-medium ${
                          usernameStatus.available === true
                            ? 'text-emerald-600'
                            : usernameStatus.available === false
                            ? 'text-red-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {usernameStatus.message}
                      </span>
                    )}
                  </div>
                  <input
                    id="reg-username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="username_efootball"
                    required
                    className="w-full bg-[#f0f2f8] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Baris 2: Alamat Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full bg-[#f0f2f8] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                />
              </div>

              {/* Baris 3: Nomor WhatsApp (Opsional) */}
              <div>
                <label htmlFor="reg-wa" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Nomor WhatsApp <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  id="reg-wa"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full bg-[#f0f2f8] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                />
              </div>

              {/* Baris 4: Kata Sandi & Konfirmasi Kata Sandi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-pass" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center bg-[#f0f2f8] rounded-xl border border-transparent focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                    <input
                      id="reg-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      required
                      className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
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

                <div>
                  <label htmlFor="reg-confirm-pass" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center bg-[#f0f2f8] rounded-xl border border-transparent focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                    <input
                      id="reg-confirm-pass"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi"
                      required
                      className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                      aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showConfirmPassword ? (
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
              </div>

              {/* Baris 5: Checkbox Ketentuan Layanan & Kebijakan Privasi */}
              <div className="flex items-start pt-2">
                <input
                  id="reg-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer shrink-0"
                />
                <label htmlFor="reg-terms" className="ml-2.5 text-xs sm:text-sm text-slate-700 select-none cursor-pointer leading-relaxed">
                  Saya menyetujui{' '}
                  <button
                    type="button"
                    onClick={openTerms}
                    className="text-orange-500 hover:text-orange-600 font-semibold underline focus:outline-none"
                  >
                    Ketentuan Layanan
                  </button>{' '}
                  dan{' '}
                  <button
                    type="button"
                    onClick={openPrivacy}
                    className="text-orange-500 hover:text-orange-600 font-semibold underline focus:outline-none"
                  >
                    Kebijakan Privasi
                  </button>{' '}
                  Komunitas Elevenplay.id
                </label>
              </div>

              {/* Baris 6: Tombol Daftar Akun Komunitas */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#ff6a00] hover:bg-[#ea580c] active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-base"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <span>Daftar Akun Komunitas</span>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-slate-700">
              <span>Sudah memiliki akun? </span>
              <Link
                href="/login"
                className="font-bold text-orange-500 hover:text-orange-600 hover:underline transition-colors"
              >
                Masuk ke Akun Anda
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Modal Ketentuan Layanan / Kebijakan Privasi */}
      {termsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">{termsModal.title}</h3>
              <button
                type="button"
                onClick={() => setTermsModal({ open: false, title: '', content: '' })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed max-h-60 overflow-y-auto mb-6 pr-2">
              <p>{termsModal.content}</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setTermsModal({ open: false, title: '', content: '' });
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#ff6a00] hover:bg-[#ea580c] text-white shadow-sm"
              >
                Saya Mengerti & Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
