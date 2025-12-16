import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './pages.css'
import { apiLogin, apiCekProfilLengkap } from '../services/api'

interface LoginProps {
  onLoginSuccess: (email: string, role?: 'SISWA' | 'ADMIN' | 'GURU_BK' | 'KEPALA_SEKOLAH') => void
}

function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    if (!email || !password) {
      alert('Email dan password wajib diisi')
      return
    }

    try {
      const result = await apiLogin(email, password)
      const userEmail = result.user?.email || email
      if (result.token) {
        localStorage.setItem('snbp_token', result.token)
      }
      onLoginSuccess(userEmail, result.user?.role)

      if (result.user?.role === 'SISWA' || !result.user?.role) {
        // Untuk siswa, cek dulu apakah profil sudah lengkap
        try {
          const lengkap = await apiCekProfilLengkap(userEmail)
          navigate(lengkap ? '/dashboard' : '/profil')
        } catch {
          navigate('/profil')
        }
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal'
      alert(message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">SNBP</div>
      <div className="login-blob">
        <h1 className="login-title">Masuk Portal SNBP</h1>
        <form className="form auth-form login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" placeholder="nama@email" />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="••••••" />
          </label>
          <button className="btn primary" type="submit">Masuk</button>
        </form>
        <p className="helper-text login-helper">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
