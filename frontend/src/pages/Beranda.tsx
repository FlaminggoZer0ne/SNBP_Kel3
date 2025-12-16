import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './pages.css'
import type { UserRole, HomeContent, HomeRole } from '../services/api'
import { apiGetHomeContent } from '../services/api'

interface BerandaProps {
  currentUserEmail: string | null
  currentUserRole: UserRole | null
}

function Beranda({ currentUserEmail, currentUserRole }: BerandaProps) {
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null)

  const getRoleForHome = (): HomeRole => {
    if (!currentUserRole) return 'PUBLIC'
    return currentUserRole
  }

  useEffect(() => {
    ;(async () => {
      try {
        const role = getRoleForHome()
        const content = await apiGetHomeContent(role)
        setHomeContent(content)
      } catch (e) {
        // Jika gagal, biarkan fallback ke teks default lama
        console.error(e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserRole])
  const getDashboardPath = () => {
    if (currentUserRole === 'ADMIN') return '/admin'
    if (currentUserRole === 'GURU_BK') return '/bk'
    if (currentUserRole === 'KEPALA_SEKOLAH') return '/kepsek'
    if (currentUserRole === 'SISWA') return '/dashboard'
    return '/login'
  }

  return (
    <div className="page beranda-page">
      <section className="hero">
        <div className="hero-text">
          <h1>{homeContent?.title || 'Pendaftaran SNBP'}</h1>
          <p className="helper-text">
            {homeContent?.subtitle ||
              'Portal internal sekolah untuk mengelola nilai rapor, verifikasi Guru BK & Kepala Sekolah, hingga pemilihan universitas dan pengecekan hasil seleksi SNBP.'}
          </p>
          <div className="hero-actions">
            {!currentUserEmail ? (
              <Link to="/login" className="btn primary">
                Masuk Portal
              </Link>
            ) : (
              <Link to={getDashboardPath()} className="btn primary">
                Masuk ke Dashboard
              </Link>
            )}
            <a
              href="/cek-pengumuman-standalone"
              target="_blank"
              rel="noreferrer"
              className="btn secondary"
            >
              Cek Pengumuman SNBP
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Beranda
