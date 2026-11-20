'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/ui/select';
import { useConfirm } from '@/components/ui/confirmdialog';
import { formatForumDate } from '@/components/forum/format';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const LIMIT = 12;

const TYPES = [
  { value: 'accounts', label: 'Akun Katalog' },
  { value: 'contents', label: 'Berita' },
  { value: 'schedules', label: 'Jadwal' },
  { value: 'threads', label: 'Thread Forum' },
  { value: 'comments', label: 'Komentar Forum' },
];

//Sisa hari sebelum barang hilang permanen, dihitung dari tanggal diarsipkan
function daysLeft(archivedAt, retentionDays) {
  if (!archivedAt) return retentionDays;
  const elapsed = (Date.now() - new Date(archivedAt).getTime()) / (24 * 60 * 60 * 1000);
  return Math.max(Math.ceil(retentionDays - elapsed), 0);
}

//Sampah: barang yang diarsipkan bisa dipulihkan atau dihapus permanen
export default function SampahManager() {
  const confirm = useConfirm();
  const [type, setType] = useState('accounts');
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [retentionDays, setRetentionDays] = useState(30);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    loadApi()
      .then((api) => api.getTrash({ type, page, limit: LIMIT }))
      .then((res) => {
        if (!active) return;
        setItems(res.data ?? []);
        setMeta(res.meta ?? null);
        setRetentionDays(res.retention_days ?? 30);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message || 'Gagal memuat Sampah.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type, page, reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  async function restore(item) {
    setBusyId(item.id);
    setError('');
    try {
      const api = await loadApi();
      await api.restoreFromTrash(type, item.id);
      reload();
    } catch (err) {
      setError(err.message || 'Gagal memulihkan.');
    } finally {
      setBusyId(null);
    }
  }

  async function purge(item) {
    const ok = await confirm({
      title: 'Hapus permanen?',
      message: `"${item.label}" akan dihapus selamanya dan tidak bisa dikembalikan.`,
      confirmText: 'Ya, hapus permanen',
      danger: true,
    });
    if (!ok) return;

    setBusyId(item.id);
    setError('');
    try {
      const api = await loadApi();
      await api.purgeFromTrash(type, item.id);
      reload();
    } catch (err) {
      setError(err.message || 'Gagal menghapus permanen.');
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sampah</h2>
          <p className="mt-1 text-slate-700">
            Barang yang dihapus masuk ke sini dan bisa dipulihkan. Barang akan hilang permanen setelah {retentionDays} hari.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            id="sampah-type"
            value={type}
            onChange={(e) => {
              setLoading(true);
              setPage(1);
              setType(e.target.value);
            }}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          {error}{' '}
          <button type="button" onClick={reload} className="font-bold underline">Coba lagi</button>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-md" />
            ))}
          </div>
        ) : items.length === 0 && !error ? (
          <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-600">
            Sampah untuk jenis ini kosong.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => {
              const left = daysLeft(item.archived_at, retentionDays);
              return (
                <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{item.label || '(tanpa judul)'}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.author ? `${item.author} • ` : ''}
                      Diarsipkan {formatForumDate(item.archived_at)} • {left > 0 ? `hilang permanen dalam ${left} hari` : 'akan dihapus pada pembersihan berikutnya'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={() => restore(item)}
                      disabled={busyId === item.id}
                      className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-50 disabled:opacity-50"
                    >
                      Pulihkan
                    </button>
                    <button
                      type="button"
                      onClick={() => purge(item)}
                      disabled={busyId === item.id}
                      className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                    >
                      Hapus permanen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button type="button" onClick={() => { setLoading(true); setPage((p) => p - 1); }} disabled={page <= 1 || loading} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">
            Sebelumnya
          </button>
          <span className="text-slate-600">Halaman {page} dari {totalPages}</span>
          <button type="button" onClick={() => { setLoading(true); setPage((p) => p + 1); }} disabled={page >= totalPages || loading} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
