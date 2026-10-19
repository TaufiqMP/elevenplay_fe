import Link from 'next/link';
import { ArchiveIcon, EyeIcon, PencilIcon, TrashIcon } from '@/components/admin/icons';

const STATUS = {
  published: { label: 'Tayang', badge: 'bg-indigo-50 text-emerald-800', dot: 'bg-emerald-600' },
  draft: { label: 'Draf', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  archived: { label: 'Arsip', badge: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
};

// Field judul dari API belum saya ketahui. Ganti di SATU tempat ini
// sesuai respons /admin/accounts (mis. item.title atau item.name).
const getTitle = (item) => item.title ?? item.name ?? item.code;

export default function KatalogTable({ items, onArchive, onDelete, busyId }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead>
          <tr className="bg-orange-500 text-xs font-bold uppercase tracking-wide text-white">
            <th className="px-6 py-4">Akun</th>
            <th className="px-4 py-4">Kode</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const status = STATUS[item.status] ?? STATUS.draft;
            const busy = busyId === item.id;
            return (
              <tr key={item.id} className="align-middle">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {item.main_image_url ? (
                      // <img> biasa supaya tidak perlu daftar domain di next.config
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.main_image_url}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded-md border border-slate-200 object-cover"
                      />
                    ) : (
                      <span className="h-12 w-20 shrink-0 rounded-md border border-slate-200 bg-slate-100" />
                    )}
                    <p className="font-semibold text-slate-900">{getTitle(item)}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-800">
                  {item.code}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.badge}`}>
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/katalog/${item.code}`} aria-label={`Lihat ${item.code}`} className="text-slate-800 hover:text-orange-600">
                      <EyeIcon />
                    </Link>
                    <Link href={`/admin/katalog/${item.id}/edit`} aria-label={`Ubah ${item.code}`} className="text-slate-800 hover:text-orange-600">
                      <PencilIcon />
                    </Link>
                    {item.status !== 'archived' && (
                      <button type="button" onClick={() => onArchive(item)} disabled={busy} aria-label={`Arsipkan ${item.code}`} className="text-slate-800 hover:text-orange-600 disabled:opacity-40">
                        <ArchiveIcon />
                      </button>
                    )}
                    <button type="button" onClick={() => onDelete(item)} disabled={busy} aria-label={`Hapus permanen ${item.code}`} className="text-red-600 hover:text-red-800 disabled:opacity-40">
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