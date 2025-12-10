import { useEffect, useState, type FormEvent } from 'react'
import './pages.css'
import {
  apiGetNilai,
  apiGetPrestasi,
  apiTambahNilai,
  apiTambahPrestasi,
  apiDeleteNilaiBySemester,
  apiGetEligibilityStatus,
  type NilaiRaporApiItem,
  type PrestasiApiItem,
} from '../services/api'

interface NilaiPrestasiProps {
  email: string
}

function NilaiPrestasi({ email }: NilaiPrestasiProps) {
  const MAPEL_WAJIB = [
    { key: 'matematika', label: 'Matematika' },
    { key: 'fisika', label: 'Fisika' },
    { key: 'kimia', label: 'Kimia' },
    { key: 'biologi', label: 'Biologi' },
    { key: 'matematika_peminatan', label: 'Matematika Peminatan' },
    { key: 'agama', label: 'Agama' },
    { key: 'ppkn', label: 'PPKN' },
    { key: 'bindo', label: 'Bahasa Indonesia' },
  ] as const

  const [nilaiRapor, setNilaiRapor] = useState<NilaiRaporApiItem[]>([])
  const [prestasi, setPrestasi] = useState<PrestasiApiItem[]>([])
  const [selectedSemester, setSelectedSemester] = useState<number>(1)
  const [isEditingSemester, setIsEditingSemester] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      apiGetNilai(email),
      apiGetPrestasi(email),
      apiGetEligibilityStatus(email),
    ])
      .then(([nilai, prestasiList, status]) => {
        if (isMounted) {
          setNilaiRapor(nilai)
          setPrestasi(prestasiList)
          // Jika status BUKAN MENUNGGU_BK, artinya sudah diproses BK/Kepsek -> Dikunci
          setIsLocked(status !== 'MENUNGGU_BK')
        }
      })
      .catch((err: unknown) => {
        console.error(err)
      })

    return () => {
      isMounted = false
    }
  }, [email])

  const handleEditSemester = () => {
    if (isLocked) return
    const form = document.querySelector<HTMLFormElement>('form.form-nilai')
    if (!form) return

    const semesterInput = form.querySelector<HTMLInputElement>('input[name="semester"]')
    if (semesterInput) {
      semesterInput.value = String(selectedSemester)
    }

    // Prefill setiap input mapel dengan nilai yang sudah ada untuk semester ini
    MAPEL_WAJIB.forEach((m) => {
      const existing = nilaiRapor.find(
        (n) => n.semester === selectedSemester && n.mataPelajaran === m.label,
      )
      const nilaiInput = form.querySelector<HTMLInputElement>(`input[name="nilai_${m.key}"]`)
      if (nilaiInput) {
        nilaiInput.value = existing ? String(existing.nilai) : ''
      }
    })

    setIsEditingSemester(true)
  }

  const handleTambahNilai = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLocked) return

    const formEl = e.currentTarget
    const formData = new FormData(formEl)
    const semester = Number(formData.get('semester') || 0)
    if (!semester) {
      alert('Semester wajib diisi')
      return
    }

    // Kumpulkan semua nilai yang diisi untuk mapel wajib
    const items: { label: string; nilai: number }[] = []
    MAPEL_WAJIB.forEach((m) => {
      const raw = formData.get(`nilai_${m.key}`)
      if (raw != null && String(raw).trim() !== '') {
        const v = Number(raw)
        if (!Number.isNaN(v)) {
          items.push({ label: m.label, nilai: v })
        }
      }
    })

    if (items.length === 0) {
      alert('Isi minimal satu nilai mata pelajaran')
      return
    }

    try {
      // Hapus semua nilai yang sudah ada untuk semester ini di server,
      // supaya tidak ada data ganda.
      await apiDeleteNilaiBySemester(email, semester)

      const created: NilaiRaporApiItem[] = []
      for (const item of items) {
        const record = await apiTambahNilai(email, semester, item.label, item.nilai)
        created.push(record)
      }

      setNilaiRapor((prev) => [
        ...prev.filter((n) => n.semester !== semester),
        ...created,
      ])
      formEl.reset()
      setIsEditingSemester(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan nilai'
      alert(message)
    }
  }

  const handleTambahPrestasi = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLocked) return

    const formEl = e.currentTarget
    const formData = new FormData(formEl)
    const nama = String(formData.get('nama') || '')
    const tingkat = String(formData.get('tingkat') || '')
    const tahunRaw = formData.get('tahun')
    const tahun = tahunRaw ? Number(tahunRaw) : undefined

    if (!nama) {
      alert('Nama prestasi wajib diisi')
      return
    }

    try {
      const record = await apiTambahPrestasi(email, nama, tingkat || undefined, tahun)
      setPrestasi((prev) => [...prev, record])
      formEl.reset()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan prestasi'
      alert(message)
    }
  }

  return (
    <div className="page">
      <h1>Nilai Rapor & Prestasi</h1>

      {isLocked && (
        <div className="alert-warning" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', color: '#856404' }}>
          <strong>Status Terkunci:</strong> Data nilai dan prestasi Anda sudah diverifikasi oleh Guru BK. Anda tidak dapat mengubah data ini lagi.
        </div>
      )}

      <div className="two-columns">
        <section>
          <h2>Tambah Nilai Rapor</h2>
          <div className="card">
            <form className="form form-nilai" onSubmit={handleTambahNilai}>
              <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="form-control">
                  <label>Semester</label>
                  <input
                    type="number"
                    name="semester"
                    min={1}
                    max={5}
                    defaultValue={selectedSemester}
                    onChange={(e) => setSelectedSemester(Number(e.target.value) || 1)}
                    disabled={isLocked}
                  />
                </div>
                <div className="form-grid-2">
                  {MAPEL_WAJIB.map((m) => (
                    <div key={m.key} className="form-control">
                      <label>{m.label}</label>
                      <input
                        type="number"
                        name={`nilai_${m.key}`}
                        min={0}
                        max={100}
                        step={0.01}
                        disabled={isLocked}
                      />
                    </div>
                  ))}
                </div>
                <div className="form-actions">
                  <button className="btn primary" type="submit" disabled={isLocked}>
                    {isEditingSemester ? 'Simpan Perubahan Semester' : 'Simpan Nilai Semester'}
                  </button>
                  <button
                    type="button"
                    className="btn secondary btn-inline"
                    onClick={handleEditSemester}
                    disabled={isLocked}
                  >
                    Edit Semester Ini
                  </button>
                </div>
              </fieldset>
              <p className="helper-text small">
                Isi nilai untuk semua mata pelajaran wajib agar sistem bisa mengecek kelayakan SNBP.
              </p>
            </form>
          </div>
          <h3>Daftar Nilai</h3>
          {nilaiRapor.filter((n) => n.semester === selectedSemester).length === 0 ? (
            <p className="helper-text small">Belum ada nilai yang tersimpan.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Mata Pelajaran</th>
                  <th>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {nilaiRapor
                  .filter((n) => n.semester === selectedSemester)
                  .map((n) => (
                  <tr key={n.id}>
                    <td>{n.semester}</td>
                    <td>{n.mataPelajaran}</td>
                    <td>{n.nilai}</td>
                  </tr>
                  ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2>Tambah Prestasi</h2>
          <div className="card">
            <form className="form" onSubmit={handleTambahPrestasi}>
              <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="form-control">
                  <label>Nama Prestasi</label>
                  <input type="text" name="nama" disabled={isLocked} />
                </div>
                <div className="form-control">
                  <label>Tingkat</label>
                  <input
                    type="text"
                    name="tingkat"
                    placeholder="Kota/Provinsi/Nasional"
                    disabled={isLocked}
                  />
                </div>
                <div className="form-control">
                  <label>Tahun</label>
                  <input type="number" name="tahun" disabled={isLocked} />
                </div>
                <div className="form-actions">
                  <button className="btn primary" type="submit" disabled={isLocked}>
                    Tambah Prestasi
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
          <h3>Daftar Prestasi</h3>
          <ul className="list">
            {prestasi.map((p) => (
              <li key={p.id}>
                {p.nama} {p.tingkat ? `- ${p.tingkat}` : ''} {p.tahun ? `(${p.tahun})` : ''}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default NilaiPrestasi
