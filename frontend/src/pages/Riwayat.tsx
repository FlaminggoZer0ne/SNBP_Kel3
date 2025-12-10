import { useEffect, useState } from 'react'
import './pages.css'
import type { PendaftaranItem } from '../services/api'
import { apiGetRiwayatPendaftaran } from '../services/api'

interface RiwayatProps {
  email: string
}

function Riwayat({ email }: RiwayatProps) {
  const [riwayat, setRiwayat] = useState<PendaftaranItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await apiGetRiwayatPendaftaran(email)
        setRiwayat(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [email])

  const renderStatusKepsek = (item: PendaftaranItem) => {
    if (!item.dikirimKeKepsek) return '-'
    if (item.kepsekStatus === 'DISETUJUI') {
      return <span className="status-pill status-diterima">Disetujui Kepsek</span>
    }
    if (item.kepsekStatus === 'DITOLAK') {
      return (
        <div>
          <span className="status-pill status-ditolak">Ditolak Kepsek</span>
          {item.kepsekAlasan && <div className="text-small text-muted" style={{ marginTop: '0.25rem' }}>Alasan: {item.kepsekAlasan}</div>}
        </div>
      )
    }
    return <span className="status-pill status-menunggu">Menunggu Kepsek</span>
  }

  return (
    <div className="page">
      <h1>Riwayat Pendaftaran</h1>
      {loading ? (
        <p className="helper-text">Memuat riwayat...</p>
      ) : riwayat.length === 0 ? (
        <p className="helper-text">Belum ada pendaftaran yang tercatat.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nomor Pendaftaran</th>
              <th>Tanggal</th>
              <th>Prodi 1</th>
              <th>Prodi 2</th>
              <th>Status BK</th>
              <th>Status Akhir (Kepsek)</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.nomorPendaftaran || '-'}</strong>
                </td>
                <td>{item.tanggal}</td>
                <td>{item.prodi1}</td>
                <td>{item.prodi2 || '-'}</td>
                <td>
                  <span
                    className={
                      item.status === 'DITERIMA'
                        ? 'status-pill status-diterima'
                        : item.status === 'DITOLAK'
                        ? 'status-pill status-ditolak'
                        : 'status-pill status-menunggu'
                    }
                  >
                    {item.status === 'MENUNGGU'
                      ? 'Menunggu Verifikasi'
                      : item.status === 'DITERIMA'
                      ? 'Diterima BK'
                      : 'Ditolak BK'}
                  </span>
                </td>
                <td>{renderStatusKepsek(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Riwayat
