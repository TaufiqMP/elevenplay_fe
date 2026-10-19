'use client';

import { useEffect, useMemo, useRef } from 'react';

export const MAX_EXTRA = 4;
const ACCEPT = 'image/jpeg,image/png,image/webp';

// URL sementara untuk preview file yang belum diunggah
export function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  return url;
}

function RemoveButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red-600 text-sm font-bold text-white hover:bg-red-700"
    >
      ×
    </button>
  );
}

function MainDropzone({ file, imageUrl, onChange, onRemoveImage }) {
  const inputRef = useRef(null);
  const url = useObjectUrl(file);
  const pick = (f) => f && onChange(f);

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-label="Pilih foto utama"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), inputRef.current?.click())}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
        className="grid h-56 cursor-pointer place-items-center overflow-hidden rounded-md border border-dashed border-slate-400 bg-neutral-100 text-slate-800 hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 sm:h-64"
      >
        {url || imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url || imageUrl} alt="Pratinjau foto utama" className="h-full w-full object-cover" />
        ) : (
          <span>Tarik file kesini atau klik untuk pilih</span>
        )}
      </div>
      {(url || imageUrl) && (
        <RemoveButton
          onClick={() => {
            onChange(null);
            onRemoveImage();
          }}
          label="Hapus foto utama"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function ThumbSlot({ index, file, imageUrl, onPick, onRemove }) {
  const inputRef = useRef(null);
  const url = useObjectUrl(file);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={file ? `Ganti foto ${index + 1}` : `Tambah foto ${index + 1}`}
        className="grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-md border border-dashed border-slate-400 bg-neutral-100 text-xs text-slate-800 hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
      >
        {url || imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url || imageUrl} alt={`Pratinjau foto ${index + 1}`} className="h-full w-full object-cover" />
        ) : (
          `+ Foto ${index + 1}`
        )}
      </button>
      {(url || imageUrl) && <RemoveButton onClick={onRemove} label={`Hapus foto ${index + 1}`} />}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function PhotoPicker({
  mainFile,
  onMainChange,
  mainImageUrl,
  onMainImageRemove,
  extraFiles,
  onExtraChange,
  extraImageUrls = [],
  onExtraImageUrlsChange,
}) {
  function pickExtra(file, i) {
    const next = Array.from({ length: MAX_EXTRA }, (_, index) => extraFiles[index] ?? null);
    next[i] = file;
    onExtraChange(next);
  }

  function removeExtra(i) {
    const nextFiles = Array.from({ length: MAX_EXTRA }, (_, index) => extraFiles[index] ?? null);
    const nextUrls = Array.from({ length: MAX_EXTRA }, (_, index) => extraImageUrls[index] ?? null);
    nextFiles.splice(i, 1);
    nextFiles.push(null);
    nextUrls.splice(i, 1);
    nextUrls.push(null);
    onExtraChange(nextFiles);
    onExtraImageUrlsChange(nextUrls);
  }

  return (
    <div>
      <MainDropzone
        file={mainFile}
        imageUrl={mainImageUrl}
        onChange={onMainChange}
        onRemoveImage={onMainImageRemove}
      />
      <p className="mt-6 text-sm font-semibold text-slate-900">
        Foto tambahan <span className="ml-1 text-xs font-normal">(maks. {MAX_EXTRA}, tampil sebagai thumbnail)</span>
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: MAX_EXTRA }).map((_, i) => (
          <ThumbSlot
            key={i}
            index={i}
            file={extraFiles[i] ?? null}
            imageUrl={extraImageUrls[i] ?? null}
            onPick={(f) => pickExtra(f, i)}
            onRemove={() => removeExtra(i)}
          />
        ))}
      </div>
    </div>
  );
}