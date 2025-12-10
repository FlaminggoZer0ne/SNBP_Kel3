import type { FC } from 'react'
import { Link } from 'react-router-dom'
import './pages.css'

interface LandingProps {
  isLoggedIn?: boolean
}

const Landing: FC<LandingProps> = ({ isLoggedIn }) => {
  return (
    <div className="page">
      <header className="hero">
        <h1>Seleksi Nasional Berdasarkan Prestasi (SNBP)</h1>
        <p>
          Portal simulasi dan informasi SNBP untuk membantu siswa memahami alur, ketentuan, dan
          persiapan pendaftaran perguruan tinggi negeri.
        </p>
        {!isLoggedIn && (
          <div className="hero-actions">
            <Link to="/login" className="btn primary">Login Peserta</Link>
            <Link to="/register" className="btn secondary">Registrasi Akun</Link>
          </div>
        )}
      </header>

      <section className="section">
        <h2>Informasi Penting</h2>
        <div className="two-columns">
          <div>
            <h3>Jadwal (Contoh)</h3>
            <ul className="list">
              <li>Pengumuman Kuota Sekolah: Januari 2026</li>
              <li>Pendaftaran SNBP: Februari 2026</li>
              <li>Pengumuman Hasil: Maret 2026</li>
            </ul>
          </div>
          <div>
            <h3>Tahapan Utama</h3>
            <ul className="list">
              <li>Pengisian nilai rapor dan data prestasi oleh sekolah/siswa.</li>
              <li>Pemilihan program studi dan perguruan tinggi tujuan.</li>
              <li>Verifikasi data dan penetapan hasil seleksi.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
