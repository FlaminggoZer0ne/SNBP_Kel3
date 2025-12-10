import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './pages.css'
import { apiGetProfilSiswa, apiSimpanProfilSiswa } from '../services/api'

interface LengkapiProfilProps {
  email: string
  onProfilSaved: () => void
}

function LengkapiProfil({ email, onProfilSaved }: LengkapiProfilProps) {
  const [nama, setNama] = useState('')
  const [nisn, setNisn] = useState('')
  const [tempatLahir, setTempatLahir] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [npsn, setNpsn] = useState('')
  const [sekolah, setSekolah] = useState('')
  const [namaOrangTua, setNamaOrangTua] = useState('')
  const [alamat, setAlamat] = useState('')
  const [kabupaten, setKabupaten] = useState('')
  const [provinsi, setProvinsi] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const profil = await apiGetProfilSiswa(email)
        if (profil) {
          setNama(profil.nama || '')
          setNisn(profil.nisn || '')
          setSekolah(profil.sekolah || '')
          setTempatLahir(profil.tempatLahir || '')
          setTanggalLahir(profil.tanggalLahir?.slice(0, 10) || '')
          setNpsn(profil.npsn || '')
          setNamaOrangTua(profil.namaOrangTua || '')
          setAlamat(profil.alamat || '')
          setKabupaten(profil.kabupaten || '')
          setProvinsi(profil.provinsi || '')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [email])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await apiSimpanProfilSiswa({
        email,
        nama,
        nisn,
        tempatLahir: tempatLahir || undefined,
        tanggalLahir: tanggalLahir || undefined,
        npsn: npsn || undefined,
        sekolah,
        namaOrangTua,
        alamat,
        kabupaten,
        provinsi
      })
      alert('Profil berhasil disimpan')
      onProfilSaved()
      navigate('/nilai')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan profil'
      alert(message)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="helper-text">Memuat profil...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Lengkapi Profil Siswa</h1>
      <p className="helper-text">
        Silakan lengkapi data diri di bawah ini sebelum mengisi nilai rapor dan prestasi.
      </p>

      <section className="section" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div className="card">
          <form className="form" onSubmit={handleSubmit}>
            <h3 className="section-title" style={{ marginTop: 0 }}>Data Pribadi</h3>

            <div className="form-grid-2">
              <div className="form-control">
                <label>Nama Lengkap</label>
                <input value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div className="form-control">
                <label>NISN</label>
                <input value={nisn} onChange={(e) => setNisn(e.target.value)} required />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-control">
                <label>Tempat Lahir</label>
                <input value={tempatLahir} onChange={(e) => setTempatLahir(e.target.value)} />
              </div>
              <div className="form-control">
                <label>Tanggal Lahir</label>
                <input
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                />
              </div>
            </div>

            <h3 className="section-title">Data Sekolah</h3>

            <div className="form-grid-2">
              <div className="form-control">
                <label>NPSN</label>
                <input value={npsn} onChange={(e) => setNpsn(e.target.value)} />
              </div>
              <div className="form-control">
                <label>Asal Sekolah</label>
                <input value={sekolah} onChange={(e) => setSekolah(e.target.value)} required />
              </div>
            </div>

            <div className="form-control">
              <label>Nama Orang Tua / Wali</label>
              <input
                value={namaOrangTua}
                onChange={(e) => setNamaOrangTua(e.target.value)}
                required
              />
            </div>

            <h3 className="section-title">Alamat Lengkap</h3>

            <div className="form-control">
              <label>Alamat</label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-control">
                <label>Kabupaten/Kota</label>
                <input
                  type="text"
                  value={kabupaten}
                  onChange={(e) => setKabupaten(e.target.value)}
                  placeholder="Contoh: Kab. Bogor"
                />
              </div>
              <div className="form-control">
                <label>Provinsi</label>
                <input
                  type="text"
                  value={provinsi}
                  onChange={(e) => setProvinsi(e.target.value)}
                  placeholder="Contoh: Prov. Jawa Barat"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn primary">
                Simpan Profil
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default LengkapiProfil
