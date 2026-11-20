'use client';

import { useEffect, useState } from 'react';
import { useConfirm } from '@/components/ui/confirmdialog';
import Select from '@/components/ui/select';
import { ArchiveIcon, PencilIcon, PlusCircleIcon } from '@/components/admin/icons';
import { TYPE_LABELS, formatWhen } from '@/components/jadwal/jadwalformat';
import JadwalForm from './jadwalform';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const LIMIT = 12;

const STATUS = {
  published: { label: 'Tayang', badge: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-600' },
  draft: { label: 'Draf', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  archived: { label: 'Arsip', badge: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
};

const FILTERS = [
  { value: '', label: 'Semua status' },
  { value: 'published', label: 'Tayang' },
  { value: 'draft', label: 'Draf' },
  { value: 'archived', label: 'Arsip' },
];

export default function JadwalManager() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  //editing: null = form tertutup, 'new' = tambah baru, objek jadwal = ubah
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let active = true;

    loadApi()
      .then((api) => api.getAdminSchedules({ page, limit: LIMIT, status }))
      .then((res) => {
        if (!active) return;
        setItems(res.data ?? []);
        setMeta(res.meta ?? null);
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Gagal memuat jadwal.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, status, reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  async function run(item, action, confirmText) {
    if (!(await confirm({ message: confirmText, confirmText: 'Ya, lanjutkan', danger: true }))) return;
    setBusyId(item.id);
    setError('');
    try {
      const api = await loadApi();
      await api.archiveSchedule(item.id);
      reload();
    } catch (err) {
      setError(err.message || 'Aksi gagal.');
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Jadwal Room Match &amp; Live TikTok</h2>
          <p className="mt-1 text-slate-700">
            Atur jadwal yang tampil di beranda. Maksimal 3 jadwal tampil: 1 kartu besar dan 2 kartu kecil.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 px-6 py-3 font-bold text-white transition-all duration-300 hover:from-orange-600 hover:to-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            <PlusCircleIcon />
            Tambah Jadwal Baru
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-6">
          <JadwalForm
            key={editing === 'new' ? 'new' : editing.id}
            schedule={editing === 'new' ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </div>
      )}

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-700" htmlFor="jadwal-filter-status">
          Filter:{' '}
        </label>
        <Select
          id="jadwal-filter-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
            setLoading(true);
          }}
          className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </Select>
      </div>

      {error && !loading && (
        <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          {error}{' '}
          <button type="button" onClick={reload} className="font-bold underline">Coba lagi</button>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Memuat jadwal">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-md" />
            ))}
          </div>
        ) : items.length === 0 && !error ? (
          <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-600">
            Belum ada jadwal{status ? ' dengan status ini' : ''}. Klik &quot;Tambah Jadwal Baru&quot; untuk membuat yang pertama.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="bg-orange-500 text-xs font-bold uppercase tracking-wide text-white">
                  <th className="px-6 py-4">Jadwal</th>
                  <th className="px-4 py-4">Jenis</th>
                  <th className="px-4 py-4">Tempat</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const badge = STATUS[item.status] ?? STATUS.draft;
                  return (
                    <tr key={item.id} className="align-middle">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {item.title}
                          {item.is_featured && (
                            <span className="ml-2 rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                              Kartu besar
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-500">{formatWhen(item)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="whitespace-nowrap rounded bg-orange-400 px-2.5 py-1 text-xs font-bold text-white">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-800">
                        {item.location || (item.type === 'live_tiktok' ? 'Akun TikTok aktif' : '-')}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badge.badge}`}>
                          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(item);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            aria-label={`Ubah ${item.title}`}
                            className="text-slate-800 hover:text-orange-600"
                          >
                            <PencilIcon />
                          </button>
                          {item.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => run(item, 'archive', `Pindahkan jadwal "${item.title}" ke Sampah? Jadwal hilang dari beranda, dan bisa dipulihkan dari tab Sampah selama 30 hari.`)}
                              disabled={busyId === item.id}
                              aria-label={`Arsipkan ${item.title}`}
                              className="text-slate-800 hover:text-orange-600 disabled:opacity-40"
                            >
                              <ArchiveIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button type="button" onClick={() => { setPage((p) => p - 1); setLoading(true); }} disabled={page <= 1 || loading} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">
            Sebelumnya
          </button>
          <span className="text-slate-600">Halaman {page} dari {totalPages}</span>
          <button type="button" onClick={() => { setPage((p) => p + 1); setLoading(true); }} disabled={page >= totalPages || loading} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
