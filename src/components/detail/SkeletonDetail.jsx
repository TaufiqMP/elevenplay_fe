import React from 'react';

export default function SkeletonDetail() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 animate-pulse">
      {/* 1. Breadcrumb & Back Skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
        <div className="w-44 h-4 bg-slate-200 rounded" />
      </div>

      {/* 2. Header Skeleton (Judul, Subtitle & Tombol WhatsApp) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-64 sm:w-80 md:w-96 h-8 sm:h-9 bg-slate-200 rounded-lg" />
            <div className="w-16 h-6 bg-slate-200 rounded-md" />
          </div>
          <div className="w-48 sm:w-72 h-4 bg-slate-100 rounded" />
        </div>
        <div className="w-36 h-11 bg-slate-200 rounded-full shrink-0" />
      </div>

      {/* 3. Grid Dua Kolom Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        {/* Kolom Kiri: Skeleton Gambar Utama */}
        <div className="lg:col-span-7">
          <div className="aspect-[16/9] w-full bg-slate-200 rounded-2xl relative overflow-hidden shadow-card">
            <div className="absolute top-3 right-3 w-20 h-6 bg-slate-300 rounded-md" />
            <div className="absolute bottom-0 left-0 w-24 h-7 bg-slate-300 rounded-tr-xl" />
          </div>
        </div>

        {/* Kolom Kanan: Skeleton Ringkasan Spesifikasi */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 xl:p-8 shadow-card space-y-4">
            <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />

            {/* Baris-baris spesifikasi */}
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-16" />
              <div className="h-3.5 bg-slate-100 rounded w-full" />
              <div className="h-3.5 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section Detail Edisi Skeleton */}
      <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-slate-200">
        <div className="w-40 h-7 bg-slate-200 rounded-lg mb-6" />
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
          <div className="space-y-2.5">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>

          <hr className="border-slate-100" />

          <div>
            <div className="w-24 h-4 bg-slate-200 rounded mb-3" />
            <div className="space-y-2.5">
              <div className="h-4 bg-slate-100 rounded w-48" />
              <div className="h-4 bg-slate-100 rounded w-56" />
              <div className="h-4 bg-slate-100 rounded w-44" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
