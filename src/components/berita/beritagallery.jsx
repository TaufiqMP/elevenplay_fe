'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

//Gambar besar di atas, thumbnail di bawah. Klik thumbnail untuk menampilkannya di gambar besar
export default function BeritaGallery({ coverUrl, gallery = [], title }) {
  const images = [];
  if (coverUrl) images.push(coverUrl);
  for (const url of gallery ?? []) {
    if (url && !images.includes(url)) images.push(url);
  }

  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 sm:aspect-[16/7]">
        <img src={images[activeIndex]} alt={title} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-12">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Lihat foto ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={`aspect-[16/11] overflow-hidden transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                index === activeIndex ? 'ring-2 ring-orange-500' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
