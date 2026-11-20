'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getForumThread, getLikeStatus, setLike } from '@/api/forum';
import Markdown from './markdown';
import CommentSection from './commentsection';
import { formatForumDate } from './format';
import { useMember } from './usemember';

//Halaman detail thread: isi, gambar, suka, dan komentar
export default function ThreadDetail({ slug }) {
  const { user } = useMember();
  const [thread, setThread] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    getForumThread(slug)
      .then((data) => {
        if (active) setThread(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message || 'Gagal memuat thread.');
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!thread || !user) return;
    let active = true;

    getLikeStatus(thread.id)
      .then((res) => {
        if (active) setLiked(res.liked);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [thread, user]);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await setLike(thread.id, !liked);
      setLiked(res.liked);
      setThread(await getForumThread(slug));
    } catch (err) {
      setError(err.message || 'Gagal memproses suka.');
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">Thread Tidak Ditemukan</h1>
        <p className="mt-2 text-slate-600">Thread ini tidak ada, sudah diarsipkan, atau sedang disembunyikan.</p>
        <Link href="/forum" className="mt-6 inline-block font-bold text-orange-600 hover:underline">
          Kembali ke Forum
        </Link>
      </div>
    );
  }

  if (error && !thread) {
    return (
      <div role="alert" className="mx-auto max-w-lg px-4 py-16 text-center text-red-800">
        {error}
      </div>
    );
  }

  if (!thread) {
    return <div className="mx-auto max-w-4xl space-y-4 px-4 py-10" aria-busy="true"><div className="h-10 w-3/4 skeleton rounded" /><div className="h-60 skeleton rounded" /></div>;
  }

  const isAuthor = user && user.id === thread.author_id;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
        <Link href="/forum" className="hover:text-orange-600">Forum</Link>
        {' > '}
        <span className="text-orange-500">{thread.title}</span>
      </nav>

      <header>
        <div className="flex flex-wrap gap-2">
          {thread.category && (
            <span className="rounded bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">{thread.category}</span>
          )}
          {thread.tags.map((tag) => (
            <span key={tag} className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">#{tag}</span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{thread.title}</h1>
        <p className="mt-2 text-slate-600">
          {thread.author ?? 'Member'} • {formatForumDate(thread.published_at)}
        </p>
      </header>

      {thread.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {thread.images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Markdown>{thread.body}</Markdown>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
        {user ? (
          <button
            type="button"
            onClick={toggleLike}
            disabled={busy}
            aria-pressed={liked}
            className={`rounded-md border px-5 py-2 font-semibold transition-all ${
              liked ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white text-slate-800 hover:border-orange-400'
            }`}
          >
            {liked ? 'Disukai' : 'Suka'} ({thread.likes})
          </button>
        ) : (
          <span className="text-slate-700">{thread.likes} suka</span>
        )}
        <span className="text-slate-700">{thread.comments} komentar</span>
        {isAuthor && (
          <Link href={`/forum/edit/${thread.id}`} className="ml-auto font-semibold text-orange-600 hover:underline">
            Ubah thread
          </Link>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <CommentSection slug={slug} threadId={thread.id} user={user} />
    </article>
  );
}
