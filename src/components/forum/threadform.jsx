'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createForumThread, getForumCategories, updateForumThread } from '@/api/forum';
import MarkdownEditor from '@/components/ui/markdowneditor';
import { useMember } from './usemember';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadAdminApi = () => import('@/api/admin');

const MAX_IMAGES = 4;

const controlClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-orange-300 hover:bg-white focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100';

//Form thread baru (thread kosong) atau ubah thread milik sendiri
export default function ThreadForm({ thread = null }) {
  const router = useRouter();
  const { ready, user } = useMember();
  const isEditing = Boolean(thread);

  const [categories, setCategories] = useState([]);
  const [values, setValues] = useState(() => ({
    title: thread?.title ?? '',
    category_id: thread?.category_id ? String(thread.category_id) : '',
    tags: (thread?.tags ?? []).join(', '),
    body: thread?.body ?? '',
  }));
  const [imageUrls, setImageUrls] = useState(thread?.images ?? []);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  //Halaman ini hanya untuk member yang sudah login
  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  useEffect(() => {
    getForumCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  function pickFiles(e) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const room = MAX_IMAGES - imageUrls.length - newFiles.length;
    setNewFiles((list) => [...list, ...picked.slice(0, Math.max(room, 0))]);
  }

  // status: 'draft' atau 'published'
  async function save(status) {
    if (saving) return;
    setError('');

    const title = values.title.trim();
    if (!title) {
      setError('Judul wajib diisi.');
      return;
    }
    if (status === 'published' && !values.body.trim()) {
      setError('Isi thread wajib diisi sebelum diterbitkan.');
      return;
    }

    setSaving(true);
    try {
      //Foto baru diunggah dulu, hasilnya URL publik
      const api = await loadAdminApi();
      const uploaded = [];
      for (const file of newFiles) {
        uploaded.push(await api.uploadAccountImage(file, 'forum'));
      }

      const payload = {
        title,
        body: values.body,
        category_id: values.category_id || null,
        tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        images: [...imageUrls, ...uploaded],
        status,
      };

      const saved = isEditing
        ? await updateForumThread(thread.id, payload)
        : await createForumThread(payload);

      router.push(status === 'published' ? `/forum/${saved.slug}` : '/forum/saya');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan thread.');
      setSaving(false);
    }
  }

  if (!ready || !user) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600" aria-busy="true">Memeriksa login...</div>;
  }

  const btn = 'rounded-lg px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save('published');
      }}
      noValidate
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6"
    >
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/forum" className="hover:text-orange-600">Forum</Link>
        {' > '}
        <span className="text-orange-500">{isEditing ? 'Ubah Thread' : 'Thread Baru'}</span>
      </nav>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {isEditing ? 'Ubah Thread' : 'Buat Thread Baru'}
        </h1>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => router.push('/forum/saya')} disabled={saving} className={`${btn} bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/30 hover:from-rose-600 hover:to-red-700`}>
            Batal
          </button>
          <button type="button" onClick={() => save('draft')} disabled={saving} className={`${btn} bg-gradient-to-r from-slate-500 to-slate-700 shadow-slate-500/30 hover:from-slate-600 hover:to-slate-800`}>
            Simpan Draf
          </button>
          <button type="submit" disabled={saving} className={`${btn} bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600`}>
            {saving ? 'Menyimpan...' : 'Terbitkan'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-6 rounded-lg border border-slate-300 bg-white p-6 sm:p-8">
        <div>
          <label htmlFor="thread-title" className="block text-sm font-semibold text-slate-900">
            Judul <span className="text-red-600">*</span>
          </label>
          <input id="thread-title" type="text" maxLength={150} value={values.title} onChange={set('title')} placeholder="Strategi Double AMF Hole Player..." className={controlClass} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="thread-category" className="block text-sm font-semibold text-slate-900">Kategori</label>
            <Select id="thread-category" value={values.category_id} onChange={set('category_id')} className={controlClass}>
              <option value="">Tanpa kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="thread-tags" className="block text-sm font-semibold text-slate-900">
              Tag <span className="ml-2 text-xs font-normal text-slate-500">pisahkan dengan koma, maks. 5</span>
            </label>
            <input id="thread-tags" type="text" value={values.tags} onChange={set('tags')} placeholder="taktik, squad" className={controlClass} />
          </div>
        </div>

        <div>
          <label htmlFor="thread-body" className="block text-sm font-semibold text-slate-900">Isi Thread</label>
          <div className="mt-1">
            <MarkdownEditor
              id="thread-body"
              value={values.body}
              onChange={(text) => setValues((v) => ({ ...v, body: text }))}
              placeholder="Tulis isi thread..."
              uploadImage={async (file) => (await loadAdminApi()).uploadAccountImage(file, 'forum')}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Gambar <span className="ml-2 text-xs font-normal text-slate-500">maks. {MAX_IMAGES}, JPG/PNG/WebP, 5 MB</span>
          </p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {imageUrls.map((url, i) => (
              <li key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Gambar ${i + 1}`} className="h-24 w-36 rounded-md border border-slate-200 object-cover" />
                <button type="button" onClick={() => setImageUrls((list) => list.filter((_, idx) => idx !== i))} aria-label={`Hapus gambar ${i + 1}`} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
                  ×
                </button>
              </li>
            ))}
            {newFiles.map((file, i) => (
              <li key={`${file.name}-${i}`} className="relative rounded-md border border-dashed border-orange-400 bg-orange-50 px-3 py-2 text-sm text-slate-700">
                {file.name}
                <button type="button" onClick={() => setNewFiles((list) => list.filter((_, idx) => idx !== i))} aria-label={`Batalkan ${file.name}`} className="ml-2 font-bold text-red-600">
                  ×
                </button>
              </li>
            ))}
          </ul>
          {imageUrls.length + newFiles.length < MAX_IMAGES && (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={pickFiles}
              aria-label="Pilih gambar"
              className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-orange-600"
            />
          )}
        </div>
      </div>
    </form>
  );
}
