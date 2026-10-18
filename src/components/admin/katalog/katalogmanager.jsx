'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminAccounts, archiveAccount, deleteAccountPermanently } from '@/api/adminaccounts';
import { PlusCircleIcon } from '@/components/admin/icons';
import KatalogTable from './katalogtable';

const LIMIT = 12;
const FILTERS = [
  { value: '', label: 'Semua status' },
  { value: 'published', label: 'Tayang' },
  { value: 'draft', label: 'Draf' },
  { value: 'archived', label: 'Arsip' },
];
 
export default function KatalogManager() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
 
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminAccounts({ page, limit: LIMIT, status });
      setItems(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err) {
      setError(err.message || 'Gagal memuat akun.');
    } finally {
      setLoading(false);
    }
  }, [page, status]);
 
  useEffect(() => {
    load();
  }, [load]);
 
  async function run(item, actionName, confirmText) {
    if (!window.confirm(confirmText)) return;
    setBusyId(item.id);
    setError('');
    try {
      if (actionName === 'archiveAccount') {
        await archiveAccount(item.id);
      } else {
        await deleteAccountPermanently(item.id);
      }
      await load(); // muat ulang supaya status/jumlah halaman akurat
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
          <h2 className="text-2xl font-extrabold text-slate-900">Manajemen E-Katalog Skuad</h2>
          <p className="mt-1 text-slate-700">Tambah, ubah, arsipkan, atau hapus akun yang tampil di katalog.</p>
        </div>
        <Link
          href="/admin/katalog/baru"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          <PlusCircleIcon />
          Tambah Akun Baru
        </Link>
      </div>
 
      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-700" htmlFor="filter-status">
          Filter:{' '}
        </label>
        <select
          id="filter-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
 
      {error && !loading && (
        <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          {error}{' '}
          <button type="button" onClick={load} className="font-bold underline">Coba lagi</button>
        </div>
      )}
 
      <div className="mt-6">
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Memuat akun">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 && !error ? (
          <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-600">
            Belum ada akun{status ? ' dengan status ini' : ''}.
          </p>
        ) : (
          <KatalogTable
            items={items}
            busyId={busyId}
            onArchive={(item) => run(item, 'archiveAccount', `Arsipkan akun ${item.code}? Akun akan hilang dari katalog publik, datanya tetap ada.`)}
            onDelete={(item) => run(item, 'deleteAccountPermanently', `Hapus PERMANEN akun ${item.code}? Tindakan ini tidak bisa dikembalikan.`)}
          />
        )}
      </div>
 
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">
            Sebelumnya
          </button>
          <span className="text-slate-600">Halaman {page} dari {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading} className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
 