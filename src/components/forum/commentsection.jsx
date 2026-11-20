'use client';

import { useEffect, useState } from 'react';
import { useConfirm } from '@/components/ui/confirmdialog';
import { createForumComment, deleteForumComment, getForumComments } from '@/api/forum';
import { formatForumDate } from './format';

//Komentar utama dengan balasan satu tingkat di bawahnya
export default function CommentSection({ slug, threadId, user }) {
  const confirm = useConfirm();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    getForumComments(slug)
      .then((data) => {
        if (active) setComments(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Gagal memuat komentar.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  async function reload() {
    try {
      setComments(await getForumComments(slug));
    } catch (err) {
      setError(err.message || 'Gagal memuat komentar.');
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (busy || !text.trim()) return;

    setBusy(true);
    setError('');
    try {
      await createForumComment(threadId, text.trim(), replyTo?.id ?? null);
      setText('');
      setReplyTo(null);
      await reload();
    } catch (err) {
      setError(err.message || 'Gagal mengirim komentar.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(comment) {
    if (!(await confirm({ title: 'Hapus komentar?', message: 'Komentar yang dihapus tidak bisa dikembalikan.', confirmText: 'Ya, hapus', danger: true }))) return;
    setError('');
    try {
      await deleteForumComment(comment.id);
      await reload();
    } catch (err) {
      setError(err.message || 'Gagal menghapus komentar.');
    }
  }

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (id) => comments.filter((c) => c.parent_id === id);

  function renderComment(comment, isReply = false) {
    const mine = user && user.id === comment.author_id;
    return (
      <li key={comment.id} className={`${isReply ? 'ml-10 border-l-2 border-orange-200 pl-4' : ''} py-4`}>
        <p className="text-sm text-slate-500">
          <span className="font-bold text-slate-900">{comment.author ?? 'Member'}</span> • {formatForumDate(comment.created_at)}
        </p>
        <p className="mt-1 whitespace-pre-line text-slate-800">{comment.body}</p>
        <div className="mt-2 flex gap-4 text-sm font-semibold">
          {user && !isReply && (
            <button type="button" onClick={() => setReplyTo(comment)} className="text-orange-600 hover:underline">
              Balas
            </button>
          )}
          {mine && (
            <button type="button" onClick={() => remove(comment)} className="text-red-600 hover:underline">
              Hapus
            </button>
          )}
        </div>
        {!isReply && repliesOf(comment.id).length > 0 && (
          <ul>{repliesOf(comment.id).map((reply) => renderComment(reply, true))}</ul>
        )}
      </li>
    );
  }

  return (
    <section className="mt-12" aria-labelledby="komentar-judul">
      <h2 id="komentar-judul" className="text-2xl font-bold text-slate-900">
        Diskusi & Komentar ({comments.length})
      </h2>

      {user ? (
        <form onSubmit={submit} className="mt-4 space-y-2">
          {replyTo && (
            <p className="text-sm text-slate-600">
              Membalas <strong>{replyTo.author ?? 'Member'}</strong>{' '}
              <button type="button" onClick={() => setReplyTo(null)} className="font-semibold text-orange-600 hover:underline">
                batal
              </button>
            </p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={replyTo ? 'Tulis balasan...' : 'Tulis komentar...'}
            aria-label="Tulis komentar"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="rounded-md bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 px-6 py-2 font-bold text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
            >
              {busy ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 p-4 text-slate-700">
          <a href="/login" className="font-bold text-orange-600 hover:underline">Masuk</a> untuk ikut berkomentar.
        </p>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 h-20 skeleton rounded-md" aria-busy="true" />
      ) : topLevel.length === 0 ? (
        <p className="mt-6 text-slate-600">Belum ada komentar. Jadilah yang pertama.</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200">{topLevel.map((c) => renderComment(c))}</ul>
      )}
    </section>
  );
}
