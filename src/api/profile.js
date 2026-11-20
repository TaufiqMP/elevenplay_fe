import { supabase } from '../supabase'
import { request, ApiError } from './client'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const WHATSAPP_REGEX = /^(\+62|62|0)8[0-9]{8,12}$/

//Token dari sesi login
async function getToken() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Silakan login terlebih dahulu')
  return token
}

//Data profil sendiri: nama lengkap, username, nomor WhatsApp
export async function getMyProfile() {
  const token = await getToken()
  return request('/profile', { token })
}

//Ubah nama lengkap, username, dan/atau nomor WhatsApp
//Field yang tidak dikirim tidak berubah
export async function updateMyProfile({ fullName, username, whatsapp }) {
  const body = {}

  if (fullName !== undefined) body.full_name = fullName.trim()
  if (username !== undefined) {
    if (!USERNAME_REGEX.test(username.trim())) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Username 3-20 karakter, hanya huruf, angka, dan _')
    }
    body.username = username.trim()
  }
  if (whatsapp !== undefined) {
    const wa = whatsapp.replace(/[\s-]/g, '')
    if (wa && !WHATSAPP_REGEX.test(wa)) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Format nomor WhatsApp tidak valid')
    }
    body.whatsapp = wa
  }

  const token = await getToken()
  const profile = await request('/profile', { method: 'PATCH', body, token })

  //Metadata di sesi browser ikut diperbarui supaya navbar langsung menampilkan data baru
  await supabase.auth.refreshSession()
  return profile
}

//Ganti email. Supabase mengirim link konfirmasi ke email baru
export async function changeEmail(newEmail) {
  const email = newEmail.trim()
  if (!email) throw new ApiError(422, 'VALIDATION_ERROR', 'Email baru wajib diisi')

  const { error } = await supabase.auth.updateUser({ email })
  if (error) {
    if (error.code === 'email_exists') throw new ApiError(409, 'EMAIL_TAKEN', 'Email sudah dipakai akun lain')
    if (error.code === 'over_email_send_rate_limit') {
      throw new ApiError(429, 'RATE_LIMIT', 'Terlalu banyak percobaan, coba lagi nanti')
    }
    throw new ApiError(422, 'EMAIL_FAILED', 'Gagal mengganti email. Periksa alamatnya lalu coba lagi')
  }
}

//Ganti password. Password lama diperiksa dulu dengan login ulang
export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  if (newPassword.length < 8) throw new ApiError(422, 'VALIDATION_ERROR', 'Kata sandi baru minimal 8 karakter')
  if (newPassword !== confirmPassword) throw new ApiError(422, 'VALIDATION_ERROR', 'Konfirmasi kata sandi tidak sama')
  if (newPassword === currentPassword) throw new ApiError(422, 'VALIDATION_ERROR', 'Kata sandi baru harus berbeda')

  const { data } = await supabase.auth.getSession()
  const email = data.session?.user?.email
  if (!email) throw new ApiError(401, 'UNAUTHORIZED', 'Silakan login terlebih dahulu')

  const { error: checkError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
  if (checkError) throw new ApiError(401, 'WRONG_PASSWORD', 'Kata sandi lama salah')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    if (error.code === 'weak_password') throw new ApiError(422, 'WEAK_PASSWORD', 'Kata sandi terlalu lemah')
    throw new ApiError(500, 'PASSWORD_FAILED', 'Gagal mengganti kata sandi')
  }
}
