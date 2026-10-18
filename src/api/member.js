import { supabase } from '../supabase'
import { ApiError } from './client'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const WHATSAPP_REGEX = /^(\+62|62|0)8[0-9]{8,12}$/

//Cek username masih bebas. Dipanggil saat kolom username selesai diisi
export async function isUsernameAvailable(username) {
  if (!USERNAME_REGEX.test(username)) return false

  const { data, error } = await supabase.rpc('is_username_available', { p_username: username })
  if (error) throw new ApiError(500, 'SERVER_ERROR', 'Gagal memeriksa username')
  return data
}

//Daftar member komunitas. Melempar ApiError dengan pesan yang siap ditampilkan
export async function registerMember({
  fullName, username, email, whatsapp = '', password, confirmPassword, acceptedTerms,
}) {
  if (!fullName?.trim()) throw new ApiError(422, 'VALIDATION_ERROR', 'Nama lengkap wajib diisi')
  if (!USERNAME_REGEX.test(username || '')) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Username 3-20 karakter, hanya huruf, angka, dan _')
  }
  if (!email?.trim()) throw new ApiError(422, 'VALIDATION_ERROR', 'Alamat email wajib diisi')

  const wa = whatsapp.replace(/[\s-]/g, '')
  if (wa && !WHATSAPP_REGEX.test(wa)) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Format nomor WhatsApp tidak valid')
  }

  if ((password || '').length < 8) throw new ApiError(422, 'VALIDATION_ERROR', 'Kata sandi minimal 8 karakter')
  if (password !== confirmPassword) throw new ApiError(422, 'VALIDATION_ERROR', 'Konfirmasi kata sandi tidak sama')
  if (!acceptedTerms) throw new ApiError(422, 'VALIDATION_ERROR', 'Setujui ketentuan layanan terlebih dahulu')

  if (!(await isUsernameAvailable(username))) {
    throw new ApiError(409, 'USERNAME_TAKEN', 'Username sudah dipakai')
  }

    const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
        emailRedirectTo: `${window.location.origin}/verifikasi`,
        data: { full_name: fullName.trim(), username, whatsapp: wa },
    },
    })

  if (error) {
    if (error.code === 'user_already_exists') {
      throw new ApiError(409, 'EMAIL_TAKEN', 'Email sudah terdaftar')
    }
    if (error.code === 'weak_password') {
      throw new ApiError(422, 'WEAK_PASSWORD', 'Kata sandi terlalu lemah')
    }
    if (error.code === 'over_email_send_rate_limit') {
      throw new ApiError(429, 'RATE_LIMIT', 'Terlalu banyak percobaan, coba lagi nanti')
    }
    throw new ApiError(500, 'REGISTER_FAILED', 'Pendaftaran gagal. Periksa data lalu coba lagi')
  }

  //Kalau konfirmasi email aktif, sesi belum ada sampai user mengklik link di emailnya
  return { user: data.user, needsEmailConfirmation: !data.session }
}

//Kirim ulang email konfirmasi
export async function resendConfirmationEmail(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/verifikasi` },
  })

  if (error) {
    if (error.code === 'over_email_send_rate_limit') {
      throw new ApiError(429, 'RATE_LIMIT', 'Terlalu banyak percobaan, coba lagi nanti')
    }
    throw new ApiError(500, 'RESEND_FAILED', 'Gagal mengirim ulang email')
  }
}

//Login untuk semua akun (member dan admin)
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.code === 'email_not_confirmed') {
      throw new ApiError(403, 'EMAIL_NOT_CONFIRMED', 'Email belum dikonfirmasi. Cek inbox atau folder spam')
    }
    if (error.status === 429) {
      throw new ApiError(429, 'RATE_LIMIT', 'Terlalu banyak percobaan, coba lagi nanti')
    }
    throw new ApiError(401, 'INVALID_LOGIN', 'Email atau kata sandi salah')
  }

  return { user: data.user, isAdmin: data.user.app_metadata?.role === 'admin' }
}