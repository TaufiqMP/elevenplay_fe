import Link from 'next/link';
import { DocIcon, EyeIcon, PencilIcon, TrashIcon } from '@/components/admin/icons';

// Sesuaikan key status dengan nilai dari backend
const STATUS = {
  published: { label: 'Tayang', badge: 'bg-indigo-50 text-emerald-800', dot: 'bg-emerald-600' },
  draft: { label: 'Draf', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  archived: { label: 'Arsip', badge: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
};

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jakarta',
});

function formatDate(iso) {
  if (!iso) return '-';
  const p = Object.fromEntries(dateFormat.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute} WIB`;
}

export default function BeritaTable({ items, onDelete, deletingId }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead>
          <tr className="bg-orange-500 text-xs font-bold uppercase tracking-wide text-white">
            <th className="px-6 py-4">Judul Berita</th>
            <th className="px-4 py-4">Kategori</th>
            <th className="px-4 py-4">Tanggal Terbit</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const status = STATUS[item.status] ?? STATUS.draft;
            return (
              <tr key={item.id} className="align-middle">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-slate-300 text-slate-500">
                      <DocIcon />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">Slug: {item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="whitespace-nowrap rounded bg-orange-400 px-2.5 py-1 text-xs font-bold text-white">
                    {item.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-800">
                  {formatDate(item.published_at)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.badge}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/forum/${item.slug}`}
                      aria-label={`Lihat ${item.title}`}
                      className="text-slate-800 hover:text-orange-600"
                    >
                      <EyeIcon />
                    </Link>
                    <Link
                      href={`/admin/berita/${item.id}/edit`}
                      aria-label={`Ubah ${item.title}`}
                      className="text-slate-800 hover:text-orange-600"
                    >
                      <PencilIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      disabled={deletingId === item.id}
                      aria-label={`Hapus ${item.title}`}
                      className="text-red-600 hover:text-red-800 disabled:opacity-40"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}