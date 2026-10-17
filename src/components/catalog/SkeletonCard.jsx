import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card flex flex-col animate-pulse">
      {/* Gambar Shimmer */}
      <div className="relative aspect-[16/9] w-full bg-slate-200">
        <div className="absolute bottom-0 left-0 w-20 h-6 bg-slate-300 rounded-tr-lg" />
        <div className="absolute top-2.5 right-2.5 w-16 h-5 bg-slate-300 rounded-md" />
      </div>

      {/* Konten Shimmer */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-2.5">
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-3.5 bg-slate-100 rounded w-full" />
          <div className="h-3.5 bg-slate-100 rounded w-5/6" />
        </div>

        {/* Action Row Shimmer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-7 bg-slate-200 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}
