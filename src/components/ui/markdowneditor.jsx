'use client';

import { useRef, useState } from 'react';
import Markdown from '@/components/forum/markdown';

const ACCEPT = 'image/jpeg,image/png,image/webp';

const controlClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100';

//Editor Markdown dengan tombol format dan upload gambar. Pratinjau bisa dibuka dari editor ini.
//uploadImage(file) harus mengembalikan URL gambar yang sudah diunggah
export default function MarkdownEditor({ id, value, onChange, rows = 14, placeholder, uploadImage }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  //Bungkus teks yang dipilih (atau teks contoh) dengan penanda Markdown, lalu letakkan kursor di dalamnya
  function wrap(before, after = '', sample = '') {
    const el = ref.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || sample;

    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  //Tambah awalan di setiap baris yang dipilih, mis. "- " untuk daftar
  function prefixLines(prefix) {
    const el = ref.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const block = value.slice(lineStart, end || start) || '';
    const lines = (block || 'Item daftar').split('\n').map((line) => `${prefix}${line}`).join('\n');

    onChange(value.slice(0, lineStart) + lines + value.slice(end));
    requestAnimationFrame(() => el.focus());
  }

  //Sisipkan gambar di posisi kursor sebagai ![keterangan](url)
  function insertAtCursor(text) {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => el?.focus());
  }

  async function pickImage(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadImage) return;

    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImage(file);
      insertAtCursor(`\n\n![Gambar](${url})\n\n`);
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setUploading(false);
    }
  }

  const tool = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-orange-400 hover:text-orange-600 disabled:opacity-40';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => wrap('**', '**', 'teks tebal')} disabled={showPreview} className={tool} title="Tebal">B</button>
        <button type="button" onClick={() => wrap('*', '*', 'teks miring')} disabled={showPreview} className={`${tool} italic`} title="Miring">I</button>
        <button type="button" onClick={() => wrap('## ', '', 'Judul')} disabled={showPreview} className={tool} title="Judul">Judul</button>
        <button type="button" onClick={() => prefixLines('- ')} disabled={showPreview} className={tool} title="Daftar">Daftar</button>
        <button type="button" onClick={() => wrap('[', '](https://)', 'teks link')} disabled={showPreview} className={tool} title="Link">Link</button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={showPreview || uploading || !uploadImage}
          className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-sm font-bold text-white shadow-md shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
          title="Sisipkan gambar"
        >
          {uploading ? 'Mengunggah...' : '+ Gambar'}
        </button>
        <input ref={fileRef} type="file" accept={ACCEPT} onChange={pickImage} className="hidden" aria-label="Pilih gambar" />

        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="ml-auto rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700 transition-all hover:bg-orange-100"
        >
          {showPreview ? 'Kembali menulis' : 'Pratinjau'}
        </button>
      </div>

      {uploadError && (
        <p role="alert" className="mt-2 text-sm text-red-700">{uploadError}</p>
      )}

      {showPreview ? (
        <div className="mt-3 min-h-40 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-slate-400">Belum ada isi.</p>}
        </div>
      ) : (
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${controlClass} font-mono text-[13px] leading-relaxed`}
        />
      )}

      <p className="mt-2 text-xs text-slate-500">
        Pisahkan paragraf dengan baris kosong. Pilih teks lalu klik tombol untuk memformatnya.
      </p>
    </div>
  );
}
