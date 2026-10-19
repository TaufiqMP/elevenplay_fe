'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminNews, deleteAdminNews } from '@/api/adminnews';
import { PlusCircleIcon } from '@/components/admin/icons';
import BeritaTable from './beritatable';

// Client Component, karena token admin diambil dari sesi Supabase di browser.
export default function BeritaManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminNews();
      setItems(res.data ?? []);
    } catch (err) {
      setError(err.message || 'Gagal memuat berita.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(item) {
    if (!window.confirm(`Hapus berita "${item.title}"?`)) return;
    setDeletingId(item.id);
    try {
      await deleteAdminNews(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (err) {
      setError(err.message || 'Gagal menghapus berita.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Manajemen Konten &amp; Berita Beranda
          </h2>
          <p className="mt-1 text-slate-700">
            Perbarui jadwal patch, rujukan meta taktik, dan panduan resmi untuk pengunjung.
          </p>
        </div>
        <Link
          href="/admin/berita/baru"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          <PlusCircleIcon />
          Tambah Berita Baru Beranda
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Memuat berita">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-600">
            Belum ada berita. Klik &quot;Tambah Berita Baru Beranda&quot; untuk membuat yang pertama.
          </p>
        ) : (
          <BeritaTable items={items} onDelete={handleDelete} deletingId={deletingId} />
        )}
      </div>
    </div>
  );
}