import './pages.css'

interface TidakEligibleProps {
  nama?: string | null
}

function TidakEligible({ nama }: TidakEligibleProps) {
  return (
    <div className="page">
      <h1>Anda Tidak Termasuk Siswa Eligible SNBP</h1>
      <p className="helper-text">
        {nama ? `Halo, ${nama}.` : 'Halo.'} Berdasarkan penilaian Guru BK dan validasi Kepala
        Sekolah, Anda belum termasuk ke dalam daftar siswa eligible SNBP.
      </p>
      <p className="helper-text">
        Anda masih dapat memperbarui <strong>profil</strong> dan <strong>nilai rapor</strong> jika
        diperlukan, namun menu pendaftaran SNBP tidak tersedia.
      </p>

      <div className="grid">
        <a href="/profil" className="card-link">
          <div className="card">
            <h2>Profil Siswa</h2>
            <p>Perbarui data profil Anda jika ada perubahan.</p>
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

export default TidakEligible
