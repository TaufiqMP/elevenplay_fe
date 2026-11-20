import Link from 'next/link';
import { excerptOf, formatForumDate } from './format';

//Kartu thread di daftar forum
export default function ThreadCard({ thread }) {
  return (
    <Link
      href={`/forum/${thread.slug}`}
      className="block rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex flex-wrap gap-2">
        {thread.category && (
          <span className="rounded bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">{thread.category}</span>
        )}
        {thread.tags.map((tag) => (
          <span key={tag} className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            #{tag}
          </span>
        ))}
      </div>

      <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900">{thread.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-slate-700">{excerptOf(thread.body)}</p>

      <p className="mt-4 text-xs text-slate-500">
        {thread.author ?? 'Member'} • {formatForumDate(thread.published_at)} • {thread.likes} suka • {thread.comments}{' '}
        komentar
      </p>
    </Link>
  );
}
