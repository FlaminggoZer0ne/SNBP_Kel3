import './pages.css'

interface MenungguPersetujuanProps {
  nama?: string | null
}

function MenungguPersetujuan({ nama }: MenungguPersetujuanProps) {
  return (
    <div className="page">
      <h1>Menunggu Persetujuan</h1>
      <p className="helper-text">
        {nama ? `Halo, ${nama}.` : 'Halo.'} Data profil dan nilai rapor Anda sudah kami terima.
      </p>
      <p className="helper-text">
        Saat ini Anda <strong>belum dapat mengakses pendaftaran SNBP</strong> karena masih menunggu
        persetujuan Guru BK dan Kepala Sekolah.
      </p>

      <div className="grid">
        <a href="/profil" className="card-link">
          <div className="card">
            <h2>Profil Siswa</h2>
            <p>Lihat dan perbarui data profil Anda jika ada yang perlu dikoreksi.</p>
          </div>
        </a>
        <a href="/nilai" className="card-link">
          <div className="card">
            <h2>Nilai &amp; Prestasi</h2>
            <p>Periksa kembali nilai rapor dan prestasi yang sudah Anda input.</p>
          </div>
        </a>
      </div>
    </div>
  )
}

export default MenungguPersetujuan
