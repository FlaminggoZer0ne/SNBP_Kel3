import { useState, type FormEvent } from 'react'
import './pages.css'
import type { PendaftaranItem } from '../services/api'
import { apiCekPengumuman } from '../services/api'

function CekPengumuman() {
  const [nomor, setNomor] = useState('')
  const [tglLahir, setTglLahir] = useState('')
  const [hasil, setHasil] = useState<PendaftaranItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const formatDisplayDate = (isoDate: string | undefined | null): string => {
    if (!isoDate) return '01/01/2006'
    const parts = isoDate.split('-') // yyyy-mm-dd
    if (parts.length !== 3) return isoDate
    const [year, month, day] = parts
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  }

  const handleCek = async (e: FormEvent) => {
    e.preventDefault()

    // Validasi nomor pendaftaran
    if (!nomor.trim()) {
      setError('Nomor pendaftaran wajib diisi')
      return
    }

    // Validasi tanggal lahir
    if (!tglLahir.trim()) {
      setError('Tanggal lahir wajib diisi')
      return
    }

    setLoading(true)
    setError(null)
    setHasil(null)
    setShowResult(false)

    try {
      const data = await apiCekPengumuman(nomor, tglLahir)
      setHasil(data)
      setShowResult(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengecek pengumuman'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const renderResult = () => {
    if (!hasil) return null

    // Logika Kelulusan: Status BK DITERIMA & Kepsek DISETUJUI
    const isLulus = hasil.status === 'DITERIMA' && hasil.kepsekStatus === 'DISETUJUI'
    // Logika Ditolak: Salah satu menolak
    const isDitolak = hasil.status === 'DITOLAK' || hasil.kepsekStatus === 'DITOLAK'
    
    // Jika masih menunggu
    if (!isLulus && !isDitolak) {
        return (
            <div className="snbp-card warning">
                <div className="snbp-header warning">
                    PENGUMUMAN BELUM TERSEDIA
                </div>
                <div className="snbp-body">
                    <p>Status pendaftaran Anda saat ini masih dalam proses seleksi.</p>
                    <p>Silakan cek kembali secara berkala.</p>
                </div>
            </div>
        )
    }

    if (isLulus) {
        return (
            <div className="snbp-card lulus">
                <div className="snbp-header lulus">
                    <div className="logo-placeholder">SNBP</div>
                    <h1>SELAMAT! ANDA DINYATAKAN<br/>LULUS SELEKSI SNBP 2025</h1>
                </div>
                <div className="snbp-body">
                    <div className="snbp-qr-placeholder">
                        <div className="qr-box"></div>
                    </div>
                    
                    <div className="snbp-info-group">
                        <p className="label-small">NOREG {hasil.nomorPendaftaran}</p>
                        <h2 className="student-name">{(hasil.nama || hasil.email.split('@')[0]).toUpperCase()}</h2>
                    </div>

                    <div className="snbp-info-group">
                        <p className="prodi-name">{hasil.prodi1}</p>
                        {/* Nama PTN biasanya ada di string prodi, kita asumsikan format "Prodi - PTN" */}
                        {/* <p className="ptn-name">INSTITUT TEKNOLOGI BANDUNG</p> */}
                    </div>

                    <div className="snbp-details-grid">
                        <div className="detail-item">
                            <label>Tanggal Lahir</label>
                            <p>{formatDisplayDate(tglLahir)}</p>
                        </div>
                        <div className="detail-item">
                            <label>Asal Sekolah</label>
                            <p>{hasil.sekolah || 'SMA NEGERI CONTOH'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Kabupaten/Kota</label>
                            <p>{hasil.kabupaten || 'KAB. CONTOH'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Provinsi</label>
                            <p>{hasil.provinsi || 'PROV. JAWA TENGAH'}</p>
                        </div>
                    </div>
                </div>
                <div className="snbp-footer">
                    <p><strong>Silakan lakukan pendaftaran ulang.</strong></p>
                    <p>Informasi pendaftaran ulang di PTN/Politeknik dapat dilihat pada laman web masing-masing.</p>
                </div>
            </div>
        )
    }

    // Tampilan Tidak Lulus
    return (
        <div className="snbp-card tidak-lulus">
             <div className="snbp-header tidak-lulus">
                <div className="logo-placeholder">SNBP</div>
                <h1>ANDA DINYATAKAN TIDAK LULUS<br/>SELEKSI SNBP 2025</h1>
                <p className="subtitle">MASIH ADA KESEMPATAN MENDAFTAR DAN MENGIKUTI SNBT 2025 ATAU SELEKSI MANDIRI PTN.</p>
            </div>
            <div className="snbp-body">
                <div className="snbp-info-group">
                    <p className="label-small">NOREG {hasil.nomorPendaftaran}</p>
                    <h2 className="student-name">{(hasil.nama || hasil.email.split('@')[0]).toUpperCase()}</h2>
                </div>

                <div className="snbp-details-grid">
                    <div className="detail-item">
                        <label>Tanggal Lahir</label>
                        <p>{formatDisplayDate(tglLahir)}</p>
                    </div>
                    <div className="detail-item">
                        <label>Asal Sekolah</label>
                        <p>{hasil.sekolah || 'SMA NEGERI CONTOH'}</p>
                    </div>
                    <div className="detail-item">
                        <label>Kabupaten/Kota</label>
                        <p>{hasil.kabupaten || 'KAB. CONTOH'}</p>
                    </div>
                    <div className="detail-item">
                        <label>Provinsi</label>
                        <p>{hasil.provinsi || 'PROV. JAWA TENGAH'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="page snbp-bg">
        {!showResult ? (
            <div className="snbp-login-container">
                <div className="snbp-logo-large">SNBP</div>
                <h2>HASIL SELEKSI SNBP 2025</h2>
                <p>Masukkan Nomor Pendaftaran SNBP dan Tanggal Lahir.</p>
                
                <form className="snbp-form" onSubmit={handleCek}>
                    <div className="form-group">
                        <label>Nomor Pendaftaran</label>
                        <input 
                            type="text" 
                            placeholder="Nomor registrasi pada kartu SNBP" 
                            value={nomor}
                            onChange={(e) => setNomor(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tanggal Lahir</label>
                        <input 
                            type="date"
                            value={tglLahir}
                            onChange={(e) => setTglLahir(e.target.value)} 
                            required
                        />
                    </div>
                    
                    <button className="btn-snbp-blue" type="submit" disabled={loading}>
                        {loading ? 'MEMUAT...' : 'LIHAT HASIL SELEKSI'}
                    </button>
                </form>

                {error && (
                    <div className="alert-danger" style={{marginTop: '1rem'}}>
                        {error}
                    </div>
                )}
            </div>
        ) : (
            <div className="snbp-result-container">
                <button className="btn-back" onClick={() => setShowResult(false)}>
                    &larr; Kembali ke Pencarian
                </button>
                {renderResult()}
            </div>
        )}

        <style>{`
            .snbp-bg {
                background-color: #f0f0f0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }

            /* --- LOGIN / SEARCH STYLE --- */
            .snbp-login-container {
                background: #1a1a1a; /* Dark background like reference 3 */
                color: white;
                padding: 2rem;
                border-radius: 8px;
                width: 100%;
                max-width: 400px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }
            .snbp-logo-large {
                font-size: 2rem;
                font-weight: 900;
                color: #A07856;
                margin-bottom: 1rem;
                letter-spacing: 2px;
                background: linear-gradient(to right, #A07856, #ffffff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .snbp-login-container h2 {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
                font-weight: 700;
            }
            .snbp-login-container p {
                color: #aaa;
                font-size: 0.9rem;
                margin-bottom: 1.5rem;
            }
            .snbp-form .form-group {
                margin-bottom: 1.2rem;
            }
            .snbp-form label {
                display: block;
                color: #A07856;
                font-size: 0.9rem;
                font-weight: 600;
                margin-bottom: 0.4rem;
            }
            .snbp-form input {
                width: 100%;
                padding: 0.8rem;
                background: #333;
                border: 1px solid #444;
                border-radius: 4px;
                color: white;
                font-size: 1rem;
            }
            .btn-snbp-blue {
                width: 100%;
                background-color: #A07856;
                color: white;
                border: none;
                padding: 1rem;
                border-radius: 25px; /* Pill shape */
                font-weight: 700;
                cursor: pointer;
                transition: background 0.2s;
                margin-top: 1rem;
            }
            .btn-snbp-blue:hover {
                background-color: #A07856;
            }

            /* --- RESULT CARD STYLE --- */
            .snbp-result-container {
                width: 100%;
                max-width: 480px;
            }
            .btn-back {
                background: none;
                border: none;
                color: #333;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 1rem;
                display: block;
            }

            .snbp-card {
                background: #000;
                color: white;
                border-radius: 0;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            }
            
            /* HEADER */
            .snbp-header {
                padding: 2rem 1.5rem;
                text-align: left;
                position: relative;
            }
            .snbp-header.lulus {
                background: linear-gradient(to right, #A07856, #A07856);
            }
            .snbp-header.tidak-lulus {
                background: linear-gradient(to right, #c00, #ff4d4d); /* Red gradient */
            }
            .snbp-header.warning {
                background: #ffc107;
                color: #000;
                text-align: center;
                font-weight: bold;
            }

            .logo-placeholder {
                font-weight: 900;
                font-size: 1.5rem;
                margin-bottom: 1rem;
                opacity: 0.8;
                font-style: italic;
            }

            .snbp-header h1 {
                font-size: 1.25rem;
                font-weight: 800;
                line-height: 1.4;
                margin: 0;
                text-transform: uppercase;
            }
            .snbp-header .subtitle {
                font-size: 0.85rem;
                margin-top: 0.5rem;
                opacity: 0.9;
                font-weight: 600;
            }

            /* BODY */
            .snbp-body {
                padding: 1.5rem;
                background-color: #000; /* Deep black */
            }

            .snbp-qr-placeholder {
                display: none; /* Hide for now, can be added */
            }

            .snbp-info-group {
                margin-bottom: 2rem;
            }
            .label-small {
                color: #A07856;
                font-size: 0.8rem;
                font-weight: 700;
                margin-bottom: 0.2rem;
            }
            .tidak-lulus .label-small {
                color: #6c757d; /* Grey for failed */
            }
            
            .student-name {
                font-size: 1.8rem;
                font-weight: 700;
                margin: 0;
                line-height: 1.2;
            }

            .prodi-name {
                font-size: 1.1rem;
                font-weight: 400;
                opacity: 0.9;
                margin: 0;
                text-transform: uppercase;
            }

            /* DETAILS GRID */
            .snbp-details-grid {
                display: grid;
                gap: 1.5rem;
            }
            .detail-item label {
                display: block;
                color: #A07856;
                font-size: 0.85rem;
                font-weight: 700;
                margin-bottom: 0.2rem;
            }
            .tidak-lulus .detail-item label {
                color: #A07856;
            }
            .detail-item p {
                margin: 0;
                font-size: 1rem;
                font-weight: 600;
            }

            /* FOOTER */
            .snbp-footer {
                background: white;
                color: #333;
                padding: 1.5rem;
            }
            .snbp-footer p {
                margin: 0;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            /* RESPONSIVE */
            @media (max-width: 480px) {
                .snbp-login-container {
                    padding: 1.5rem;
                }
                .student-name {
                    font-size: 1.5rem;
                }
            }
        `}</style>
    </div>
  )
}

export default CekPengumuman
