import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSelectionResultEmail } from "../services/mailer";

// Fungsi helper untuk menghitung skor kecocokan (Simulasi AI sederhana)
// Logika: Rata-rata nilai rapor + bobot random sedikit (simulasi persaingan)
const hitungKecocokan = (rataRata: number, namaProdi: string): number => {
  if (!namaProdi) return 0;
  
  // Base score dari rata-rata
  let score = rataRata;

  // Penyesuaian berdasarkan prodi (Simulasi passing grade)
  const prodiSulit = ['kedokteran', 'informatika', 'ilmu komputer', 'teknik sipil'];
  const isSulit = prodiSulit.some(p => namaProdi.toLowerCase().includes(p));

  if (isSulit) {
    // Prodi sulit butuh nilai lebih tinggi, jadi persentase kecocokan lebih ketat
    // Misal nilai 90 di prodi sulit = 80% cocok. Nilai 90 di prodi biasa = 95% cocok.
    score = score - 10; 
  }

  // Cap max 100, min 0
  return Math.min(Math.max(score, 0), 100);
};

const toDto = (p: any, email: string) => {
    // Hitung rata-rata nilai
    const nilaiList = p.siswa.nilaiRapor || [];
    const rataRata = nilaiList.length
      ? nilaiList.reduce((sum: number, n: any) => sum + n.nilai, 0) / nilaiList.length
      : 0;

    const cocok1 = hitungKecocokan(rataRata, p.prodi1Name);
    const cocok2 = p.prodi2Name ? hitungKecocokan(rataRata, p.prodi2Name) : 0;

    return {
        id: p.id,
        email,
        nama: p.siswa.nama,
        sekolah: p.siswa.sekolah,
        rataRata: parseFloat(rataRata.toFixed(2)),
        prodi1: p.prodi1Name,
        prodi2: p.prodi2Name,
        persentase1: parseFloat(cocok1.toFixed(1)),
        persentase2: parseFloat(cocok2.toFixed(1)),
        status: p.status,
        nomorPendaftaran: `SNBP-${p.createdAt.getFullYear()}-${String(p.id).padStart(4, "0")}`
    };
};

export const getSeleksiNasional = async (req: Request, res: Response) => {
  try {
    // Admin hanya melihat siswa yang:
    // 1. Sudah mendaftar (ada di tabel Pendaftaran)
    // 2. Disetujui Kepala Sekolah (kepsekStatus = DISETUJUI)
    // 3. Belum diproses Admin (status = MENUNGGU) atau sudah (untuk history)
    
    // Kita filter yang MENUNGGU dulu untuk tab "Perlu Tindakan"
    const list = await prisma.pendaftaran.findMany({
      where: {
        kepsekStatus: 'DISETUJUI',
      },
      include: {
        siswa: {
          include: {
            user: true,
            nilaiRapor: true // Perlu nilai rapor untuk hitung statistik
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = list.map((p) => toDto(p, p.siswa.user.email));
    return res.json({ data });
  } catch (error) {
    console.error("Error getSeleksiNasional", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const prosesSeleksiAdmin = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status, pilihanDiterima } = req.body; 
    // status: 'DITERIMA' | 'DITOLAK'
    // pilihanDiterima: 1 | 2 (Jika diterima, di prodi mana?)

    if (!id || !status) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
        const pendaftaran = await prisma.pendaftaran.findUnique({
            where: { id },
            include: { siswa: { include: { user: true } } },
        });
        if (!pendaftaran) {
            return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
        }

        let updateData: any = { status };

        // Logika: Jika diterima di Pilihan 2, kita update prodi1 menjadi prodi2
        // supaya di pengumuman (yang biasanya ambil prodi1 sebagai hasil utama) muncul benar.
        // Ini hack sederhana tanpa ubah schema DB.
        if (status === 'DITERIMA' && pilihanDiterima === 2 && pendaftaran.prodi2Name) {
            updateData.prodi1Name = pendaftaran.prodi2Name;
            updateData.prodi2Name = null; // Kosongkan pilihan 2 karena sudah jadi hasil utama
        } 
        // Jika diterima di Pilihan 1, tidak perlu ubah apa-apa selain status.

        const updated = await prisma.pendaftaran.update({
            where: { id },
            data: updateData
        });

        const nomorPendaftaran = `SNBP-${pendaftaran.createdAt.getFullYear()}-${String(pendaftaran.id).padStart(4, "0")}`
        const prodi = (updateData.prodi1Name || updated.prodi1Name) as string
        const emailSiswa = pendaftaran.siswa?.user?.email
        const namaSiswa = pendaftaran.siswa?.nama

        if (emailSiswa && (status === "DITERIMA" || status === "DITOLAK")) {
            console.log(
                `[prosesSeleksiAdmin] Trigger email to=${emailSiswa} status=${status} pendaftaranId=${pendaftaran.id}`
            );
            sendSelectionResultEmail({
                to: emailSiswa,
                nama: namaSiswa,
                status,
                nomorPendaftaran,
                prodi,
            }).catch((err) => {
                console.error("Gagal mengirim email notifikasi seleksi", err);
            });
        } else {
            console.log(
                `[prosesSeleksiAdmin] Skip email. emailSiswa=${emailSiswa ? "ada" : "tidak"} status=${status}`
            );
        }

        return res.json({ message: "Status seleksi berhasil disimpan", data: updated });

    } catch (error) {
        console.error("Error prosesSeleksiAdmin", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const downloadHasilSeleksiCsv = async (_req: Request, res: Response) => {
  try {
    const list = await prisma.pendaftaran.findMany({
      where: {
        // Ambil semua pendaftaran yang sudah diproses Admin
        // (status akhir DITERIMA atau DITOLAK)
        status: { not: 'MENUNGGU' },
      },
      include: {
        siswa: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const header = [
      'Nomor Pendaftaran',
      'Nama',
      'Email',
      'Sekolah',
      'Prodi Diterima',
      'Status Admin',
    ]

    const rows = list.map((p) => {
      const nomor = `SNBP-${p.createdAt.getFullYear()}-${String(p.id).padStart(4, '0')}`
      const prodi = p.prodi1Name
      return [
        nomor,
        p.siswa.nama,
        p.siswa.user.email,
        p.siswa.sekolah ?? '',
        prodi,
        p.status,
      ]
    })

    const csvLines = [
      header.join(','),
      ...rows.map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ]

    const csvContent = csvLines.join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="hasil-seleksi-snbp.csv"')
    return res.send(csvContent)
  } catch (error) {
    console.error('Error downloadHasilSeleksiCsv', error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' })
  }
};
