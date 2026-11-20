import React from 'react';

//Kerangka kartu katalog saat data masih dimuat. Kilau hanya di bagian isi, pembungkus tetap putih
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card flex flex-col" aria-hidden="true">
      <div className="relative aspect-[16/9] w-full skeleton">
        <div className="absolute bottom-0 left-0 w-20 h-6 bg-slate-300/80 rounded-tr-lg" />
        <div className="absolute top-2.5 right-2.5 w-16 h-5 bg-slate-300/80 rounded-md" />
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-2.5">
          <div className="h-5 skeleton rounded w-3/4" />
          <div className="h-3.5 skeleton rounded w-full" />
          <div className="h-3.5 skeleton rounded w-5/6" />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 skeleton rounded w-20" />
          <div className="h-7 skeleton rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}
