'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useMemo } from 'react';

/**
 * Komponen Galeri Gambar Interaktif untuk Halaman Detail Akun Elevenplay.
 * - Menampilkan gambar utama berdasarkan gambar aktif.
 * - Menampilkan thumbnail strip HANYA jika ada gambar tambahan (> 1 gambar).
 * - Menangani gambar null atau error loading dengan fallback visual khas Elevenplay.
 */
export default function DetailGallery({
  mainImageUrl,
  gallery = [],
  title = 'Akun eFootball',
  code = 'ACC',
  tierLabel = null,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  // Reset indeks aktif dan status error saat kode akun berganti (pola penyesuaian state render React)
  const [prevProps, setPrevProps] = useState({ code, mainImageUrl });
  if (prevProps.code !== code || prevProps.mainImageUrl !== mainImageUrl) {
    setPrevProps({ code, mainImageUrl });
    setActiveImageIndex(0);
    setFailedImages({});
  }

  // Kumpulkan semua URL gambar unik yang valid (main_image_url + gallery)
  const allImages = useMemo(() => {
    const list = [];
    if (mainImageUrl && typeof mainImageUrl === 'string' && mainImageUrl.trim()) {
      list.push(mainImageUrl.trim());
    }
    if (Array.isArray(gallery)) {
      gallery.forEach((item) => {
        const url = typeof item === 'string' ? item.trim() : (item?.url || item?.src || '').trim();
        if (url && !list.includes(url)) {
          list.push(url);
        }
      });
    }
    return list;
  }, [mainImageUrl, gallery]);

  const handleImageError = (imgUrl) => {
    setFailedImages((prev) => ({ ...prev, [imgUrl]: true }));
  };

  const hasImages = allImages.length > 0;
  const currentImageUrl = hasImages ? allImages[activeImageIndex] : null;
  const isCurrentFailed = currentImageUrl ? Boolean(failedImages[currentImageUrl]) : true;

  return (
    <div className="flex flex-col">
      {/* 1. Preview Gambar Utama */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 rounded-[5px] overflow-hidden border border-slate-200/90 shadow-card">
        {hasImages && !isCurrentFailed ? (
          <img
            src={currentImageUrl}
            alt={`${title} - Preview ${activeImageIndex + 1}`}
            onError={() => handleImageError(currentImageUrl)}
            className="w-full h-full object-cover object-center transition-opacity duration-300"
          />
        ) : (
          /* Fallback Visual Squad eFootball */
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
            <svg
              className="w-16 h-16 text-orange-400/80 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0H9.496m5.004 0a1.125 1.125 0 001.125-1.125V8.25m-7.254 6.375a1.125 1.125 0 01-1.125-1.125V8.25m7.254 0A2.25 2.25 0 0013.5 6h-3a2.25 2.25 0 00-2.25 2.25m7.254 0v-.625c0-.621-.504-1.125-1.125-1.125H9.871c-.621 0-1.125.504-1.125 1.125V8.25"
              />
            </svg>
            <span className="text-sm font-bold text-slate-200">
              Preview Squad eFootball
            </span>
            <span className="text-xs text-slate-400 font-mono mt-1">
              {code}
            </span>
          </div>
        )}

        {/* Badge Tier (Kiri Bawah Gambar) */}
        {tierLabel && (
          <div className="absolute bottom-0 left-0 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-tr-xl shadow-md uppercase tracking-wide">
            {tierLabel}
          </div>
        )}

        {/* Badge Kode Akun (Kanan Atas Gambar) */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-white/20 shadow-sm">
          {code}
        </div>
      </div>

      {/* 2. Baris Thumbnail Galeri (HANYA MUNCUL JIKA ADA GAMBAR TAMBAHAN / > 1 GAMBAR) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2 pt-1">
          {allImages.map((imgUrl, idx) => {
            const isActive = idx === activeImageIndex;
            const isFailed = Boolean(failedImages[imgUrl]);

            return (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Lihat gambar ke-${idx + 1}`}
                className={`relative w-20 sm:w-24 aspect-[16/9] rounded-xl overflow-hidden shrink-0 transition-all duration-200 bg-slate-900 focus:outline-none ${
                  isActive
                    ? 'ring-2 ring-orange-500 border-2 border-orange-500 shadow-md scale-105 opacity-100'
                    : 'border-2 border-slate-200/90 hover:border-slate-400 opacity-60 hover:opacity-100'
                }`}
              >
                {!isFailed ? (
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={() => handleImageError(imgUrl)}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
