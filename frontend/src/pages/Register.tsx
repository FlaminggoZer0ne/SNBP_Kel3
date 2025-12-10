import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './pages.css'
import { apiRegister } from '../services/api'

interface RegisterProps {
  onRegisterSuccess: (email: string) => void
}

function Register({ onRegisterSuccess }: RegisterProps) {
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
      const result = await apiRegister(email, password)
      if (result.token) {
        localStorage.setItem('snbp_token', result.token)
      }
      onRegisterSuccess(result.user?.email || email)
      // Setelah daftar, langsung ke halaman lengkapi profil
      navigate('/profil')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registrasi gagal'
      alert(message)
    }
  }

  return (
    <div className="page auth-page">
      <h1>Daftar Akun SNBP</h1>
      <form className="form auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" placeholder="nama@email" />
        </label>
        <label>
          Password
          <input type="password" name="password" placeholder="••••••" />
        </label>
        <button className="btn primary" type="submit">Daftar</button>
      </form>
      <p className="helper-text">
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </p>
    </div>
  )
}

export default Register
