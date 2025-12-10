import type { FormEvent } from 'react'
import { useState } from 'react'
import './pages.css'
import { apiSimulasi, type SimulasiResponse } from '../services/api'

interface SimulasiProps {
  email: string
}

function Simulasi({ email }: SimulasiProps) {
  const [hasil, setHasil] = useState<SimulasiResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const prodi1 = String(formData.get('prodi1') || '')
    const prodi2 = String(formData.get('prodi2') || '')

    if (!prodi1 && !prodi2) {
      alert('Minimal isi salah satu pilihan prodi')
      return
    }

    try {
      setLoading(true)
      const res = await apiSimulasi(email, prodi1, prodi2 || undefined)
      setHasil(res)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal melakukan simulasi'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Simulasi Peluang SNBP</h1>
      <p className="helper-text">
        Simulasi ini hanya perkiraan sederhana berdasarkan rata-rata nilai rapor dan jumlah prestasi.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Pilihan Prodi 1
          <input type="text" name="prodi1" placeholder="cth. Informatika - Universitas X" />
        </label>
        <label>
          Pilihan Prodi 2
          <input type="text" name="prodi2" placeholder="cth. Sistem Informasi - Universitas Y" />
        </label>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Menghitung...' : 'Hitung Simulasi'}
        </button>
      </form>

      {hasil && (
        <div className="card result">
          <h2>Hasil Simulasi</h2>
          <p>Skor simulasi: <strong>{hasil.skor.toFixed(2)}</strong></p>
          <p>Kategori peluang: <strong>{hasil.kategori}</strong></p>
          <p>Pilihan Prodi 1: {hasil.prodi1 || '-'}</p>
          <p>Pilihan Prodi 2: {hasil.prodi2 || '-'}</p>
        </div>
      )}
    </div>
  )
}

export default Simulasi
