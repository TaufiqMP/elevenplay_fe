'use client';

import { WhatsAppIcon } from '@/components/ui/icons';
import { useObjectUrl } from './photopicker';

// Tiruan kartu katalog publik, berubah langsung mengikuti isi form
export default function CardPreview({ title, subtitle, tierLabel, mainFile }) {
  const url = useObjectUrl(mainFile);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-neutral-200">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Pratinjau foto kartu" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm text-slate-500">Belum ada foto</span>
        )}
        {tierLabel && (
          <span className="absolute bottom-0 left-0 bg-orange-500 py-1 pl-5 pr-14 text-xl font-bold text-white">
            {tierLabel}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className={`text-lg font-bold ${title ? 'text-slate-900' : 'text-slate-400'}`}>
          {title || 'Judul akun'}
        </h3>
        <p className={`mt-1 text-sm leading-relaxed ${subtitle ? 'text-slate-600' : 'text-slate-400'}`}>
          {subtitle || 'Subjudul akun'}
        </p>
        <div className="mt-4 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 py-1 pl-4 pr-1 text-sm font-bold text-white">
            Hubungi
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600">
              <WhatsAppIcon />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}