'use client';

import { useEffect, useState } from 'react';
import { useConfirm } from '@/components/ui/confirmdialog';
import Select from '@/components/ui/select';
import Link from 'next/link';
import { ShieldIcon } from '@/components/admin/icons';
import { formatForumDate } from '@/components/forum/format';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const LIMIT = 12;

const FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'published', label: 'Tayang' },
  { value: 'hidden', label: 'Disembunyikan' },
];

const ACTION_LABEL = {
  hide_thread: 'Menyembunyikan thread',
  show_thread: 'Menayangkan thread',
  hide_comment: 'Menyembunyikan komentar',
};

//Moderasi forum: sembunyikan atau tayangkan thread, dan riwayat tindakan admin
export default function ForumModeration() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    loadApi()
      .then((api) => Promise.all([
        api.getAdminForumThreads({ page, limit: LIMIT, status }),
        api.getModerationLogs({ limit: 10 }),
      ]))
      .then(([threads, logRes]) => {
        if (!active) return;
        setItems(threads.data ?? []);
        setMeta(threads.meta ?? null);
        setLogs(logRes.data ?? []);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message || 'Gagal memuat moderasi forum.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, status, reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  async function toggle(thread) {
    const next = thread.status === 'hidden' ? 'published' : 'hidden';
    const question = next === 'hidden'
      ? `Sembunyikan thread "${thread.title}"? Thread tidak tampil di forum, tapi datanya tetap ada.`
      : `Tayangkan lagi thread "${thread.title}"?`;
    if (!(await confirm({ message: question, confirmText: next === 'hidden' ? 'Sembunyikan' : 'Tayangkan', danger: next === 'hidden' }))) return;

    setBusyId(thread.id);
    setError('');
    try {
      const api = await loadApi();
      await api.setForumThreadStatus(thread.id, next);
      reload();
    } catch (err) {
      setError(err.message || 'Aksi gagal.');
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
              <ShieldIcon className="h-6 w-6" />
              Moderasi Forum
            </h2>
            <p className="mt-1 text-slate-700">Sembunyikan thread yang melanggar aturan, atau tayangkan lagi kalau sudah sesuai.</p>
          </div>
          <div>
            <label htmlFor="forum-filter" className="text-sm font-semibold text-slate-700">Filter: </label>
            <Select
              id="forum-filter"
              value={status}
              onChange={(e) => {
                setLoading(true);
                setPage(1);
                setStatus(e.target.value);
              }}
              className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
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
            <p className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-600">Belum ada thread.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="bg-orange-500 text-xs font-bold uppercase tracking-wide text-white">
                    <th className="px-6 py-4">Thread</th>
                    <th className="px-4 py-4">Penulis</th>
                    <th className="px-4 py-4">Dibuat</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((thread) => (
                    <tr key={thread.id} className="align-middle">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{thread.title}</p>
                        <p className="text-sm text-slate-500">{thread.likes} suka • {thread.comments} komentar</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-800">{thread.author ?? '-'}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-800">{formatForumDate(thread.created_at)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${thread.status === 'hidden' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
                          {thread.status === 'hidden' ? 'Disembunyikan' : thread.status === 'published' ? 'Tayang' : thread.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4 text-sm font-semibold">
                          {thread.status === 'published' && (
                            <Link href={`/forum/${thread.slug}`} className="text-slate-700 hover:text-orange-600">Lihat</Link>
                          )}
                          {(thread.status === 'published' || thread.status === 'hidden') && (
                            <button
                              type="button"
                              onClick={() => toggle(thread)}
                              disabled={busyId === thread.id}
                              className={thread.status === 'hidden' ? 'text-emerald-700 hover:underline' : 'text-red-600 hover:underline'}
                            >
                              {thread.status === 'hidden' ? 'Tayangkan' : 'Sembunyikan'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-9">
        <h3 className="text-xl font-bold text-slate-900">Riwayat Moderasi Terakhir</h3>
        {logs.length === 0 ? (
          <p className="mt-4 text-slate-600">Belum ada tindakan moderasi.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log.id} className="py-3 text-sm text-slate-800">
                <span className="font-semibold">{log.admin ?? 'Admin'}</span> — {ACTION_LABEL[log.action] ?? log.action} #{log.target_id}
                {log.note && <span className="text-slate-600"> ({log.note})</span>}
                <span className="ml-2 text-slate-500">{formatForumDate(log.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
