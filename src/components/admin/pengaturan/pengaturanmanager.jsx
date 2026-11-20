'use client';

import { useEffect, useState } from 'react';
import { getSettings } from '@/api/settings';
import { clearSettingsCache } from '@/components/ui/usesettings';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const controlClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100';

function toFormValues(settings) {
  return {
    instagram_username: settings?.instagram_username ?? '',
    tiktok_username: settings?.tiktok_username ?? '',
    whatsapp_number: settings?.whatsapp_number ?? '',
  };
}

//Pengaturan global: akun TikTok aktif dan nomor WhatsApp admin
export default function PengaturanManager() {
  const [saved, setSaved] = useState(null);
  const [values, setValues] = useState(toFormValues(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    getSettings()
      .then((data) => {
        if (!active) return;
        setSaved(data);
        setValues(toFormValues(data));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Gagal memuat pengaturan.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setSuccess('');
  };

  const hasChanges = JSON.stringify(values) !== JSON.stringify(toFormValues(saved));

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving || !hasChanges) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const api = await loadApi();
      const data = await api.updateSettings({
        instagram_username: values.instagram_username.trim(),
        tiktok_username: values.tiktok_username.trim(),
        whatsapp_number: values.whatsapp_number.trim(),
      });
      //Tampilkan nilai yang sudah dirapikan backend (mis. 0812... menjadi 62812...)
      setSaved(data);
      setValues(toFormValues(data));
      clearSettingsCache();
      setSuccess('Pengaturan tersimpan. Beranda dan katalog memakai data baru dalam 1 menit.');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-9">
      <h2 className="text-2xl font-extrabold text-slate-900">Pengaturan Kontak &amp; Sosial Media</h2>
      <p className="mt-1 text-slate-700">
        Ganti di sini kalau akun Instagram, TikTok, atau nomor WhatsApp berubah. Semua jadwal live, tombol Hubungi, dan footer ikut berubah.
      </p>

      {loading ? (
        <div className="mt-8 space-y-3" aria-busy="true" aria-label="Memuat pengaturan">
          <div className="h-16 skeleton rounded-md" />
          <div className="h-16 skeleton rounded-md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-2xl space-y-6">
          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="setting-instagram" className="block text-sm font-semibold text-slate-900">
              Username Instagram
            </label>
            <div className="mt-1 flex items-center">
              <span className="rounded-l border border-r-0 border-slate-300 bg-slate-100 px-3 py-2 text-slate-600">@</span>
              <input
                id="setting-instagram"
                type="text"
                value={values.instagram_username}
                onChange={set('instagram_username')}
                placeholder="elevenplay.id"
                className={`${controlClass} mt-0 rounded-l-none`}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {saved?.instagram_url ? (
                <>
                  Link sekarang:{' '}
                  <a href={saved.instagram_url} target="_blank" rel="noreferrer" className="font-semibold text-orange-600 hover:underline">
                    {saved.instagram_url}
                  </a>
                </>
              ) : (
                'Belum diisi. Link Instagram di footer disembunyikan sampai diisi.'
              )}
            </p>
          </div>

          <div>
            <label htmlFor="setting-tiktok" className="block text-sm font-semibold text-slate-900">
              Username TikTok aktif
            </label>
            <div className="mt-1 flex items-center">
              <span className="rounded-l border border-r-0 border-slate-300 bg-slate-100 px-3 py-2 text-slate-600">@</span>
              <input
                id="setting-tiktok"
                type="text"
                value={values.tiktok_username}
                onChange={set('tiktok_username')}
                placeholder="elevenplay.id"
                className={`${controlClass} mt-0 rounded-l-none`}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {saved?.tiktok_url ? (
                <>
                  Link sekarang:{' '}
                  <a href={saved.tiktok_url} target="_blank" rel="noreferrer" className="font-semibold text-orange-600 hover:underline">
                    {saved.tiktok_url}
                  </a>
                </>
              ) : (
                'Belum diisi. Jadwal Live TikTok tanpa tempat tidak akan menampilkan nama akun.'
              )}
            </p>
          </div>

          <div>
            <label htmlFor="setting-whatsapp" className="block text-sm font-semibold text-slate-900">
              Nomor WhatsApp admin
            </label>
            <input
              id="setting-whatsapp"
              type="tel"
              inputMode="tel"
              value={values.whatsapp_number}
              onChange={set('whatsapp_number')}
              placeholder="081234567890"
              className={controlClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              {saved?.whatsapp_url ? (
                <>
                  Tombol Hubungi membuka:{' '}
                  <a href={saved.whatsapp_url} target="_blank" rel="noreferrer" className="font-semibold text-orange-600 hover:underline">
                    {saved.whatsapp_url}
                  </a>
                </>
              ) : (
                'Belum diisi. Tombol Hubungi di katalog disembunyikan sampai nomor diisi.'
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="rounded-sm bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 px-8 py-2.5 font-semibold text-white hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      )}
    </div>
  );
}
