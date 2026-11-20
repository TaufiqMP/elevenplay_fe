import React, { Suspense } from 'react';
import CatalogView from '@/components/catalog/CatalogView';
import SkeletonCard from '@/components/catalog/SkeletonCard';

function CatalogFallback() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
      <div className="mb-8">
        <div className="h-10 w-48 skeleton rounded-lg mb-3" />
        <div className="h-5 w-80 skeleton rounded" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-card">
        <div className="h-11 skeleton rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4 gap-6 sm:gap-7">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'E-Katalog Akun eFootball | Elevenplay',
  description: 'Cari squad e-football impianmu, ready semua spesifikasi di Elevenplay.id - Platform e-katalog terstruktur dan komunitas digital eFootball Indonesia.',
};

export default function HomePage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogView />
    </Suspense>
  );
}
