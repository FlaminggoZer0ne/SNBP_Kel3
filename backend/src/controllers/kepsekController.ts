import type { Request, Response } from "express"
import { prisma } from "../config/prisma"

const toDto = (p: any, email: string) => ({
  id: p.id,
  email,
  prodi1: p.prodi1Name,
  prodi2: p.prodi2Name ?? undefined,
  status: p.status as "MENUNGGU" | "DITERIMA" | "DITOLAK",
  tanggal: p.createdAt.toISOString().slice(0, 10),
  dikirimKeKepsek: p.dikirimKeKepsek as boolean,
  kepsekStatus: p.kepsekStatus as "BELUM_DITINJAU" | "DISETUJUI" | "DITOLAK" | null,
  kepsekAlasan: p.kepsekAlasan as string | null,
})

export async function listPendaftaranKepsek(_req: Request, res: Response) {
  try {
    const list = await prisma.pendaftaran.findMany({
      // Hapus filter dikirimKeKepsek: true agar semua pendaftaran muncul
      include: { siswa: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    })

    const data = list.map((p) => toDto(p, p.siswa.user.email))
    return res.json({ data })
  } catch (error) {
    console.error("Error listPendaftaranKepsek", error)
    return res.status(500).json({ message: "Terjadi kesalahan pada server" })
  }
}

export async function updatePendaftaranKepsek(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { kepsekStatus, kepsekAlasan } = req.body as {
    kepsekStatus?: "DISETUJUI" | "DITOLAK" | "BELUM_DITINJAU"
    kepsekAlasan?: string
  }

  if (!id || !kepsekStatus) {
    return res.status(400).json({ message: "ID dan status kepala sekolah wajib diisi" })
  }

  if (kepsekStatus === "DITOLAK" && !kepsekAlasan) {
    return res
      .status(400)
      .json({ message: "Alasan wajib diisi jika siswa tidak disetujui oleh kepala sekolah" })
  }

  try {
    const updated = await prisma.pendaftaran.update({
      where: { id },
      data: {
        dikirimKeKepsek: true, // Otomatis set true saat Kepsek melakukan aksi
        kepsekStatus,
        kepsekAlasan: kepsekStatus === "DITOLAK" ? kepsekAlasan : null,
      },
      include: { siswa: { include: { user: true } } },
    })

    return res.json({ data: toDto(updated, updated.siswa.user.email) })
  } catch (error) {
    console.error("Error updatePendaftaranKepsek", error)
    return res.status(500).json({ message: "Terjadi kesalahan pada server" })
  }
}

export async function updateEligibilityKepsek(req: Request, res: Response) {
  const userId = Number(req.params.userId)
  const { status } = req.body as { status?: "ELIGIBLE" | "TIDAK_ELIGIBLE" }

  if (!userId || !status) {
    return res.status(400).json({ message: 'userId dan status wajib diisi' })
  }

  try {
    const profil = await prisma.siswaProfile.findUnique({ where: { userId } })
    if (!profil) {
      return res.status(404).json({ message: 'Profil siswa tidak ditemukan' })
    }

    if (profil.eligibilityStatus !== 'MENUNGGU_KEPSEK') {
      return res
        .status(400)
        .json({ message: 'Hanya siswa dengan status MENUNGGU_KEPSEK yang dapat divalidasi kepala sekolah' })
    }

    const updated = await prisma.siswaProfile.update({
      where: { userId },
      data: { eligibilityStatus: status },
    })

    // Jika kepala sekolah menyetujui siswa (ELIGIBLE), semua pendaftaran siswa ini
    // otomatis dianggap sudah disetujui kepsek dan siap diproses Admin
    if (status === 'ELIGIBLE') {
      await prisma.pendaftaran.updateMany({
        where: { siswaId: updated.id },
        data: {
          dikirimKeKepsek: true,
          kepsekStatus: 'DISETUJUI',
        },
      })
    }

    return res.json({
      data: {
        userId: updated.userId,
        eligibilityStatus: updated.eligibilityStatus,
      },
    })
  } catch (error) {
    console.error('Error updateEligibilityKepsek', error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' })
  }
}

export async function listSiswaKepsek(_req: Request, res: Response) {
  try {
    const list = await prisma.siswaProfile.findMany({
      include: {
        user: true,
        nilaiRapor: true,
      },
      orderBy: { nama: "asc" },
    });

    const SEMESTERS = [1, 2, 3, 4, 5];

    const data = list.map((s) => {
      const nilaiList = s.nilaiRapor || [];

      // Kelompokkan nilai per semester
      const perSemester: Record<number, { total: number; count: number }> = {};
      for (const n of nilaiList) {
        const sem = n.semester;
        if (!perSemester[sem]) {
          perSemester[sem] = { total: 0, count: 0 };
        }
        perSemester[sem].total += n.nilai;
        perSemester[sem].count += 1;
      }

      let sumSemesterAverage = 0;

      SEMESTERS.forEach((sem) => {
        const info = perSemester[sem];
        if (info && info.count > 0) {
          const avg = info.total / info.count;
          sumSemesterAverage += avg;
        } else {
          // Semester ini belum diisi sama sekali -> dianggap 0
          // tidak menambah apa-apa ke sumSemesterAverage
        }
      });

      const rataRata = SEMESTERS.length > 0 ? sumSemesterAverage / SEMESTERS.length : 0;

      return {
        userId: s.userId,
        nama: s.nama,
        email: s.user.email,
        eligibilityStatus: s.eligibilityStatus,
        rataRata,
      };
    });

    return res.json({ data });
  } catch (error) {
    console.error("Error listSiswaKepsek", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
