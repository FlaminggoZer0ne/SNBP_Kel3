import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

function hitungSkor(nilaiRapor: { nilai: number }[], prestasi: unknown[]) {
  if (!nilaiRapor.length) return 0;
  const rataNilai = nilaiRapor.reduce((sum, n) => sum + n.nilai, 0) / nilaiRapor.length;
  const bonusPrestasi = prestasi.length * 2;
  return Math.min(100, rataNilai * 0.7 + bonusPrestasi);
}

function kategoriPeluang(skor: number) {
  if (skor >= 80) return "Tinggi";
  if (skor >= 60) return "Sedang";
  if (skor > 0) return "Rendah";
  return "Belum ada data";
}

export async function simulasiPeluang(req: Request, res: Response) {
  const { email, prodi1, prodi2 } = req.body as {
    email?: string;
    prodi1?: string;
    prodi2?: string;
  };

  if (!email) {
    return res.status(400).json({ message: "Email wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const siswa = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!siswa) {
      return res.json({
        skor: 0,
        kategori: kategoriPeluang(0),
        prodi1: prodi1 || "",
        prodi2: prodi2 || "",
      });
    }

    const nilaiRapor = await prisma.nilaiRapor.findMany({ where: { siswaId: siswa.id } });
    const prestasi = await prisma.prestasi.findMany({ where: { siswaId: siswa.id } });

    const skor = hitungSkor(nilaiRapor, prestasi);
    const kategori = kategoriPeluang(skor);

    return res.json({
      skor,
      kategori,
      prodi1: prodi1 || "",
      prodi2: prodi2 || "",
    });
  } catch (error) {
    console.error("Error simulasiPeluang", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
