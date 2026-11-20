'use client';

import { useState } from 'react';
import Select from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SECTIONS, initialValues, toPayload, toUpdatePayload } from './accountfields';
import PhotoPicker from './photopicker';
import CardPreview from './cardpreview';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const controlClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100';

function Card({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-300 bg-white p-6 sm:p-8">
      <h2 className="mb-5 text-2xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ f, value, onChange, readOnly = false }) {
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
        <Select id={id} value={value} onChange={onChange} className={controlClass}>
          {!f.noEmpty && <option value="">Pilih...</option>}
          {f.key === 'status' && value === 'archived' && (
            <option value="archived">Arsip</option>
          )}
          {f.options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </Select>
      ) : (
        <input
          id={id}
          type={f.type ?? 'text'}
          min={f.min}
          inputMode={f.type === 'number' ? 'numeric' : undefined}
          required={f.required}
          readOnly={readOnly}
          value={value}
          onChange={onChange}
          placeholder={f.placeholder}
          className={`${controlClass} ${readOnly ? 'bg-slate-100 text-slate-500' : ''}`}
        />
      )}
    </div>
  );
}

function getFormValues(account) {
  const values = initialValues();
  if (!account) return values;

  for (const section of SECTIONS) {
    for (const field of section.fields) {
      if (field.key === 'edition_code') {
        values[field.key] = account.edition_code ?? account.code ?? '';
        continue;
      }
      const value = account[field.key];
      if (value != null) {
        values[field.key] = field.type === 'date' ? String(value).slice(0, 10) : String(value);
      }
    }
  }
  return values;
}

function getGalleryUrls(account) {
  if (!Array.isArray(account?.gallery)) return [];
  return account.gallery
    .map((image) => (typeof image === 'string' ? image : image?.url ?? image?.src ?? null))
    .filter(Boolean)
    .slice(0, 4);
}

export default function AccountForm({ initialAccount = null }) {
  const router = useRouter();
  const isEditing = Boolean(initialAccount);
  const initialFormValues = getFormValues(initialAccount);
  const initialGalleryUrls = getGalleryUrls(initialAccount);
  const [values, setValues] = useState(initialFormValues);
  const [mainFile, setMainFile] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState(initialAccount?.main_image_url ?? null);
  const [extraFiles, setExtraFiles] = useState(() => Array(4).fill(null));
  const [extraImageUrls, setExtraImageUrls] = useState(initialGalleryUrls);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasChanges =
    JSON.stringify(values) !== JSON.stringify(initialFormValues) ||
    mainFile !== null ||
    mainImageUrl !== (initialAccount?.main_image_url ?? null) ||
    JSON.stringify(extraImageUrls) !== JSON.stringify(initialGalleryUrls) ||
    extraFiles.some(Boolean);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  // finalStatus: 'draft' untuk tombol Draf, atau null untuk memakai "Status tampil"
  async function save(finalStatus) {
    if (saving || (isEditing && !hasChanges && finalStatus !== 'draft')) return;
    setError('');
    if (!values.title.trim()) {
      setError('Judul wajib diisi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!isEditing && !values.edition_code.trim()) {
      setError('Kode akun wajib diisi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      const api = await loadApi();

      const main_image_url = mainFile
        ? await api.uploadAccountImage(mainFile)
        : isEditing
          ? mainImageUrl
          : undefined;
      const gallery = await Promise.all(
        Array.from({ length: 4 }, async (_, index) => {
          if (extraFiles[index]) return api.uploadAccountImage(extraFiles[index]);
          return extraImageUrls[index] ?? null;
        }),
      );
      const savedGallery = gallery.filter(Boolean);

      if (isEditing) {
        await api.updateAccount(initialAccount.id, {
          ...toUpdatePayload({ ...values, status: finalStatus ?? values.status }),
          main_image_url,
          gallery: savedGallery,
        });
      } else {
        await api.createAccount({
          ...toPayload(values),
          ...(finalStatus ? { status: finalStatus } : {}),
          main_image_url,
          gallery: savedGallery.length ? savedGallery : undefined,
        });
      }

      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan akun.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  const btn = 'rounded-lg px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
  const updateDisabled = saving || (isEditing && !hasChanges);

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
            <span className="text-orange-500">{isEditing ? 'Ubah Katalog' : 'Tambah Katalog'}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-5xl">
            {isEditing ? 'Ubah Akun E-Katalog' : 'Input Akun E-Katalog'}
          </h1>
          <p className="mt-1 text-xl text-slate-800">
            {isEditing ? 'Perbarui data akun dan lihat preview-nya' : 'Isi data akun dan lihat preview-nya'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={() => router.push('/admin')} disabled={saving} className={`${btn} bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/30 hover:from-rose-600 hover:to-red-700`}>
            Batal
          </button>
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saving || (isEditing && !hasChanges && values.status === 'draft')}
            className={`${btn} bg-gradient-to-r from-slate-500 to-slate-700 shadow-slate-500/30 hover:from-slate-600 hover:to-slate-800`}
          >
            Draf
          </button>
          <button type="submit" disabled={updateDisabled} className={`${btn} bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600`}>
            {saving ? (isEditing ? 'Memperbarui...' : 'Menyimpan...') : isEditing ? 'Update' : 'Simpan'}
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
              mainImageUrl={mainImageUrl}
              onMainImageRemove={() => setMainImageUrl(null)}
              extraFiles={extraFiles}
              onExtraChange={setExtraFiles}
              extraImageUrls={extraImageUrls}
              onExtraImageUrlsChange={setExtraImageUrls}
            />
          </Card>

          {SECTIONS.map((section) => (
            <Card key={section.id} title={section.title}>
              <div className={`grid gap-x-6 gap-y-5 ${section.grid}`}>
                {section.fields.map((f) => (
                  <Field
                    key={f.key}
                    f={f}
                    value={values[f.key]}
                    onChange={set(f.key)}
                    readOnly={isEditing && f.key === 'edition_code'}
                  />
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
            mainImageUrl={mainImageUrl}
          />
        </aside>
      </div>
    </form>
  );
}