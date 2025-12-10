import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

const toDto = (p: any, email: string) => {
  const nilaiList = (p.siswa?.nilaiRapor ?? []) as { nilai: number }[];
  const rataRata = nilaiList.length
    ? nilaiList.reduce((sum, n) => sum + n.nilai, 0) / nilaiList.length
    : null;

  return {
    id: p.id,
    email,
    status: p.status as "MENUNGGU" | "DITERIMA" | "DITOLAK",
    tanggal: p.createdAt.toISOString().slice(0, 10),
    rataRata,
  };
};

export async function listPendaftaranBK(_req: Request, res: Response) {
  try {
    const list = await prisma.pendaftaran.findMany({
      include: { siswa: { include: { user: true, nilaiRapor: true } } },
      orderBy: { createdAt: "desc" },
    });

    const data = list.map((p) => toDto(p, p.siswa.user.email));
    return res.json({ data });
  } catch (error) {
    console.error("Error listPendaftaranBK", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function updateStatusPendaftaranBK(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: "MENUNGGU" | "DITERIMA" | "DITOLAK" };

  if (!id || !status) {
    return res.status(400).json({ message: "ID dan status wajib diisi" });
  }

  try {
    const updated = await prisma.pendaftaran.update({
      where: { id },
      data: { status },
      include: { siswa: { include: { user: true, nilaiRapor: true } } },
    });

    return res.json({ data: toDto(updated, updated.siswa.user.email) });
  } catch (error) {
    console.error("Error updateStatusPendaftaranBK", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function deletePendaftaranBK(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "ID wajib diisi" });
  }

  try {
    await prisma.pendaftaran.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deletePendaftaranBK", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function kirimKeKepsekBK(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "ID wajib diisi" });
  }

  try {
    const pendaftaran = await prisma.pendaftaran.findUnique({ where: { id } });
    if (!pendaftaran) {
      return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
    }

    if (pendaftaran.status !== "DITERIMA") {
      return res
        .status(400)
        .json({ message: "Hanya pendaftaran dengan status DITERIMA yang dapat dikirim ke kepala sekolah" });
    }

    const updated = await prisma.pendaftaran.update({
      where: { id },
      data: {
        dikirimKeKepsek: true,
        kepsekStatus: "BELUM_DITINJAU",
      },
      include: { siswa: { include: { user: true, nilaiRapor: true } } },
    });

    return res.json({ data: toDto(updated, updated.siswa.user.email) });
  } catch (error) {
    console.error("Error kirimKeKepsekBK", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function updateEligibilityBK(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const { status } = req.body as { status?: "MENUNGGU_KEPSEK" | "TIDAK_ELIGIBLE" };

  if (!userId || !status) {
    return res.status(400).json({ message: "userId dan status wajib diisi" });
  }

  try {
    const profil = await prisma.siswaProfile.findUnique({ where: { userId } });
    if (!profil) {
      return res.status(404).json({ message: "Profil siswa tidak ditemukan" });
    }

    if (profil.eligibilityStatus !== "MENUNGGU_BK") {
      return res.status(400).json({ message: "Hanya siswa dengan status MENUNGGU_BK yang dapat diubah oleh Guru BK" });
    }

    const updated = await prisma.siswaProfile.update({
      where: { userId },
      data: { eligibilityStatus: status },
    });

    return res.json({
      data: {
        userId: updated.userId,
        eligibilityStatus: updated.eligibilityStatus,
      },
    });
  } catch (error) {
    console.error("Error updateEligibilityBK", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function listSiswaBK(_req: Request, res: Response) {
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
      const missingSemesters: number[] = [];

      SEMESTERS.forEach((sem) => {
        const info = perSemester[sem];
        if (info && info.count > 0) {
          const avg = info.total / info.count;
          sumSemesterAverage += avg;
        } else {
          // Semester ini belum diisi sama sekali -> dianggap 0
          missingSemesters.push(sem);
          // tambahkan 0 ke sumSemesterAverage (tidak perlu melakukan apa-apa)
        }
      });

      const rataRata = SEMESTERS.length > 0 ? sumSemesterAverage / SEMESTERS.length : 0;

      return {
        userId: s.userId,
        nama: s.nama,
        email: s.user.email,
        eligibilityStatus: s.eligibilityStatus,
        rataRata,
        missingSemesters,
      };
    });

    return res.json({ data });
  } catch (error) {
    console.error("Error listSiswaBK", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
