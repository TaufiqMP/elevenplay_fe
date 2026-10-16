import { supabase } from '../supabase'
import { request, toQuery, ApiError } from './client'

const BUCKET = 'account-images'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

//---------- AUTH ----------

//Login admin. Kalau akunnya bukan admin, otomatis dikeluarkan lagi
export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new ApiError(401, 'INVALID_LOGIN', 'Email atau password salah')

  if (data.user.app_metadata?.role !== 'admin') {
    await supabase.auth.signOut()
    throw new ApiError(403, 'FORBIDDEN', 'Akun ini bukan admin')
  }
  return data.user
}

export async function logoutAdmin() {
  await supabase.auth.signOut()
}

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