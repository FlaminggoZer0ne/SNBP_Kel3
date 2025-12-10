import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'

import './App.css'
import {
  apiCekProfilLengkap,
  type UserRole,
  apiGetEligibilityStatus,
  type EligibilityStatus,
  apiGetProfilSiswa,
} from './services/api'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import BKGuruDashboard from './pages/BKGuruDashboard'
import KepsekDashboard from './pages/KepsekDashboard'
import NilaiPrestasi from './pages/NilaiPrestasi'
import DaftarUniversitas from './pages/DaftarUniversitas'
import Riwayat from './pages/Riwayat'
import LengkapiProfil from './pages/LengkapiProfil'
import MenungguPersetujuan from './pages/MenungguPersetujuan'
import TidakEligible from './pages/TidakEligible'
import CekPengumuman from './pages/CekPengumuman'
import Beranda from './pages/Beranda'

function App() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [profilLengkap, setProfilLengkap] = useState(false)
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const isStandalonePengumuman = location.pathname === '/cek-pengumuman-standalone'

  const handleLoginSuccess = async (email: string, role?: UserRole) => {
    // Jika role undefined, anggap SISWA
    const finalRole = role || 'SISWA'
    
    localStorage.setItem('token', JSON.stringify({ email, role: finalRole }))
    setCurrentUserEmail(email)
    setCurrentUserRole(finalRole)

    if (finalRole === 'SISWA') {
      const [{ lengkap }, status, profil] = await Promise.all([
        apiCekProfilLengkap(email),
        apiGetEligibilityStatus(email),
        apiGetProfilSiswa(email),
      ])
      setProfilLengkap(lengkap)
      setEligibilityStatus(status)
      setCurrentUserName(profil?.nama || null)
    } else {
      setProfilLengkap(true)
      setEligibilityStatus(null)
      setCurrentUserName(null)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('snbp_token')
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]))
        handleLoginSuccess(decoded.email, decoded.role).finally(() => setIsLoading(false))
      } catch (e) {
        console.error('Invalid token', e)
        localStorage.removeItem('snbp_token')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('snbp_token') // Hapus juga token JWT
    setCurrentUserEmail(null)
    setCurrentUserRole(null)
    setCurrentUserName(null)
    setProfilLengkap(false)
    setEligibilityStatus(null)
    navigate('/login')
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Halaman khusus cek pengumuman (standalone, tanpa navbar/layout), untuk dibuka di tab baru
  if (isStandalonePengumuman) {
    return (
      <main className="main-content">
        <Routes>
          <Route path="/cek-pengumuman-standalone" element={<CekPengumuman />} />
        </Routes>
      </main>
    )
  }

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-brand">
          <Link to="/">SNBP</Link>
        </div>
        <nav className="navbar-nav">
          <ul>
            <li>
              <Link to="/">Beranda</Link>
            </li>
            {currentUserRole === 'SISWA' && (
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            )}
            {currentUserRole === 'SISWA' && eligibilityStatus === 'ELIGIBLE' && (
              <>
                <li>
                  <Link to="/nilai">Nilai & Prestasi</Link>
                </li>
                <li>
                  <Link to="/riwayat">Riwayat Pendaftaran</Link>
                </li>
              </>
            )}
            {currentUserRole === 'SISWA' &&
              (eligibilityStatus === 'MENUNGGU_BK' ||
                eligibilityStatus === 'MENUNGGU_KEPSEK' ||
                eligibilityStatus === 'TIDAK_ELIGIBLE') && (
                <>
                  <li>
                    <Link to="/profil">Profil Siswa</Link>
                  </li>
                  <li>
                    <Link to="/nilai">Nilai & Prestasi</Link>
                  </li>
                </>
              )}
            {currentUserRole === 'ADMIN' && (
              <li>
                <Link to="/admin">Dashboard Admin</Link>
              </li>
            )}
            {currentUserRole === 'GURU_BK' && (
              <li>
                <Link to="/bk">Dashboard Guru BK</Link>
              </li>
            )}
            {currentUserRole === 'KEPALA_SEKOLAH' && (
              <li>
                <Link to="/kepsek">Dashboard Kepala Sekolah</Link>
              </li>
            )}
            {/* Link Cek Pengumuman dibuka di tab baru, menggunakan halaman standalone tanpa navbar */}
            <li>
              <a href="/cek-pengumuman-standalone" target="_blank" rel="noreferrer">
                Cek Pengumuman
              </a>
            </li>
          </ul>
        </nav>
        <div className="navbar-user">
          {currentUserEmail ? (
            <>
              <span>Masuk sebagai: {currentUserName || currentUserEmail}</span>
              <button type="button" className="btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Beranda currentUserEmail={currentUserEmail} currentUserRole={currentUserRole} />}
          />
          <Route
            path="/login"
            element={
              currentUserEmail ? (
                // Jika sudah login (termasuk Guru BK, Kepsek, Admin, Siswa), jangan tampilkan form login lagi
                <Navigate to="/" />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route path="/register" element={<Register onRegisterSuccess={handleLoginSuccess} />} />

          {currentUserEmail && currentUserRole === 'SISWA' && (
            <>
              <Route
                path="/menunggu-persetujuan"
                element={<MenungguPersetujuan nama={currentUserEmail} />}
              />
              <Route path="/tidak-eligible" element={<TidakEligible nama={currentUserEmail} />} />
            </>
          )}

          {currentUserEmail &&
          (eligibilityStatus === 'ELIGIBLE' ||
            location.pathname === '/profil' ||
            location.pathname === '/nilai') ? (
            <>
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    currentUserEmail={currentUserEmail}
                    profilLengkap={profilLengkap}
                    eligibilityStatus={eligibilityStatus}
                  />
                }
              />
              <Route
                path="/nilai"
                element={<NilaiPrestasi email={currentUserEmail} />}
              />
              {profilLengkap && eligibilityStatus === 'ELIGIBLE' ? (
                <>
                  <Route
                    path="/daftar-universitas"
                    element={<DaftarUniversitas email={currentUserEmail} />}
                  />
                  <Route
                    path="/riwayat"
                    element={<Riwayat email={currentUserEmail} />}
                  />
                </>
              ) : null}

              <Route
                path="/profil"
                element={
                  <LengkapiProfil
                    email={currentUserEmail}
                    onProfilSaved={() => setProfilLengkap(true)}
                  />
                }
              />
            </>
          ) : (
            <Route
              path="/*"
              element={
                <Navigate
                  to={
                    location.pathname === '/cek-pengumuman' || location.pathname === '/' 
                      ? location.pathname 
                      : eligibilityStatus === 'MENUNGGU_BK' ||
                        eligibilityStatus === 'MENUNGGU_KEPSEK'
                      ? '/menunggu-persetujuan'
                      : eligibilityStatus === 'TIDAK_ELIGIBLE'
                      ? '/tidak-eligible'
                      : '/login'
                  }
                />
              }
            />
          )}

          {currentUserRole === 'ADMIN' && (
            <Route path="/admin" element={<AdminDashboard />} />
          )}
          {currentUserRole === 'GURU_BK' && (
            <Route path="/bk" element={<BKGuruDashboard />} />
          )}
          {currentUserRole === 'KEPALA_SEKOLAH' && (
            <Route path="/kepsek" element={<KepsekDashboard />} />
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default Root
