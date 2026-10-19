'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SECTIONS, initialValues, toPayload } from './accountfields';
import PhotoPicker from './photopicker';
import CardPreview from './cardpreview';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const controlClass =
  'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300';

function Card({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-300 bg-white p-6 sm:p-8">
      <h2 className="mb-5 text-2xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ f, value, onChange }) {
  const id = `field-${f.key}`;
  return (
    <div className={f.span ?? ''}>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-900">
        {f.label}
        {f.required && <span className="text-red-600"> *</span>}
        {f.optional && <span className="ml-2 text-xs font-normal text-slate-500">Opsional</span>}
      </label>
      {f.type === 'textarea' ? (
        <textarea id={id} rows={f.rows ?? 4} value={value} onChange={onChange} placeholder={f.placeholder} className={controlClass} />
      ) : f.type === 'select' ? (
        <select id={id} value={value} onChange={onChange} className={controlClass}>
          {!f.noEmpty && <option value="">Pilih...</option>}
          {f.options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
      ) : (
        <input
          id={id}
          type={f.type ?? 'text'}
          min={f.min}
          inputMode={f.type === 'number' ? 'numeric' : undefined}
          required={f.required}
          value={value}
          onChange={onChange}
          placeholder={f.placeholder}
          className={controlClass}
        />
      )}
    </div>
  );
}

export default function AccountForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [mainFile, setMainFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  // finalStatus: 'draft' untuk tombol Draf, atau null untuk memakai "Status tampil"
  async function save(finalStatus) {
    if (saving) return;
    setError('');
    if (!values.title.trim()) {
      setError('Judul wajib diisi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      const api = await loadApi();

      // 1) unggah foto dulu, hasilnya URL publik
      const main_image_url = mainFile ? await api.uploadAccountImage(mainFile) : undefined;
      const gallery = await Promise.all(extraFiles.map((f) => api.uploadAccountImage(f)));

      // 2) simpan akun (kode EK-xxxx dibuat otomatis oleh backend)
      await api.createAccount({
        ...toPayload(values),
        ...(finalStatus ? { status: finalStatus } : {}),
        main_image_url,
        gallery: gallery.length ? gallery : undefined,
      });

      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan akun.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  const btn = 'rounded-sm px-8 py-2.5 font-semibold text-white disabled:opacity-60';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(null);
      }}
      noValidate
    >
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            aria-label="Kembali"
            className="text-slate-800 hover:text-orange-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <nav aria-label="Breadcrumb" className="mt-1 text-lg text-slate-500">
            <Link href="/admin" className="hover:text-orange-600">Kelola E-Katalog</Link>
            {' > '}
            <span className="text-orange-500">Tambah Katalog</span>
          </nav>
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">Input Akun E-Katalog</h1>
          <p className="mt-1 text-xl text-slate-800">Isi data akun dan lihat preview-nya</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={() => router.push('/admin')} disabled={saving} className={`${btn} bg-red-500 hover:bg-red-600`}>
            Batal
          </button>
          <button type="button" onClick={() => save('draft')} disabled={saving} className={`${btn} bg-neutral-600 hover:bg-neutral-700`}>
            Draf
          </button>
          <button type="submit" disabled={saving} className={`${btn} bg-emerald-500 hover:bg-emerald-600`}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Isi: form di kiri, preview di kanan */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-6">
          <Card title="1. Foto Akun">
            <PhotoPicker
              mainFile={mainFile}
              onMainChange={setMainFile}
              extraFiles={extraFiles}
              onExtraChange={setExtraFiles}
            />
          </Card>

          {SECTIONS.map((section) => (
            <Card key={section.id} title={section.title}>
              <div className={`grid gap-x-6 gap-y-5 ${section.grid}`}>
                {section.fields.map((f) => (
                  <Field key={f.key} f={f} value={values[f.key]} onChange={set(f.key)} />
                ))}
              </div>
            </Card>
          ))}
        </div>

        <aside className="rounded-lg border border-slate-300 bg-white p-6 sm:p-8 lg:sticky lg:top-36">
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Preview Kartu</h2>
          <CardPreview
            title={values.title}
            subtitle={values.subtitle}
            tierLabel={values.tier_label}
            mainFile={mainFile}
          />
        </aside>
      </div>
    </form>
  );
}