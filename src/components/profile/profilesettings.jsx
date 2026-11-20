'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { changeEmail, changePassword, getMyProfile, updateMyProfile } from '@/api/profile';
import { useMember } from '@/components/forum/usemember';

const controlClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100';

function Card({ title, description, children }) {
  return (
    <section className="rounded-lg border border-slate-300 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

//Pesan hasil simpan. Hijau untuk sukses, merah untuk gagal
function Notice({ kind, children }) {
  if (!children) return null;
  const style =
    kind === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800';
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-md border p-3 text-sm ${style}`}>
      {children}
    </div>
  );
}

export default function ProfileSettings() {
  const router = useRouter();
  const { ready, user } = useMember();

  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [info, setInfo] = useState({ fullName: '', username: '', whatsapp: '' });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoNotice, setInfoNotice] = useState({ kind: 'ok', text: '' });

  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState({ kind: 'ok', text: '' });

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState({ kind: 'ok', text: '' });

  //Halaman ini hanya untuk member yang sudah login
  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    getMyProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setInfo({
          fullName: data.full_name ?? '',
          username: data.username ?? '',
          whatsapp: data.whatsapp ?? '',
        });
      })
      .catch((err) => {
        if (active) setLoadError(err.message || 'Gagal memuat profil.');
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function saveInfo(e) {
    e.preventDefault();
    if (savingInfo) return;

    //Hanya kirim field yang benar-benar berubah
    const changes = {};
    if (info.fullName.trim() !== (profile.full_name ?? '')) changes.fullName = info.fullName;
    if (info.username.trim() !== (profile.username ?? '')) changes.username = info.username;
    if (info.whatsapp.replace(/[\s-]/g, '') !== (profile.whatsapp ?? '')) changes.whatsapp = info.whatsapp;

    if (Object.keys(changes).length === 0) {
      setInfoNotice({ kind: 'error', text: 'Belum ada data yang diubah.' });
      return;
    }

    setSavingInfo(true);
    setInfoNotice({ kind: 'ok', text: '' });
    try {
      const saved = await updateMyProfile(changes);
      setProfile(saved);
      setInfo({ fullName: saved.full_name ?? '', username: saved.username ?? '', whatsapp: saved.whatsapp ?? '' });
      setInfoNotice({ kind: 'ok', text: 'Data profil tersimpan.' });
    } catch (err) {
      setInfoNotice({ kind: 'error', text: err.message || 'Gagal menyimpan profil.' });
    } finally {
      setSavingInfo(false);
    }
  }

  async function saveEmail(e) {
    e.preventDefault();
    if (savingEmail) return;

    setSavingEmail(true);
    setEmailNotice({ kind: 'ok', text: '' });
    try {
      await changeEmail(newEmail);
      setNewEmail('');
      setEmailNotice({
        kind: 'ok',
        text: 'Link konfirmasi sudah dikirim ke email baru. Email akan berganti setelah link itu dibuka.',
      });
    } catch (err) {
      setEmailNotice({ kind: 'error', text: err.message || 'Gagal mengganti email.' });
    } finally {
      setSavingEmail(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (savingPassword) return;

    setSavingPassword(true);
    setPasswordNotice({ kind: 'ok', text: '' });
    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
        confirmPassword: passwords.confirm,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordNotice({ kind: 'ok', text: 'Kata sandi berhasil diganti.' });
    } catch (err) {
      setPasswordNotice({ kind: 'error', text: err.message || 'Gagal mengganti kata sandi.' });
    } finally {
      setSavingPassword(false);
    }
  }

  if (!ready || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-slate-600" aria-busy="true">Memeriksa login...</div>;
  }

  if (loadError) {
    return <div role="alert" className="mx-auto max-w-3xl px-4 py-10 text-red-800">{loadError}</div>;
  }

  if (!profile) {
    return <div className="mx-auto max-w-3xl space-y-4 px-4 py-10" aria-busy="true"><div className="h-40 skeleton rounded" /></div>;
  }

  const btn = 'rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 px-5 py-2 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Pengaturan Profil</h1>
        <p className="mt-1 text-slate-700">Kelola data diri, email, dan kata sandi akunmu.</p>
      </div>

      <Card title="Data Diri" description="Nama dan username tampil di forum dan di navbar.">
        <Notice kind={infoNotice.kind}>{infoNotice.text}</Notice>
        <form onSubmit={saveInfo} className="space-y-5" noValidate>
          <div>
            <label htmlFor="profile-name" className="block text-sm font-semibold text-slate-900">Nama lengkap</label>
            <input id="profile-name" type="text" maxLength={60} value={info.fullName} onChange={(e) => setInfo({ ...info, fullName: e.target.value })} className={controlClass} />
          </div>
          <div>
            <label htmlFor="profile-username" className="block text-sm font-semibold text-slate-900">Username</label>
            <input id="profile-username" type="text" maxLength={20} value={info.username} onChange={(e) => setInfo({ ...info, username: e.target.value })} className={controlClass} />
            <p className="mt-1 text-xs text-slate-500">3-20 karakter: huruf, angka, dan _</p>
          </div>
          <div>
            <label htmlFor="profile-whatsapp" className="block text-sm font-semibold text-slate-900">Nomor WhatsApp <span className="text-xs font-normal text-slate-500">opsional</span></label>
            <input id="profile-whatsapp" type="tel" inputMode="tel" value={info.whatsapp} onChange={(e) => setInfo({ ...info, whatsapp: e.target.value })} placeholder="081234567890" className={controlClass} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingInfo} className={btn}>{savingInfo ? 'Menyimpan...' : 'Simpan Data Diri'}</button>
          </div>
        </form>
      </Card>

      <Card title="Email" description={`Email saat ini: ${user.email ?? '-'}`}>
        <Notice kind={emailNotice.kind}>{emailNotice.text}</Notice>
        <form onSubmit={saveEmail} className="space-y-4" noValidate>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-semibold text-slate-900">Email baru</label>
            <input id="profile-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nama@email.com" className={controlClass} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingEmail || !newEmail.trim()} className={btn}>{savingEmail ? 'Mengirim...' : 'Ganti Email'}</button>
          </div>
        </form>
      </Card>

      <Card title="Kata Sandi" description="Masukkan kata sandi lama untuk memastikan ini kamu.">
        <Notice kind={passwordNotice.kind}>{passwordNotice.text}</Notice>
        <form onSubmit={savePassword} className="space-y-4" noValidate>
          <div>
            <label htmlFor="profile-pass-current" className="block text-sm font-semibold text-slate-900">Kata sandi lama</label>
            <input id="profile-pass-current" type="password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className={controlClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-pass-new" className="block text-sm font-semibold text-slate-900">Kata sandi baru</label>
              <input id="profile-pass-new" type="password" autoComplete="new-password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className={controlClass} />
              <p className="mt-1 text-xs text-slate-500">Minimal 8 karakter</p>
            </div>
            <div>
              <label htmlFor="profile-pass-confirm" className="block text-sm font-semibold text-slate-900">Ulangi kata sandi baru</label>
              <input id="profile-pass-confirm" type="password" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className={controlClass} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword || !passwords.current || !passwords.next || !passwords.confirm} className={btn}>
              {savingPassword ? 'Menyimpan...' : 'Ganti Kata Sandi'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
