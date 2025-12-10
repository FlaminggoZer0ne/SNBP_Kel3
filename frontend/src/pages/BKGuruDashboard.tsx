import { useEffect, useState } from 'react'
import './pages.css'
import type { SiswaItem } from '../services/api'
import { apiBkGetSiswa, apiBkUpdateEligibility } from '../services/api'

function BKGuruDashboard() {
  const [dataSiswa, setDataSiswa] = useState<SiswaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const siswa = await apiBkGetSiswa()
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
    status: 'MENUNGGU_KEPSEK' | 'TIDAK_ELIGIBLE',
  ) => {
    const confirmMsg =
      status === 'MENUNGGU_KEPSEK'
        ? 'Nyatakan siswa ini LAYAK (Lolos ke Kepsek)?'
        : 'Nyatakan siswa ini TIDAK LAYAK (Tolak)?'

    if (!window.confirm(confirmMsg)) return

    try {
      const updated = await apiBkUpdateEligibility(userId, status)
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
      <h1>Dashboard Guru BK</h1>
      <p className="helper-text">
        Halaman ini digunakan Guru BK untuk memverifikasi nilai rapor siswa dan menentukan kelayakan
        (Eligibility) untuk mengikuti SNBP.
      </p>

      <section className="section">
        <h2>Daftar Siswa & Status Kelayakan</h2>
        {loading ? (
          <p className="helper-text">Memuat data...</p>
        ) : dataSiswa.length === 0 ? (
          <p className="helper-text">Belum ada data siswa yang masuk.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Email</th>
                <th>Rata-rata Rapor</th>
                <th>Semester Kosong</th>
                <th>Status Kelayakan</th>
                <th>Aksi Verifikasi</th>
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
                    {siswa.missingSemesters && siswa.missingSemesters.length > 0 ? (
                      <span className="text-small text-muted">
                        Semester belum diisi: {siswa.missingSemesters.join(', ')}
                      </span>
                    ) : (
                      <span className="text-small text-muted">Semua semester terisi</span>
                    )}
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
                        ? 'Eligible (Lolos)'
                        : 'Tidak Eligible'}
                    </span>
                  </td>
                  <td>
                    {siswa.eligibilityStatus === 'MENUNGGU_BK' && (
                      <div className="status-actions">
                        <button
                          className="btn primary btn-inline"
                          onClick={() => handleUpdateEligibility(siswa.userId, 'MENUNGGU_KEPSEK')}
                        >
                          Loloskan
                        </button>
                        <button
                          className="btn secondary btn-inline"
                          onClick={() => handleUpdateEligibility(siswa.userId, 'TIDAK_ELIGIBLE')}
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                    {siswa.eligibilityStatus !== 'MENUNGGU_BK' && (
                      <span className="text-muted">Sudah Diverifikasi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default BKGuruDashboard
