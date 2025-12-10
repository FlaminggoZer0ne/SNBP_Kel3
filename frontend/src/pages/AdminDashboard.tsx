import { useEffect, useState } from 'react'
import './pages.css'
import type { SeleksiItem, HomeRole } from '../services/api'
import { apiAdminGetSeleksi, apiAdminProsesSeleksi, apiGetHomeContent, apiSaveHomeContent } from '../services/api'

function AdminDashboard() {
  const [data, setData] = useState<SeleksiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'MENUNGGU' | 'SELESAI'>('MENUNGGU')
  const [editingId, setEditingId] = useState<number | null>(null) // ID item yang sedang diedit ulang

  // State untuk pengaturan beranda
  const [homeRole, setHomeRole] = useState<HomeRole>('PUBLIC')
  const [homeForm, setHomeForm] = useState<{ title: string; subtitle: string }>({
    title: '',
    subtitle: '',
  })
  const [homeLoading, setHomeLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const items = await apiAdminGetSeleksi()
      setData(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const loadHomeContent = async (role: HomeRole) => {
    setHomeLoading(true)
    try {
      const content = await apiGetHomeContent(role)
      setHomeForm({ title: content.title, subtitle: content.subtitle })
    } catch (e) {
      console.error(e)
      setHomeForm({ title: '', subtitle: '' })
    } finally {
      setHomeLoading(false)
    }
  }

  useEffect(() => {
    loadHomeContent(homeRole)
  }, [homeRole])

  const handleProses = async (id: number, status: 'DITERIMA' | 'DITOLAK', pilihan?: 1 | 2) => {
    let msg = 'Apakah Anda yakin ingin '
    if (status === 'DITOLAK') {
      msg += 'MENOLAK siswa ini?'
    } else {
      msg += `MELULUSKAN siswa ini di Pilihan ${pilihan}?`
    }

    if (!window.confirm(msg)) return

    try {
      await apiAdminProsesSeleksi(id, status, pilihan)
      alert('Status berhasil disimpan')
      setEditingId(null) // Stop editing mode
      fetchData() // Refresh data dari server
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses'
      alert(message)
    }
  }

  // Filter data untuk tampilan
  const filteredData = data.filter((item) => {
    if (filterStatus === 'MENUNGGU') return item.status === 'MENUNGGU'
    return item.status !== 'MENUNGGU'
  })

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#28a745' // Hijau
    if (score >= 70) return '#ffc107' // Kuning
    return '#dc3545' // Merah
  }

  return (
    <div className="page">
      <h1>Dashboard Admin Pusat SNBP</h1>
      <p className="helper-text">
        Halaman seleksi nasional. Admin dapat melihat prediksi kecocokan dan menentukan kelulusan siswa.
      </p>

      <div className="tabs" style={{ marginBottom: '1rem' }}>
        <button
          className={`btn ${filterStatus === 'MENUNGGU' ? 'primary' : 'secondary'}`}
          onClick={() => setFilterStatus('MENUNGGU')}
          style={{ marginRight: '0.5rem' }}
        >
          Perlu Tindakan (Menunggu)
        </button>
        <button
          className={`btn ${filterStatus === 'SELESAI' ? 'primary' : 'secondary'}`}
          onClick={() => setFilterStatus('SELESAI')}
        >
          Riwayat Seleksi
        </button>
      </div>

      <section className="section">
        {loading ? (
          <p className="helper-text">Memuat data seleksi...</p>
        ) : filteredData.length === 0 ? (
          <p className="helper-text">Tidak ada data untuk kategori ini.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Nilai Rapor</th>
                <th style={{ width: '30%' }}>Pilihan 1</th>
                <th style={{ width: '30%' }}>Pilihan 2</th>
                <th>Aksi Seleksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.nama}</strong>
                    <br />
                    <span className="text-small text-muted">{item.sekolah}</span>
                    <br />
                    <span className="text-small text-muted">{item.nomorPendaftaran}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1.2rem' }}>{item.rataRata.toFixed(2)}</strong>
                  </td>
                  
                  {/* Pilihan 1 */}
                  <td>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>{item.prodi1}</strong>
                    </div>
                    <div>
                      Skor Kecocokan:{' '}
                      <span style={{ fontWeight: 'bold', color: getScoreColor(item.persentase1) }}>
                        {item.persentase1}%
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${item.persentase1}%`, backgroundColor: getScoreColor(item.persentase1) }}
                      ></div>
                    </div>
                  </td>

                  {/* Pilihan 2 */}
                  <td>
                    {item.prodi2 ? (
                      <>
                         <div style={{ marginBottom: '0.5rem' }}>
                          <strong>{item.prodi2}</strong>
                        </div>
                        <div>
                          Skor Kecocokan:{' '}
                          <span style={{ fontWeight: 'bold', color: getScoreColor(item.persentase2) }}>
                            {item.persentase2}%
                          </span>
                        </div>
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${item.persentase2}%`, backgroundColor: getScoreColor(item.persentase2) }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted">- Tidak memilih -</span>
                    )}
                  </td>

                  {/* Aksi */}
                  <td>
                    {item.status === 'MENUNGGU' || editingId === item.id ? (
                      <div className="status-actions vertical">
                        <button
                          className="btn primary btn-small"
                          onClick={() => handleProses(item.id, 'DITERIMA', 1)}
                          title="Luluskan di Pilihan 1"
                        >
                          Luluskan Pilihan 1
                        </button>
                        {item.prodi2 && (
                          <button
                            className="btn primary btn-small"
                            onClick={() => handleProses(item.id, 'DITERIMA', 2)}
                            title="Luluskan di Pilihan 2"
                            style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
                          >
                            Luluskan Pilihan 2
                          </button>
                        )}
                        <button
                          className="btn secondary btn-small"
                          onClick={() => handleProses(item.id, 'DITOLAK')}
                          style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }}
                        >
                          Tolak (Tidak Lulus)
                        </button>
                        {editingId === item.id && (
                             <button
                             className="btn secondary btn-small"
                             onClick={() => setEditingId(null)}
                             style={{ marginTop: '0.5rem' }}
                           >
                             Batal Edit
                           </button>
                        )}
                      </div>
                    ) : (
                      <div className="status-actions vertical">
                        <span
                          className={`status-pill ${
                            item.status === 'DITERIMA' ? 'status-diterima' : 'status-ditolak'
                          }`}
                        >
                          {item.status === 'DITERIMA' ? 'LULUS' : 'TIDAK LULUS'}
                        </span>
                        {item.status === 'DITERIMA' && (
                            <div className="text-small" style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>
                                Diterima di: <br/>
                                {item.prodi1} 
                                {/* Karena logika backend swap prodi1 jika lulus prodi2, maka prodi1 adalah yang diterima */}
                            </div>
                        )}
                        <button 
                            className="btn secondary btn-small"
                            style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                            onClick={() => setEditingId(item.id)}
                        >
                            Ubah Keputusan
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      
      {/* Pengaturan Konten Beranda */}
      <section className="section" style={{ marginTop: '3rem' }}>
        <h2>Pengaturan Konten Beranda</h2>
        <p className="helper-text small">
          Admin dapat mengubah judul dan deskripsi beranda untuk masing-masing role pengguna.
        </p>

        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="form" style={{ maxWidth: 640 }}>
            <div className="form-control">
              <label>Pilih Target Beranda</label>
              <select
                value={homeRole}
                onChange={(e) => setHomeRole(e.target.value as HomeRole)}
              >
                <option value="PUBLIC">Beranda Umum (Belum Login)</option>
                <option value="SISWA">Beranda Siswa</option>
                <option value="GURU_BK">Beranda Guru BK</option>
                <option value="KEPALA_SEKOLAH">Beranda Kepala Sekolah</option>
                <option value="ADMIN">Beranda Admin</option>
              </select>
            </div>

            {homeLoading ? (
              <p className="helper-text">Memuat konten beranda...</p>
            ) : (
              <form
                className="form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    await apiSaveHomeContent({
                      role: homeRole,
                      title: homeForm.title,
                      subtitle: homeForm.subtitle,
                    })
                    alert('Konten beranda berhasil disimpan')
                  } catch (err) {
                    const message =
                      err instanceof Error ? err.message : 'Gagal menyimpan konten beranda'
                    alert(message)
                  }
                }}
              >
                <div className="form-control">
                  <label>Judul Beranda</label>
                  <input
                    type="text"
                    value={homeForm.title}
                    onChange={(e) =>
                      setHomeForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-control">
                  <label>Deskripsi / Subtitle</label>
                  <textarea
                    value={homeForm.subtitle}
                    onChange={(e) =>
                      setHomeForm((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn primary">
                    Simpan Konten Beranda
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .progress-bar-bg {
          background-color: #e9ecef;
          border-radius: 4px;
          height: 8px;
          width: 100%;
          margin-top: 5px;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .status-actions.vertical {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .btn-small {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard
