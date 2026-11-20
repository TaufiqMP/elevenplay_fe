'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getContentCategories } from '@/api/contents';
import PhotoPicker, { useObjectUrl } from '@/components/admin/katalog/photopicker';
import BeritaCard, { formatShortDate, makeExcerpt } from '@/components/beranda/beritacard';
import MarkdownEditor from '@/components/ui/markdowneditor';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

const MAX_GALLERY = 4;

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

function Label({ htmlFor, children, required = false, optional = false }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-900">
      {children}
      {required && <span className="text-red-600"> *</span>}
      {optional && <span className="ml-2 text-xs font-normal text-slate-500">Opsional</span>}
    </label>
  );
}

//ISO dari backend menjadi format input datetime-local (jam lokal)
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getFormValues(content) {
  return {
    title: content?.title ?? '',
    category_id: content?.category_id ? String(content.category_id) : '',
    status: content?.status ?? 'draft',
    published_at: toLocalInput(content?.published_at),
    body: content?.body ?? '',
  };
}

function getGalleryUrls(content) {
  if (!Array.isArray(content?.gallery)) return [];
  return content.gallery.filter(Boolean).slice(0, MAX_GALLERY);
}

export default function BeritaForm({ initialContent = null }) {
  const router = useRouter();
  const isEditing = Boolean(initialContent);
  const initialFormValues = getFormValues(initialContent);
  const initialGalleryUrls = getGalleryUrls(initialContent);
  const initialCoverUrl = initialContent?.cover_image_url ?? null;

  const [values, setValues] = useState(initialFormValues);
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [galleryFiles, setGalleryFiles] = useState(() => Array(MAX_GALLERY).fill(null));
  const [galleryUrls, setGalleryUrls] = useState(initialGalleryUrls);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  //Kategori untuk dropdown, plus form kecil "tambah kategori"
  const [categories, setCategories] = useState([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    getContentCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategoryError('Gagal memuat kategori.'));
  }, []);

  const hasChanges =
    JSON.stringify(values) !== JSON.stringify(initialFormValues) ||
    coverFile !== null ||
    coverUrl !== initialCoverUrl ||
    JSON.stringify(galleryUrls) !== JSON.stringify(initialGalleryUrls) ||
    galleryFiles.some(Boolean);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function addCategory() {
    const name = newCategory.trim();
    if (!name) {
      setCategoryError('Nama kategori wajib diisi.');
      return;
    }
    setSavingCategory(true);
    setCategoryError('');
    try {
      const api = await loadApi();
      const category = await api.createContentCategory({ name });
      setCategories((list) => [...list, category]);
      setValues((v) => ({ ...v, category_id: String(category.id) }));
      setNewCategory('');
      setAddingCategory(false);
    } catch (err) {
      setCategoryError(err.message || 'Gagal menambah kategori.');
    } finally {
      setSavingCategory(false);
    }
  }

  // finalStatus: 'draft' untuk tombol Draf, atau null untuk memakai pilihan Status
  async function save(finalStatus) {
    if (saving || (isEditing && !hasChanges && finalStatus !== 'draft')) return;
    const status = finalStatus ?? values.status;

    setError('');
    if (!values.title.trim()) {
      setError('Judul wajib diisi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (status === 'published' && !values.body.trim()) {
      setError('Isi berita wajib diisi sebelum ditayangkan.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const api = await loadApi();

      //Foto baru diunggah dulu, hasilnya URL publik
      const cover_image_url = coverFile ? await api.uploadContentImage(coverFile) : coverUrl;

      const gallery = [];
      for (let i = 0; i < MAX_GALLERY; i++) {
        if (galleryFiles[i]) gallery.push(await api.uploadContentImage(galleryFiles[i]));
        else if (galleryUrls[i]) gallery.push(galleryUrls[i]);
      }

      const body = {
        title: values.title.trim(),
        category_id: values.category_id,
        status,
        body: values.body,
        cover_image_url,
        gallery,
      };

      //Jadwal tayang hanya dikirim kalau diisi. Kosong = diisi otomatis saat pertama tayang
      if (values.published_at) {
        body.published_at = new Date(values.published_at).toISOString();
      }

      if (isEditing) {
        await api.updateContent(initialContent.id, body);
      } else {
        await api.createContent(body);
      }

      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan berita.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  //Data untuk preview kartu
  const categoryName = categories.find((c) => String(c.id) === values.category_id)?.name;
  let previewDate = '';
  if (values.published_at) previewDate = formatShortDate(new Date(values.published_at).toISOString());
  else if (values.status === 'published') previewDate = formatShortDate(new Date().toISOString());

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
            <Link href="/admin" className="hover:text-orange-600">Kelola Berita</Link>
            {' > '}
            <span className="text-orange-500">{isEditing ? 'Ubah Berita' : 'Tambah Berita'}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-5xl">
            {isEditing ? 'Ubah Berita Beranda' : 'Input Berita Beranda'}
          </h1>
          <p className="mt-1 text-xl text-slate-800">
            {isEditing ? 'Perbarui isi berita dan lihat preview-nya' : 'Isi data berita dan lihat preview-nya'}
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
          <Card title="1. Foto Berita">
            <p className="mb-3 text-sm text-slate-600">
              Foto utama tampil sebagai cover di kartu beranda dan di atas halaman detail.
            </p>
            <PhotoPicker
              mainFile={coverFile}
              onMainChange={setCoverFile}
              mainImageUrl={coverUrl}
              onMainImageRemove={() => setCoverUrl(null)}
              extraFiles={galleryFiles}
              onExtraChange={setGalleryFiles}
              extraImageUrls={galleryUrls}
              onExtraImageUrlsChange={setGalleryUrls}
            />
          </Card>

          <Card title="2. Info Berita">
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Label htmlFor="field-title" required>Judul</Label>
                <input
                  id="field-title"
                  type="text"
                  required
                  value={values.title}
                  onChange={set('title')}
                  placeholder="Jadwal Elevenplay Championship Season 4 - Registrasi Dibuka"
                  className={controlClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="field-category" optional>Kategori</Label>
                  {!addingCategory && (
                    <button
                      type="button"
                      onClick={() => setAddingCategory(true)}
                      className="text-xs font-bold text-orange-600 hover:underline"
                    >
                      + Tambah
                    </button>
                  )}
                </div>
                <Select id="field-category" value={values.category_id} onChange={set('category_id')} className={controlClass}>
                  <option value="">Pilih...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </Select>

                {addingCategory && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      aria-label="Nama kategori baru"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        //Enter di sini menambah kategori, bukan menyimpan form berita
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      placeholder="Update Patch"
                      className={`${controlClass} mt-0`}
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      disabled={savingCategory}
                      className="shrink-0 rounded-sm bg-orange-500 px-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                      {savingCategory ? '...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCategory(false);
                        setNewCategory('');
                        setCategoryError('');
                      }}
                      className="shrink-0 px-1 text-sm text-slate-600 hover:text-slate-900"
                    >
                      Batal
                    </button>
                  </div>
                )}
                {categoryError && <p className="mt-1 text-xs text-red-600">{categoryError}</p>}
              </div>

              <div>
                <Label htmlFor="field-status">Status</Label>
                <Select id="field-status" value={values.status} onChange={set('status')} className={controlClass}>
                  <option value="draft">Draf</option>
                  <option value="published">Tayang</option>
                  {values.status === 'archived' && <option value="archived">Arsip</option>}
                </Select>
              </div>

              <div>
                <Label htmlFor="field-published-at" optional>Jadwal Tayang</Label>
                <input
                  id="field-published-at"
                  type="datetime-local"
                  value={values.published_at}
                  onChange={set('published_at')}
                  className={controlClass}
                />
              </div>

              <p className="text-xs text-slate-500 sm:col-span-3">
                Jadwal tayang kosong = berita tayang saat status diubah ke Tayang. Kalau diisi waktu yang akan datang,
                berita baru muncul di beranda pada waktu itu.
              </p>
            </div>
          </Card>

          <Card title="3. Isi Berita">
            <Label htmlFor="field-body">Isi</Label>
            <div className="mt-1">
              <MarkdownEditor
                id="field-body"
                value={values.body}
                onChange={(text) => setValues((v) => ({ ...v, body: text }))}
                placeholder="Elevenplay Championship Season 4 kembali hadir..."
                uploadImage={async (file) => (await loadApi()).uploadContentImage(file)}
              />
            </div>
          </Card>
        </div>

        <aside className="rounded-lg border border-slate-300 bg-white p-6 sm:p-8 lg:sticky lg:top-36">
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Preview Kartu</h2>
          <PreviewCard
            coverFile={coverFile}
            coverUrl={coverUrl}
            category={categoryName}
            date={previewDate}
            author={initialContent?.author}
            title={values.title}
            excerpt={makeExcerpt(values.body)}
          />
        </aside>
      </div>
    </form>
  );
}

//Preview memakai kartu beranda yang sama, foto diambil dari file yang baru dipilih atau URL lama
function PreviewCard({ coverFile, coverUrl, ...props }) {
  const fileUrl = useObjectUrl(coverFile);
  return <BeritaCard imageUrl={fileUrl || coverUrl} {...props} />;
}
