'use client';

import { useEffect, useMemo } from 'react';

// Pilih foto + preview. File baru diunggah saat form disimpan, bukan saat dipilih.
export default function ImageField({ id, label, hint, multiple = false, files, onChange }) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function handlePick(e) {
    const picked = Array.from(e.target.files ?? []);
    onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));
    e.target.value = ''; // supaya file yang sama bisa dipilih ulang
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}

      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handlePick}
        className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-orange-600"
      />

      {previews.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {previews.map((src, i) => (
            <li key={src} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Pratinjau ${i + 1}`} className="h-24 w-36 rounded-md border border-slate-200 object-cover" />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                aria-label={`Hapus foto ${i + 1}`}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}