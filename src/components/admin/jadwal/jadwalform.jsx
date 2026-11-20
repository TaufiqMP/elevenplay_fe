'use client';

import { useState } from 'react';
import Select from '@/components/ui/select';
import JadwalCard from '@/components/jadwal/jadwalcard';
import { DAYS, TYPE_LABELS } from '@/components/jadwal/jadwalformat';
import { useSettings } from '@/components/ui/usesettings';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const controlClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100';

function Label({ htmlFor, children, required = false, optional = false }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-900">
      {children}
      {required && <span className="text-red-600"> *</span>}
      {optional && <span className="ml-2 text-xs font-normal text-slate-500">Opsional</span>}
    </label>
  );
}

function getFormValues(schedule) {
  return {
    title: schedule?.title ?? '',
    type: schedule?.type ?? 'live_tiktok',
    recurrence: schedule?.recurrence ?? 'weekly',
    day_of_week: schedule?.day_of_week != null ? String(schedule.day_of_week) : '6',
    event_date: schedule?.event_date ?? '',
    start_time: schedule?.start_time ? schedule.start_time.slice(0, 5) : '',
    end_time: schedule?.end_time ? schedule.end_time.slice(0, 5) : '',
    location: schedule?.location ?? '',
    link_url: schedule?.link_url ?? '',
    is_featured: schedule?.is_featured ?? false,
    status: schedule?.status ?? 'draft',
  };
}

//Form tambah/ubah jadwal. schedule kosong berarti tambah baru
export default function JadwalForm({ schedule = null, onSaved, onCancel }) {
  const isEditing = Boolean(schedule);
  const settings = useSettings();
  const [values, setValues] = useState(() => getFormValues(schedule));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    setError('');
    if (!values.title.trim()) return setError('Judul wajib diisi.');
    if (!values.start_time) return setError('Jam mulai wajib diisi.');
    if (values.recurrence === 'once' && !values.event_date) return setError('Tanggal wajib diisi untuk jadwal sekali jalan.');

    //Kirim hari ATAU tanggal sesuai pengulangan. Backend mengosongkan yang tidak dipakai
    const body = {
      title: values.title.trim(),
      type: values.type,
      recurrence: values.recurrence,
      day_of_week: values.recurrence === 'weekly' ? Number(values.day_of_week) : null,
      event_date: values.recurrence === 'once' ? values.event_date : null,
      start_time: values.start_time,
      end_time: values.end_time || null,
      location: values.location.trim(),
      link_url: values.link_url.trim(),
      is_featured: values.is_featured,
      status: values.status,
    };

    setSaving(true);
    try {
      const api = await loadApi();
      if (isEditing) await api.updateSchedule(schedule.id, body);
      else await api.createSchedule(body);
      onSaved();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan jadwal.');
    } finally {
      setSaving(false);
    }
  }

  const isTiktok = values.type === 'live_tiktok';
  const btn = 'rounded-lg px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-orange-300 bg-orange-50/40 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Ubah Jadwal' : 'Tambah Jadwal Baru'}</h3>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={saving} className={`${btn} bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/30 hover:from-rose-600 hover:to-red-700`}>
            Batal
          </button>
          <button type="submit" disabled={saving} className={`${btn} bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600`}>
            {saving ? 'Menyimpan...' : isEditing ? 'Update' : 'Simpan'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="jadwal-title" required>Judul</Label>
            <input id="jadwal-title" type="text" value={values.title} onChange={set('title')} placeholder="Live Mabar & Giveaway Squad Sultan" className={controlClass} />
          </div>

          <div>
            <Label htmlFor="jadwal-type">Jenis</Label>
            <Select id="jadwal-type" value={values.type} onChange={set('type')} className={controlClass}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="jadwal-status">Status</Label>
            <Select id="jadwal-status" value={values.status} onChange={set('status')} className={controlClass}>
              <option value="draft">Draf</option>
              <option value="published">Tayang</option>
              {values.status === 'archived' && <option value="archived">Arsip</option>}
            </Select>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold text-slate-900">Pengulangan</legend>
            <div className="mt-2 flex gap-6">
              <label className="flex items-center gap-2 text-slate-800">
                <input type="radio" name="recurrence" value="weekly" checked={values.recurrence === 'weekly'} onChange={set('recurrence')} className="accent-orange-500" />
                Mingguan
              </label>
              <label className="flex items-center gap-2 text-slate-800">
                <input type="radio" name="recurrence" value="once" checked={values.recurrence === 'once'} onChange={set('recurrence')} className="accent-orange-500" />
                Sekali (tanggal tertentu)
              </label>
            </div>
          </fieldset>

          {values.recurrence === 'weekly' ? (
            <div className="sm:col-span-2">
              <Label htmlFor="jadwal-day" required>Hari</Label>
              <Select id="jadwal-day" value={values.day_of_week} onChange={set('day_of_week')} className={controlClass}>
                {DAYS.map((day, index) => (
                  <option key={day} value={String(index)}>{day}</option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Label htmlFor="jadwal-date" required>Tanggal</Label>
              <input id="jadwal-date" type="date" value={values.event_date} onChange={set('event_date')} className={controlClass} />
              <p className="mt-1 text-xs text-slate-500">Setelah tanggal ini lewat, jadwal otomatis hilang dari beranda.</p>
            </div>
          )}

          <div>
            <Label htmlFor="jadwal-start" required>Jam Mulai (WIB)</Label>
            <input id="jadwal-start" type="time" value={values.start_time} onChange={set('start_time')} className={controlClass} />
          </div>

          <div>
            <Label htmlFor="jadwal-end" optional>Jam Selesai (WIB)</Label>
            <input id="jadwal-end" type="time" value={values.end_time} onChange={set('end_time')} className={controlClass} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="jadwal-location" optional>Tempat</Label>
            <input
              id="jadwal-location"
              type="text"
              value={values.location}
              onChange={set('location')}
              placeholder={isTiktok ? 'Kosongkan untuk memakai akun TikTok di Pengaturan' : 'Room ID dibagikan di grup WhatsApp'}
              className={controlClass}
            />
            {isTiktok && (
              <p className="mt-1 text-xs text-slate-500">
                Kosong = otomatis memakai akun TikTok aktif
                {settings?.tiktok_username ? ` (@${settings.tiktok_username})` : ' (belum diisi di tab Pengaturan)'}.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="jadwal-link" optional>Link</Label>
            <input
              id="jadwal-link"
              type="url"
              value={values.link_url}
              onChange={set('link_url')}
              placeholder="https://..."
              className={controlClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              {isTiktok
                ? 'Kosong = kartu membuka halaman live akun TikTok aktif.'
                : 'Kalau diisi, kartu di beranda bisa diklik ke link ini.'}
            </p>
          </div>

          <label className="flex items-center gap-2 text-slate-800 sm:col-span-2">
            <input type="checkbox" checked={values.is_featured} onChange={set('is_featured')} className="h-4 w-4 accent-orange-500" />
            Tampilkan sebagai <strong>kartu besar</strong> di beranda (kartu besar lama otomatis dilepas)
          </label>
        </div>

        <aside>
          <p className="mb-3 text-sm font-semibold text-slate-900">Preview Kartu</p>
          <div className="rounded-sm bg-gradient-to-b from-neutral-800 to-black p-4">
            <JadwalCard schedule={values} settings={settings} big={values.is_featured} preview />
          </div>
        </aside>
      </div>
    </form>
  );
}
