import { Request, Response } from "express";
import { prisma } from "../config/prisma";

const toDto = (p: any, email: string) => {
  const year = p.createdAt.getFullYear()
  const idStr = String(p.id).padStart(4, "0")
  const nomorPendaftaran = `SNBP-${year}-${idStr}`

  return {
    id: p.id,
    nomorPendaftaran,
    email,
    nama: p.siswa?.nama ?? undefined,
    prodi1: p.prodi1Name,
    prodi2: p.prodi2Name ?? undefined,
    status: p.status as "MENUNGGU" | "DITERIMA" | "DITOLAK",
    tanggal: p.createdAt.toISOString().slice(0, 10),
    dikirimKeKepsek: p.dikirimKeKepsek,
    kepsekStatus: p.kepsekStatus,
    kepsekAlasan: p.kepsekAlasan,
    // Tambahan data profil
    kabupaten: p.siswa?.kabupaten ?? undefined,
    provinsi: p.siswa?.provinsi ?? undefined,
    sekolah: p.siswa?.sekolah ?? undefined, // Pastikan sekolah juga dikirim
  }
}

export const createPendaftaran = async (req: Request, res: Response) => {
  const { email, prodi1, prodi2 } = req.body as {
    email?: string;
    prodi1?: string;
    prodi2?: string;
  };

  if (!email || !prodi1) {
    return res.status(400).json({ message: "Email dan prodi1 wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const siswa = await prisma.siswaProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        nama: user.email.split("@")[0],
      },
    });

    // Cegah siswa membuat lebih dari satu pendaftaran
    const existingPendaftaran = await prisma.pendaftaran.findFirst({
      where: { siswaId: siswa.id },
    });

    if (existingPendaftaran) {
      return res.status(400).json({
        message: "Anda sudah memiliki pendaftaran SNBP. Pendaftaran tidak dapat diubah lagi.",
      });
    }

    const autoApprovedByKepsek = siswa.eligibilityStatus === 'ELIGIBLE'

    const p = await prisma.pendaftaran.create({
      data: {
        siswaId: siswa.id,
        prodi1Name: prodi1,
        prodi2Name: prodi2 || null,
        dikirimKeKepsek: autoApprovedByKepsek,
        kepsekStatus: autoApprovedByKepsek ? 'DISETUJUI' : null,
      },
      include: { siswa: true },
    });

    return res.status(201).json({
      message: "Pendaftaran berhasil disimpan",
      data: toDto(p, user.email),
    });
  } catch (error) {
    console.error("Error createPendaftaran", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const listPendaftaranByEmail = async (req: Request, res: Response) => {
  const email = String(req.query.email || "");

  if (!email) {
    return res.status(400).json({ message: "Parameter email wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ data: [] });
    }

    const siswa = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!siswa) {
      return res.json({ data: [] });
    }

    const list = await prisma.pendaftaran.findMany({
      where: { siswaId: siswa.id },
      orderBy: { createdAt: "desc" },
      include: { siswa: true },
    });

    return res.json({ data: list.map((p) => toDto(p, user.email)) });
  } catch (error) {
    console.error("Error listPendaftaranByEmail", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const listAllPendaftaran = async (_req: Request, res: Response) => {
  try {
    const list = await prisma.pendaftaran.findMany({
      include: { siswa: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    const data = list.map((p) => toDto(p, p.siswa.user.email));
    return res.json({ data });
  } catch (error) {
    console.error("Error listAllPendaftaran", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const cekPengumumanByNomor = async (req: Request, res: Response) => {
  const nomor = String(req.query.nomor || "")
  const tglLahir = String(req.query.tglLahir || "") // format yyyy-mm-dd dari input type="date"

  // Format SNBP-YYYY-XXXX. Ambil ID dari 4 digit terakhir
  const parts = nomor.split('-')
  const idStr = parts[parts.length - 1]
  const id = parseInt(idStr)

  if (!nomor || isNaN(id)) {
    return res.status(400).json({ message: "Nomor pendaftaran tidak valid" })
  }

  if (!tglLahir) {
    return res.status(400).json({ message: "Tanggal lahir wajib diisi" })
  }

  try {
    const p = await prisma.pendaftaran.findUnique({
      where: { id },
      include: { siswa: { include: { user: true } } },
    })

    if (!p) {
      return res.status(404).json({ message: "Data pendaftaran tidak ditemukan" })
    }

    // Verifikasi apakah tahunnya cocok (opsional, tapi bagus untuk validasi)
    const year = p.createdAt.getFullYear()
    const generatedNomor = `SNBP-${year}-${String(p.id).padStart(4, "0")}`

    if (generatedNomor !== nomor) {
      return res.status(404).json({ message: "Data pendaftaran tidak ditemukan (Nomor tidak cocok)" })
    }

    // Validasi tanggal lahir dengan profil siswa (dibandingkan pada level yyyy-mm-dd)
    const tanggalProfil = p.siswa.tanggalLahir
    if (!tanggalProfil) {
      return res.status(400).json({ message: "Tanggal lahir di profil belum diisi" })
    }

    const profilDateStr = tanggalProfil.toISOString().slice(0, 10) // yyyy-mm-dd
    if (profilDateStr !== tglLahir) {
      return res.status(400).json({ message: "Tanggal lahir tidak sesuai dengan data profil" })
    }

    return res.json({ data: toDto(p, p.siswa.user.email) })
  } catch (error) {
    console.error("Error cekPengumumanByNomor", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
