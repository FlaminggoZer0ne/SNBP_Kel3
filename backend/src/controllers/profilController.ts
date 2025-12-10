import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

async function getOrCreateSiswaByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const siswa = await prisma.siswaProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      nama: user.email.split("@")[0],
      eligibilityStatus: "MENUNGGU_BK",
    },
  });

  return siswa;
}

export async function getEligibilityStatus(req: Request, res: Response) {
  const email = req.query.email as string | undefined;

  if (!email) {
    return res.status(400).json({ message: "Email wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const profil = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!profil) {
      return res.json({ data: null });
    }

    return res.json({
      data: {
        eligibilityStatus: profil.eligibilityStatus,
      },
    });
  } catch (error) {
    console.error("Error getEligibilityStatus", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function getProfil(req: Request, res: Response) {
  const email = String(req.query.email || "");
  if (!email) {
    return res.status(400).json({ message: "Parameter email wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ data: null });

    const profil = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    return res.json({ data: profil });
  } catch (error) {
    console.error("Error getProfil", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function deleteNilaiBySemester(req: Request, res: Response) {
  const { email, semester } = req.body as { email?: string; semester?: number };

  if (!email || !semester) {
    return res.status(400).json({ message: "Email dan semester wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const siswa = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!siswa) {
      return res.status(404).json({ message: "Profil siswa tidak ditemukan" });
    }

    await prisma.nilaiRapor.deleteMany({ where: { siswaId: siswa.id, semester } });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleteNilaiBySemester", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function updateProfil(req: Request, res: Response) {
  const { email, nama, nisn, sekolah, tempatLahir, tanggalLahir, npsn, namaOrangTua, alamat, kabupaten, provinsi } =
    req.body as {
      email?: string;
      nama?: string;
      nisn?: string;
      sekolah?: string;
      tempatLahir?: string;
      tanggalLahir?: string;
      npsn?: string;
      namaOrangTua?: string;
      alamat?: string;
      kabupaten?: string;
      provinsi?: string;
    };

  if (!email || !nama || !nisn || !sekolah) {
    return res.status(400).json({ message: "Email, nama, NISN, dan sekolah wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const data: any = {
      nama,
      nisn,
      sekolah,
    };

    if (tempatLahir !== undefined) data.tempatLahir = tempatLahir || null;
    if (tanggalLahir) data.tanggalLahir = new Date(tanggalLahir);
    if (npsn !== undefined) data.npsn = npsn || null;
    if (namaOrangTua !== undefined) data.namaOrangTua = namaOrangTua || null;
    if (alamat !== undefined) data.alamat = alamat || null;
    if (kabupaten !== undefined) data.kabupaten = kabupaten || null;
    if (provinsi !== undefined) data.provinsi = provinsi || null;

    const profil = await prisma.siswaProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });

    return res.json({ success: true, data: profil });
  } catch (error) {
    console.error("Error updateProfil", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function cekProfilLengkap(req: Request, res: Response) {
  const email = String(req.query.email || "");
  if (!email) {
    return res.status(400).json({ message: "Parameter email wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ lengkap: false });

    const profil = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!profil) return res.json({ lengkap: false });

    const lengkap = !!(profil.nama && profil.nisn && profil.sekolah);

    return res.json({ lengkap });
  } catch (error) {
    console.error("Error cekProfilLengkap", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function tambahNilai(req: Request, res: Response) {
  const { email, semester, mataPelajaran, nilai } = req.body as {
    email?: string;
    semester?: number;
    mataPelajaran?: string;
    nilai?: number;
  };

  if (!email || !semester || !mataPelajaran || typeof nilai !== "number") {
    return res.status(400).json({ message: "Email, semester, mata pelajaran, dan nilai wajib diisi" });
  }

  try {
    const siswa = await getOrCreateSiswaByEmail(email);
    if (!siswa) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const record = await prisma.nilaiRapor.create({
      data: {
        siswaId: siswa.id,
        semester,
        mataPelajaran,
        nilai,
      },
    });

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error("Error tambahNilai", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function updateNilai(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { semester, mataPelajaran, nilai } = req.body as {
    semester?: number;
    mataPelajaran?: string;
    nilai?: number;
  };

  if (!id || !semester || !mataPelajaran || typeof nilai !== "number") {
    return res.status(400).json({ message: "ID, semester, mata pelajaran, dan nilai wajib diisi" });
  }

  try {
    const updated = await prisma.nilaiRapor.update({
      where: { id },
      data: { semester, mataPelajaran, nilai },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updateNilai", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function deleteNilai(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "ID wajib diisi" });
  }

  try {
    await prisma.nilaiRapor.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleteNilai", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function listNilai(req: Request, res: Response) {
  const email = String(req.query.email || "");
  if (!email) {
    return res.status(400).json({ message: "Parameter email wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ data: [] });

    const siswa = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!siswa) return res.json({ data: [] });

    const list = await prisma.nilaiRapor.findMany({
      where: { siswaId: siswa.id },
      orderBy: [{ semester: "asc" }, { mataPelajaran: "asc" }],
    });

    return res.json({ data: list });
  } catch (error) {
    console.error("Error listNilai", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function tambahPrestasi(req: Request, res: Response) {
  const { email, nama, tingkat, tahun } = req.body as {
    email?: string;
    nama?: string;
    tingkat?: string;
    tahun?: number;
  };

  if (!email || !nama) {
    return res.status(400).json({ message: "Email dan nama prestasi wajib diisi" });
  }

  try {
    const siswa = await getOrCreateSiswaByEmail(email);
    if (!siswa) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const record = await prisma.prestasi.create({
      data: {
        siswaId: siswa.id,
        nama,
        tingkat: tingkat || null,
        tahun: tahun || null,
      },
    });

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error("Error tambahPrestasi", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

export async function listPrestasi(req: Request, res: Response) {
  const email = String(req.query.email || "");
  if (!email) {
    return res.status(400).json({ message: "Parameter email wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ data: [] });

    const siswa = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!siswa) return res.json({ data: [] });

    const list = await prisma.prestasi.findMany({
      where: { siswaId: siswa.id },
      orderBy: [{ tahun: "desc" }, { nama: "asc" }],
    });

    return res.json({ data: list });
  } catch (error) {
    console.error("Error listPrestasi", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// Cek kelayakan SNBP berdasarkan rata-rata 8 mata pelajaran wajib
// Matematika, Fisika, Kimia, Biologi, Matematika Peminatan, Agama, PPKN, Bahasa Indonesia
export async function cekEligibility(req: Request, res: Response) {
  const email = String(req.query.email || "");
  if (!email) {
    return res.status(400).json({ message: "Parameter email wajib diisi" });
  }

  const MAPEL_WAJIB = [
    "Matematika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Matematika Peminatan",
    "Agama",
    "PPKN",
    "Bahasa Indonesia",
  ];

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ eligible: false, rataRata: 0 });

    const siswa = await prisma.siswaProfile.findUnique({ where: { userId: user.id } });
    if (!siswa) return res.json({ eligible: false, rataRata: 0 });

    const nilai = await prisma.nilaiRapor.findMany({
      where: {
        siswaId: siswa.id,
        mataPelajaran: { in: MAPEL_WAJIB },
      },
    });

    if (nilai.length === 0) {
      return res.json({ eligible: false, rataRata: 0 });
    }

    const total = nilai.reduce((sum, n) => sum + n.nilai, 0);
    const rataRata = total / nilai.length;
    const eligible = rataRata >= 85;

    return res.json({ eligible, rataRata });
  } catch (error) {
    console.error("Error cekEligibility", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
