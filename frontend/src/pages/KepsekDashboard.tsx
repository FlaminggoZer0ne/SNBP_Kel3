import { useEffect, useState } from 'react'
import './pages.css'
import type { SiswaItem } from '../services/api'
import { apiKepsekGetSiswa, apiKepsekUpdateEligibility } from '../services/api'

function KepsekDashboard() {
  const [dataSiswa, setDataSiswa] = useState<SiswaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const siswa = await apiKepsekGetSiswa()
        setDataSiswa(siswa)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // --- Handler Siswa (Eligibility) ---
  const handleUpdateEligibility = async (
    userId: number,
    status: 'ELIGIBLE' | 'TIDAK_ELIGIBLE',
  ) => {
    const confirmMsg =
      status === 'ELIGIBLE'
        ? 'Nyatakan siswa ini ELIGIBLE (Boleh mendaftar SNBP)?'
        : 'Nyatakan siswa ini TIDAK ELIGIBLE?'

    if (!window.confirm(confirmMsg)) return

    try {
      const updated = await apiKepsekUpdateEligibility(userId, status)
      setDataSiswa((prev) =>
        prev.map((s) =>
          s.userId === updated.userId
            ? { ...s, eligibilityStatus: updated.eligibilityStatus }
            : s,
        ),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal update eligibility'
      alert(message)
    }
  }

  return (
    <div className="page">
      <h1>Dashboard Kepala Sekolah</h1>
      <p className="helper-text">
        Halaman ini digunakan Kepala Sekolah untuk memvalidasi kelayakan siswa (Eligibility) DAN
        menyetujui pilihan universitas siswa (Final Approval).
      </p>

      {/* TABEL 1: Verifikasi Eligibility Siswa */}
      <section className="section">
        <h2>1. Verifikasi Eligibility Siswa</h2>
        <p className="helper-text small">
          Tentukan siswa yang layak (Eligible) untuk masuk ke tahap pendaftaran universitas.
        </p>
        {loading ? (
          <p className="helper-text">Memuat data...</p>
        ) : dataSiswa.length === 0 ? (
          <p className="helper-text">Belum ada data siswa.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Email</th>
                <th>Rata-rata Rapor</th>
                <th>Status Saat Ini</th>
                <th>Aksi Persetujuan</th>
              </tr>
            </thead>
            <tbody>
              {dataSiswa.map((siswa) => (
                <tr key={siswa.userId}>
                  <td>{siswa.nama}</td>
                  <td>{siswa.email}</td>
                  <td>
                    <strong>{siswa.rataRata ? siswa.rataRata.toFixed(2) : '0.00'}</strong>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        siswa.eligibilityStatus === 'ELIGIBLE'
                          ? 'status-diterima'
                          : siswa.eligibilityStatus === 'TIDAK_ELIGIBLE'
                          ? 'status-ditolak'
                          : 'status-menunggu'
                      }`}
                    >
                      {siswa.eligibilityStatus === 'MENUNGGU_BK'
                        ? 'Menunggu BK'
                        : siswa.eligibilityStatus === 'MENUNGGU_KEPSEK'
                        ? 'Menunggu Kepsek'
                        : siswa.eligibilityStatus === 'ELIGIBLE'
                        ? 'Eligible (Disetujui)'
                        : 'Tidak Eligible'}
                    </span>
                  </td>
                  <td>
                    {siswa.eligibilityStatus === 'MENUNGGU_KEPSEK' && (
                      <div className="status-actions">
                        <button
                          className="btn primary btn-inline"
                          onClick={() => handleUpdateEligibility(siswa.userId, 'ELIGIBLE')}
                        >
                          Setujui (Eligible)
                        </button>
                        <button
                          className="btn secondary btn-inline"
                          onClick={() => handleUpdateEligibility(siswa.userId, 'TIDAK_ELIGIBLE')}
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                    {siswa.eligibilityStatus === 'MENUNGGU_BK' && (
                      <span className="text-muted text-small">Menunggu verifikasi BK</span>
                    )}
                    {(siswa.eligibilityStatus === 'ELIGIBLE' ||
                      siswa.eligibilityStatus === 'TIDAK_ELIGIBLE') && (
                      <span className="text-muted">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Section ringkas untuk mengunduh hasil seleksi (tanpa verifikasi ulang oleh Kepsek) */}
      <section className="section" style={{ marginTop: '3rem' }}>
        <h2>2. Hasil Seleksi Nasional</h2>
        <p className="helper-text small">
          Kepala Sekolah dapat mengunduh rekap hasil seleksi yang sudah diputuskan Admin.
        </p>
        <button
          type="button"
          className="btn secondary"
          onClick={() => window.open('http://localhost:4000/admin/seleksi/download', '_blank')}
        >
          Download Hasil Seleksi (CSV)
        </button>
      </section>
    </div>
  )
}

export default KepsekDashboard
