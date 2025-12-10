export interface AuthResponse {
  message: string
  token?: string
  user?: {
    id: number
    email: string
    role?: UserRole
  }
}

export type UserRole = 'SISWA' | 'ADMIN' | 'GURU_BK' | 'KEPALA_SEKOLAH'
export type EligibilityStatus = 'MENUNGGU_BK' | 'MENUNGGU_KEPSEK' | 'ELIGIBLE' | 'TIDAK_ELIGIBLE'

export type HomeRole = 'PUBLIC' | UserRole

export interface HomeContent {
  role: HomeRole
  title: string
  subtitle: string
}

export interface PendaftaranItem {
  id: number
  nomorPendaftaran?: string
  email: string
  nama?: string
  prodi1?: string
  prodi2?: string
  status: 'MENUNGGU' | 'DITERIMA' | 'DITOLAK'
  tanggal: string
  rataRata?: number
  dikirimKeKepsek?: boolean
  kepsekStatus?: 'BELUM_DITINJAU' | 'DISETUJUI' | 'DITOLAK' | null
  kepsekAlasan?: string | null
  kabupaten?: string
  provinsi?: string
  sekolah?: string
}

export async function apiCekPengumuman(nomor: string, tglLahir: string): Promise<PendaftaranItem> {
  const params = new URLSearchParams({ nomor, tglLahir })
  const res = await fetch(`${API_BASE_URL}/pendaftaran/cek?${params.toString()}`)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengecek pengumuman')
  }
  return json.data as PendaftaranItem
}

export interface SiswaProfil {
  nama: string
  nisn: string
  sekolah: string
  tempatLahir?: string | null
  tanggalLahir?: string | null
  npsn?: string | null
  namaOrangTua?: string | null
  alamat?: string | null
  kabupaten?: string | null
  provinsi?: string | null
}

export interface NilaiRaporApiItem {
  id: number
  semester: number
  mataPelajaran: string
  nilai: number
}

export interface PrestasiApiItem {
  id: number
  nama: string
  tingkat?: string
  tahun?: number
}

export interface SimulasiResponse {
  skor: number
  kategori: 'SANGAT_TINGGI' | 'TINGGI' | 'CUKUP' | 'KURANG'
}

const API_BASE_URL = 'http://localhost:4000'

// --- Home (Beranda Dinamis) ---
export async function apiGetHomeContent(role: HomeRole): Promise<HomeContent> {
  const res = await fetch(`${API_BASE_URL}/home/content?role=${encodeURIComponent(role)}`)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengambil konten beranda')
  }
  return json.data as HomeContent
}

export async function apiSaveHomeContent(payload: HomeContent): Promise<HomeContent> {
  const res = await fetch(`${API_BASE_URL}/home/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal menyimpan konten beranda')
  }
  return json.data as HomeContent
}

// --- Auth ---
export async function apiRegister(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Registrasi gagal')
  return json
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Login gagal')
  return json
}

// --- Profil ---
export async function apiGetProfilSiswa(email: string): Promise<SiswaProfil | null> {
  const res = await fetch(`${API_BASE_URL}/profil/siswa?email=${encodeURIComponent(email)}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil profil siswa')
  return json.data
}

export async function apiSimpanProfilSiswa(data: { email: string } & Partial<SiswaProfil>): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/profil/siswa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.message || 'Gagal menyimpan profil')
  }
}

// --- Nilai & Prestasi ---
export async function apiGetNilai(email: string): Promise<NilaiRaporApiItem[]> {
  const res = await fetch(`${API_BASE_URL}/profil/nilai?email=${encodeURIComponent(email)}`)
  const json = await res.json()
  return json.data || []
}

export async function apiTambahNilai(
  email: string,
  semester: number,
  mataPelajaran: string,
  nilai: number,
): Promise<NilaiRaporApiItem> {
  const res = await fetch(`${API_BASE_URL}/profil/nilai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, semester, mataPelajaran, nilai }),
  })
  const json = await res.json()
  return json.data
}

export async function apiUpdateNilai(
  id: number,
  data: { semester: number; mataPelajaran: string; nilai: number },
): Promise<NilaiRaporApiItem> {
  const res = await fetch(`${API_BASE_URL}/profil/nilai/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  return json.data
}

export async function apiDeleteNilaiBySemester(email: string, semester: number): Promise<void> {
  await fetch(`${API_BASE_URL}/profil/nilai/semester`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, semester }),
  })
}

export async function apiGetPrestasi(email: string): Promise<PrestasiApiItem[]> {
  const res = await fetch(`${API_BASE_URL}/profil/prestasi?email=${encodeURIComponent(email)}`)
  const json = await res.json()
  return json.data || []
}

export async function apiTambahPrestasi(
  email: string,
  nama: string,
  tingkat?: string,
  tahun?: number,
): Promise<PrestasiApiItem> {
  const res = await fetch(`${API_BASE_URL}/profil/prestasi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, nama, tingkat, tahun }),
  })
  const json = await res.json()
  return json.data
}

// --- Eligibility Status ---
export async function apiGetEligibilityStatus(email: string): Promise<EligibilityStatus> {
  const res = await fetch(`${API_BASE_URL}/profil/eligibility-status?email=${encodeURIComponent(email)}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil status eligibility')
  return json.data?.eligibilityStatus || 'MENUNGGU_BK'
}

// --- Universitas ---
export async function apiGetUniversitas(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/universitas`)
  const json = await res.json()
  return json.data || []
}

// --- Admin ---
export async function apiGetPendaftaranAll(): Promise<PendaftaranItem[]> {
  const res = await fetch(`${API_BASE_URL}/pendaftaran/all`)
  const json = await res.json()
  return json.data || []
}

export interface SiswaItem {
  userId: number
  nama: string
  email: string
  eligibilityStatus: EligibilityStatus
  rataRata: number
  missingSemesters?: number[]
}

export interface SeleksiItem {
  id: number
  email: string
  nama: string
  sekolah: string
  rataRata: number
  prodi1: string
  prodi2?: string
  persentase1: number
  persentase2: number
  status: 'MENUNGGU' | 'DITERIMA' | 'DITOLAK'
  nomorPendaftaran: string
}

export async function apiAdminGetSeleksi(): Promise<SeleksiItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/seleksi`)
  const json = await res.json()
  return json.data || []
}

export async function apiAdminProsesSeleksi(
  id: number,
  status: 'DITERIMA' | 'DITOLAK',
  pilihanDiterima?: 1 | 2,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/seleksi/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, pilihanDiterima }),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.message || 'Gagal memproses seleksi')
  }
}

// --- BK (Guru Bimbingan Konseling) ---
export async function apiBkGetPendaftaran(): Promise<PendaftaranItem[]> {
  const res = await fetch(`${API_BASE_URL}/bk/pendaftaran`)
  const json = await res.json()
  return json.data || []
}

export async function apiBkGetSiswa(): Promise<SiswaItem[]> {
  const res = await fetch(`${API_BASE_URL}/bk/siswa`)
  const json = await res.json()
  return json.data || []
}

export async function apiBkUpdateStatus(
  id: number,
  status: PendaftaranItem['status'],
): Promise<PendaftaranItem> {
  const res = await fetch(`${API_BASE_URL}/bk/pendaftaran/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const json = await res.json()
  return json.data
}

export async function apiBkDeletePendaftaran(id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/bk/pendaftaran/${id}`, { method: 'DELETE' })
}

export async function apiBkKirimKeKepsek(id: number): Promise<PendaftaranItem> {
  const res = await fetch(`${API_BASE_URL}/bk/pendaftaran/${id}/kirim-ke-kepsek`, { method: 'POST' })
  const json = await res.json()
  return json.data
}

export async function apiCreatePendaftaran(
  email: string,
  prodi1: string,
  prodi2?: string,
): Promise<PendaftaranItem> {
  const res = await fetch(`${API_BASE_URL}/pendaftaran`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, prodi1, prodi2 }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Pendaftaran gagal')
  }
  return json.data as PendaftaranItem
}

export async function apiGetRiwayatPendaftaran(email: string): Promise<PendaftaranItem[]> {
  const res = await fetch(`${API_BASE_URL}/pendaftaran?email=${encodeURIComponent(email)}`)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengambil riwayat pendaftaran')
  }
  return (json.data || []) as PendaftaranItem[]
}

export async function apiKepsekUpdateEligibility(
  userId: number,
  status: 'ELIGIBLE' | 'TIDAK_ELIGIBLE',
): Promise<{ userId: number; eligibilityStatus: EligibilityStatus }> {
  const res = await fetch(`${API_BASE_URL}/kepsek/siswa/${userId}/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengubah status eligibility siswa (Kepsek)')
  }
  return json.data as { userId: number; eligibilityStatus: EligibilityStatus }
}

export async function apiBkUpdateEligibility(
  userId: number,
  status: 'MENUNGGU_KEPSEK' | 'TIDAK_ELIGIBLE',
): Promise<{ userId: number; eligibilityStatus: EligibilityStatus }> {
  const res = await fetch(`${API_BASE_URL}/bk/siswa/${userId}/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengubah status eligibility siswa (BK)')
  }
  return json.data as { userId: number; eligibilityStatus: EligibilityStatus }
}

// ...

export async function apiCekEligibility(email: string): Promise<{ eligible: boolean; rataRata: number }> {
  const res = await fetch(`${API_BASE_URL}/profil/eligibility?email=${encodeURIComponent(email)}`)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengecek eligibility')
  }
  return json as { eligible: boolean; rataRata: number }
}

export async function apiCekProfilLengkap(email: string): Promise<{ lengkap: boolean }> {
  const res = await fetch(
    `${API_BASE_URL}/profil/siswa/cek-lengkap?email=${encodeURIComponent(email)}`,
  )
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengecek kelengkapan profil')
  }
  return json as { lengkap: boolean }
}

export async function apiSimulasi(
  email: string,
  prodi1: string,
  prodi2?: string,
): Promise<SimulasiResponse> {
  const res = await fetch(`${API_BASE_URL}/simulasi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, prodi1, prodi2 }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal melakukan simulasi')
  }
  return json as SimulasiResponse
}

export async function apiKepsekGetPendaftaran(): Promise<PendaftaranItem[]> {
  const res = await fetch(`${API_BASE_URL}/kepsek/pendaftaran`)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengambil data pendaftaran (kepala sekolah)')
  }
  return (json.data || []) as PendaftaranItem[]
}

export async function apiKepsekGetSiswa(): Promise<SiswaItem[]> {
  const res = await fetch(`${API_BASE_URL}/kepsek/siswa`)
  const json = await res.json()
  return json.data || []
}

export async function apiKepsekUpdatePendaftaran(
  id: number,
  kepsekStatus: 'DISETUJUI' | 'DITOLAK' | 'BELUM_DITINJAU',
  kepsekAlasan?: string,
): Promise<PendaftaranItem> {
  const res = await fetch(`${API_BASE_URL}/kepsek/pendaftaran/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kepsekStatus, kepsekAlasan }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengubah status kepala sekolah')
  }
  return json.data as PendaftaranItem
}
