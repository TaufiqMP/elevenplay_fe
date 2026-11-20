'use client';

import { useEffect, useState } from 'react';
import { useConfirm } from '@/components/ui/confirmdialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { archiveForumThread, getMyThreads } from '@/api/forum';
import { formatForumDate, excerptOf } from './format';
import { useMember } from './usemember';

const TABS = [
  { value: 'published', label: 'Dipublikasikan' },
  { value: 'draft', label: 'Draf' },
  { value: 'hidden', label: 'Disembunyikan' },
];

const STATUS_LABEL = {
  published: 'Tayang',
  draft: 'Draf',
  hidden: 'Disembunyikan oleh admin',
};

//Thread milik sendiri, dibagi per status
export default function MyThreads() {
  const confirm = useConfirm();
  const router = useRouter();
  const { ready, user } = useMember();
  const [tab, setTab] = useState('published');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    getMyThreads(tab)
      .then((data) => {
        if (!active) return;
        setItems(data);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message || 'Gagal memuat thread.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tab, user, reloadKey]);

  function changeTab(value) {
    setLoading(true);
    setTab(value);
  }

  async function archive(thread) {
    if (!(await confirm({ title: 'Arsipkan thread?', message: `"${thread.title}" tidak akan tampil lagi di forum.`, confirmText: 'Ya, arsipkan', danger: true }))) return;
    try {
      await archiveForumThread(thread.id);
      setLoading(true);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.message || 'Gagal mengarsipkan thread.');
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Thread Saya</h1>
          <p className="mt-1 text-slate-700">Kelola thread yang kamu tulis, termasuk draf.</p>
        </div>
        <Link href="/forum/baru" className="inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 px-6 py-3 font-bold text-white hover:from-orange-600 hover:to-amber-600">
          Buat Thread Baru
        </Link>
      </div>

      <div role="tablist" aria-label="Status thread" className="mt-6 inline-flex gap-2 rounded-2xl border border-slate-300 bg-white p-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => changeTab(t.value)}
            className={`rounded-xl border px-5 py-2.5 font-semibold transition-all duration-300 ${
              tab === t.value ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white text-slate-800 hover:border-orange-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {error && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <div className="h-20 skeleton rounded-md" />
            <div className="h-20 skeleton rounded-md" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-600">
            Belum ada thread di daftar ini.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((thread) => (
              <li key={thread.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">
                      {STATUS_LABEL[thread.status] ?? thread.status} • terakhir diubah {formatForumDate(thread.updated_at)}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">{thread.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-700">{excerptOf(thread.body)}</p>
                    <p className="mt-2 text-xs text-slate-500">{thread.likes} suka • {thread.comments} komentar</p>
                  </div>
                  <div className="flex shrink-0 gap-4 text-sm font-semibold">
                    {thread.status === 'published' && (
                      <Link href={`/forum/${thread.slug}`} className="text-slate-700 hover:text-orange-600">Lihat</Link>
                    )}
                    <Link href={`/forum/edit/${thread.id}`} className="text-orange-600 hover:underline">Ubah</Link>
                    {thread.status !== 'hidden' && (
                      <button type="button" onClick={() => archive(thread)} className="text-red-600 hover:underline">
                        Arsipkan
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
