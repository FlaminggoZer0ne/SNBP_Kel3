import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './pages.css'
import { apiGetUniversitas, apiCreatePendaftaran, apiGetRiwayatPendaftaran, type PendaftaranItem } from '../services/api'

interface DaftarUniversitasProps {
  email: string
}

function DaftarUniversitas({ email }: DaftarUniversitasProps) {
  const navigate = useNavigate()
  const [universitasList, setUniversitasList] = useState<string[]>([])
  const [loadingUniversitas, setLoadingUniversitas] = useState(false)
  const [errorUniversitas, setErrorUniversitas] = useState<string | null>(null)
  const [sudahPunyaPendaftaran, setSudahPunyaPendaftaran] = useState(false)
  const [pendaftaranTerakhir, setPendaftaranTerakhir] = useState<PendaftaranItem | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        // Cek apakah siswa sudah punya pendaftaran
        const riwayat = await apiGetRiwayatPendaftaran(email)
        if (!isMounted) return

        if (riwayat.length > 0) {
          setSudahPunyaPendaftaran(true)
          setPendaftaranTerakhir(riwayat[0])
          return
        }

        // Jika belum ada pendaftaran, baru load daftar universitas
        setLoadingUniversitas(true)
        const data = await apiGetUniversitas()
        if (!isMounted) return
        setUniversitasList(data)
        setErrorUniversitas(null)
      } catch (err) {
        if (!isMounted) return
        console.error(err)
        setErrorUniversitas('Gagal memuat data, silakan coba lagi.')
      } finally {
        if (isMounted) {
          setLoadingUniversitas(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [email])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (sudahPunyaPendaftaran) {
      alert('Anda sudah memiliki pendaftaran SNBP dan tidak dapat mengubah pilihan lagi.')
      return
    }
    const formData = new FormData(e.currentTarget)
    const universitas1 = String(formData.get('universitas1') || '')
    const prodi1 = String(formData.get('prodi1') || '')
    const universitas2 = String(formData.get('universitas2') || '')
    const prodi2 = String(formData.get('prodi2') || '')

    if (!universitas1 || !prodi1) {
      alert('Universitas dan program studi 1 wajib diisi')
      return
    }

    const pilihan1 = `${prodi1} - ${universitas1}`
    const pilihan2 = universitas2 && prodi2 ? `${prodi2} - ${universitas2}` : undefined

    try {
      await apiCreatePendaftaran(email, pilihan1, pilihan2)
      alert('Pendaftaran berhasil disimpan!')
      navigate('/riwayat')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal melakukan pendaftaran'
      alert(message)
    }
  }

  return (
    <div className="page">
      <h1>Daftar Universitas & Program Studi SNBP</h1>
      {sudahPunyaPendaftaran ? (
        <>
          <p className="helper-text">
            Anda sudah menyimpan pendaftaran SNBP. Pilihan universitas dan program studi tidak dapat diubah lagi.
          </p>
          {pendaftaranTerakhir && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <p><strong>Nomor Pendaftaran:</strong> {pendaftaranTerakhir.nomorPendaftaran}</p>
              <p><strong>Pilihan 1:</strong> {pendaftaranTerakhir.prodi1}</p>
              {pendaftaranTerakhir.prodi2 && (
                <p><strong>Pilihan 2:</strong> {pendaftaranTerakhir.prodi2}</p>
              )}
            </div>
          )}
          <p className="helper-text small" style={{ marginTop: '1rem' }}>
            Jika ada kesalahan data, silakan hubungi Guru BK atau admin sekolah.
          </p>
        </>
      ) : (
        <>
          <p className="helper-text">
            Silakan pilih universitas dan program studi tujuan Anda.
          </p>
          {loadingUniversitas && <p className="helper-text">Memuat daftar universitas...</p>}
          {errorUniversitas && <p className="error-text">{errorUniversitas}</p>}

          <section className="section">
            <h2>Form Pendaftaran SNBP</h2>
            <form className="form" onSubmit={handleSubmit}>
              <label>
                Universitas Pilihan 1
                <input
                  list="daftar-universitas"
                  name="universitas1"
                  placeholder="Pilih universitas"
                  required
                />
              </label>
              <datalist id="daftar-universitas">
                {universitasList.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
              <label>
                Program Studi 1
                <input
                  type="text"
                  name="prodi1"
                  placeholder="cth. Informatika"
                  required
                />
              </label>
              <label>
                Universitas Pilihan 2 (opsional)
                <input
                  list="daftar-universitas"
                  name="universitas2"
                  placeholder="Pilih universitas"
                />
              </label>
              <label>
                Program Studi 2 (opsional)
                <input
                  type="text"
                  name="prodi2"
                  placeholder="cth. Sistem Informasi"
                />
              </label>
              <button className="btn primary" type="submit">Simpan Pendaftaran</button>
            </form>
            <p className="helper-text small">
              Pastikan pilihan Anda sudah benar sebelum menyimpan. Data akan dikirim ke Kepala Sekolah untuk persetujuan akhir.
            </p>
          </section>
        </>
      )}
    </div>
  )
}

export default DaftarUniversitas
