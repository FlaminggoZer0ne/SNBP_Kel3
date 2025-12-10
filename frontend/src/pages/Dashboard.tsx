import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './pages.css'
import { apiGetProfilSiswa, type EligibilityStatus } from '../services/api'

interface DashboardProps {
  currentUserEmail: string | null
  profilLengkap: boolean
  eligibilityStatus: EligibilityStatus | null
}

function Dashboard({ currentUserEmail, eligibilityStatus }: DashboardProps) {
  const [namaSiswa, setNamaSiswa] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUserEmail) return
    ;(async () => {
      try {
        const profil = await apiGetProfilSiswa(currentUserEmail)
        if (profil?.nama) {
          setNamaSiswa(profil.nama)
        } else {
          setNamaSiswa(null)
        }
      } catch {
        setNamaSiswa(null)
      }
    })()
  }, [currentUserEmail])

  const getDisabledTargetUrl = () => {
    if (eligibilityStatus === 'MENUNGGU_BK' || eligibilityStatus === 'MENUNGGU_KEPSEK') {
      return '/menunggu-persetujuan'
    } else if (eligibilityStatus === 'TIDAK_ELIGIBLE') {
      return '/tidak-eligible'
    } else {
      return '/dashboard' // Fallback
    }
  }

  return (
    <div className="page">
      <h1>Dashboard Siswa</h1>
      <p className="helper-text">
        Masuk sebagai: {namaSiswa || currentUserEmail || 'Pengguna Demo'}
      </p>

      <div className="grid">
        <Link to="/nilai" className="card-link">
          <div className="card">
            <h2>Nilai & Prestasi</h2>
            <p>Input nilai rapor dan prestasi sebagai dasar seleksi SNBP.</p>
          </div>
        </Link>

        {eligibilityStatus === 'ELIGIBLE' ? (
          <Link to="/daftar-universitas" className="card-link">
            <div className="card">
              <h2>Daftar SNBP</h2>
              <p>Pilih universitas dan program studi tujuan untuk pendaftaran SNBP.</p>
            </div>
          </Link>
        ) : (
          <Link to={getDisabledTargetUrl()} className="card-link disabled">
            <div className="card">
              <h2>Daftar SNBP</h2>
              <p>Pilih universitas dan program studi tujuan untuk pendaftaran SNBP.</p>
            </div>
          </Link>
        )}

        <Link to="/profil" className="card-link">
          <div className="card">
            <h2>Profil Siswa</h2>
            <p>Lihat dan perbarui data profil Anda (nama, sekolah, dan lain-lain).</p>
          </div>
        </Link>

        {eligibilityStatus === 'ELIGIBLE' ? (
          <Link to="/riwayat" className="card-link">
            <div className="card">
              <h2>Riwayat Pendaftaran</h2>
              <p>Lihat riwayat pendaftaran dan status proses seleksi.</p>
            </div>
          </Link>
        ) : (
          <Link to={getDisabledTargetUrl()} className="card-link disabled">
            <div className="card">
              <h2>Riwayat Pendaftaran</h2>
              <p>Lihat riwayat pendaftaran dan status simulasi.</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

export default Dashboard
