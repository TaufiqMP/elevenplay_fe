import { supabase } from '../supabase'
import { request, toQuery, ApiError } from './client'

const BUCKET = 'account-images'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

//---------- AUTH ----------

//Untuk menjaga halaman admin: true kalau sedang login sebagai admin
export async function isAdminLoggedIn() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.app_metadata?.role === 'admin'
}

async function getToken() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Silakan login terlebih dahulu')
  return token
}

//---------- E-KATALOG ----------

//Semua akun (draft, published, archived). status boleh dikosongkan
export async function getAdminAccounts({ page = 1, limit = 12, status } = {}) {
  const token = await getToken()
  return request(`/admin/accounts${toQuery({ page, limit, status })}`, { token })
}

//Detail akun admin berdasarkan id; bisa mengambil akun draft atau archived.
export async function getAdminAccount(id) {
  const token = await getToken()
  return request(`/admin/accounts/${encodeURIComponent(id)}`, { token })
}

//Tambah akun. Kode (EK-xxxx) dibuat otomatis oleh backend
export async function createAccount(body) {
  const token = await getToken()
  return request('/admin/accounts', { method: 'POST', body, token })
}

//Ubah sebagian field. id adalah angka id (bukan kode)
export async function updateAccount(id, body) {
  const token = await getToken()
  return request(`/admin/accounts/${id}`, { method: 'PATCH', body, token })
}

//Arsipkan akun (hilang dari publik, data tetap ada)
export async function archiveAccount(id) {
  const token = await getToken()
  return request(`/admin/accounts/${id}`, { method: 'DELETE', token })
}

//Hapus permanen, tidak bisa dikembalikan
export async function deleteAccountPermanently(id) {
  const token = await getToken()
  return request(`/admin/accounts/${id}?permanent=true`, { method: 'DELETE', token })
}

//---------- BERITA ----------

//Semua berita, termasuk draft dan arsip
export async function getAdminContents({ page = 1, limit = 12, status } = {}) {
  const token = await getToken()
  return request(`/admin/contents${toQuery({ page, limit, status })}`, { token })
}

//Detail berita admin berdasarkan id
export async function getAdminContent(id) {
  const token = await getToken()
  return request(`/admin/contents/${encodeURIComponent(id)}`, { token })
}

//Buat berita; slug dan penulis diisi oleh backend
export async function createContent(body) {
  const token = await getToken()
  return request('/admin/contents', { method: 'POST', body, token })
}

//Ubah sebagian field berita berdasarkan id
export async function updateContent(id, body) {
  const token = await getToken()
  return request(`/admin/contents/${encodeURIComponent(id)}`, { method: 'PATCH', body, token })
}

//Arsipkan berita
export async function archiveContent(id) {
  const token = await getToken()
  return request(`/admin/contents/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

//Hapus permanen berita
export async function deleteContentPermanently(id) {
  const token = await getToken()
  return request(`/admin/contents/${encodeURIComponent(id)}?permanent=true`, {
    method: 'DELETE',
    token,
  })
}

//Buat kategori berita
export async function createContentCategory(body) {
  const token = await getToken()
  return request('/admin/content-categories', { method: 'POST', body, token })
}

//Ubah nama kategori berita
export async function updateContentCategory(id, body) {
  const token = await getToken()
  return request(`/admin/content-categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
    token,
  })
}

//Hapus kategori berita
export async function deleteContentCategory(id) {
  const token = await getToken()
  return request(`/admin/content-categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  })
}

//---------- UPLOAD FOTO ----------

//Upload satu foto ke Supabase Storage, hasilnya URL publik
//Pakai URL itu untuk field main_image_url atau isi array gallery
export async function uploadAccountImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Format harus JPG, PNG, atau WebP')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Ukuran foto maksimal 5 MB')
  }

  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type })
  if (error) throw new ApiError(500, 'UPLOAD_FAILED', error.message)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}