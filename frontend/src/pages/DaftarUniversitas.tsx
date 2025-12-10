import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './pages.css'
import { apiGetUniversitas, apiCreatePendaftaran } from '../services/api'

interface DaftarUniversitasProps {
  email: string
}

function DaftarUniversitas({ email }: DaftarUniversitasProps) {
  const navigate = useNavigate()
  const [universitasList, setUniversitasList] = useState<string[]>([])
  const [loadingUniversitas, setLoadingUniversitas] = useState(false)
  const [errorUniversitas, setErrorUniversitas] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoadingUniversitas(true)
    apiGetUniversitas()
      .then((data) => {
        if (isMounted) {
          setUniversitasList(data)
          setErrorUniversitas(null)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.error(err)
          setErrorUniversitas('Gagal memuat daftar universitas, silakan coba lagi.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingUniversitas(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
    </div>
  )
}

export default DaftarUniversitas
