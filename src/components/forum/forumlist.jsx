'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getForumCategories, getForumThreads } from '@/api/forum';
import ThreadCard from './threadcard';
import { useMember } from './usemember';

const LIMIT = 12;

//Daftar thread forum: filter kategori, pencarian judul, dan halaman
export default function ForumList() {
  const { user } = useMember();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], meta: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getForumCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;

    getForumThreads({ page, limit: LIMIT, category, q: query })
      .then((res) => {
        if (!active) return;
        setResult({ data: res.data ?? [], meta: res.meta ?? null });
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message || 'Gagal memuat forum.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, category, query]);

  //Setiap perubahan filter kembali ke halaman pertama dan menampilkan loading
  function changeCategory(value) {
    setLoading(true);
    setPage(1);
    setCategory(value);
  }

  function submitSearch(e) {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setQuery(search.trim());
  }

  const totalPages = result.meta?.total_pages ?? 1;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Forum Komunitas eFootball</h1>
          <p className="mt-1 text-slate-700">Bagikan dan diskusikan topik seputar eFootball bersama member lain.</p>
        </div>
        <Link
          href={user ? '/forum/baru' : '/login'}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 px-6 py-3 font-bold text-white hover:from-orange-600 hover:to-amber-600"
        >
          Buat Thread Baru
        </Link>
      </div>

      <form onSubmit={submitSearch} className="mt-6 flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul thread"
          aria-label="Cari judul thread"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100"
        />
        <button type="submit" className="shrink-0 rounded-md bg-orange-500 px-5 font-semibold text-white hover:bg-orange-600">
          Cari
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
        <button
          type="button"
          onClick={() => changeCategory('')}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
            category === '' ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => changeCategory(String(c.id))}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
              category === String(c.id) ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Memuat thread">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 skeleton rounded-md" />
            ))}
          </div>
        ) : result.data.length === 0 && !error ? (
          <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-600">
            Belum ada thread{query || category ? ' yang cocok dengan filter ini' : ''}.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {result.data.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setPage((p) => p - 1);
            }}
            disabled={page <= 1 || loading}
            className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-slate-600">
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
            disabled={page >= totalPages || loading}
            className="rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
