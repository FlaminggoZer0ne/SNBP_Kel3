import { Request, Response } from 'express'
import { prisma } from '../config/prisma'

const defaultHomeContent: Record<string, { title: string; subtitle: string }> = {
  PUBLIC: {
    title: 'Simulasi & Pendaftaran SNBP Sekolah',
    subtitle:
      'Portal internal sekolah untuk mengelola nilai rapor, verifikasi Guru BK & Kepala Sekolah, hingga pemilihan universitas dan pengecekan hasil seleksi SNBP.',
  },
  SISWA: {
    title: 'Beranda Siswa SNBP',
    subtitle: 'Pantau kelengkapan profil, nilai rapor, dan status pendaftaran SNBP Anda di sini.',
  },
  GURU_BK: {
    title: 'Beranda Guru BK',
    subtitle: 'Kelola verifikasi nilai rapor dan kelayakan siswa untuk mengikuti SNBP.',
  },
  KEPALA_SEKOLAH: {
    title: 'Beranda Kepala Sekolah',
    subtitle: 'Tinjau dan sahkan kelayakan siswa serta pendaftaran universitas untuk SNBP.',
  },
  ADMIN: {
    title: 'Beranda Admin SNBP Sekolah',
    subtitle: 'Monitor data pendaftaran, proses seleksi, dan atur tampilan informasi portal.',
  },
}

export const getHomeContent = async (req: Request, res: Response) => {
  const role = String(req.query.role || 'PUBLIC').toUpperCase()

  try {
    const existing = await prisma.homeContent.findUnique({
      where: { role: role as any },
    })

    if (existing) {
      return res.json({
        data: {
          role: existing.role,
          title: existing.title,
          subtitle: existing.subtitle ?? '',
        },
      })
    }

    const fallback = defaultHomeContent[role] || defaultHomeContent.PUBLIC
    return res.json({
      data: {
        role,
        title: fallback.title,
        subtitle: fallback.subtitle,
      },
    })
  } catch (error) {
    console.error('Error getHomeContent', error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' })
  }
}

export const saveHomeContent = async (req: Request, res: Response) => {
  const { role, title, subtitle } = req.body as {
    role?: string
    title?: string
    subtitle?: string
  }

  if (!role || !title) {
    return res.status(400).json({ message: 'Role dan title wajib diisi' })
  }

  const normalizedRole = role.toUpperCase()

  try {
    const saved = await prisma.homeContent.upsert({
      where: { role: normalizedRole as any },
      create: {
        role: normalizedRole as any,
        title,
        subtitle,
      },
      update: {
        title,
        subtitle,
      },
    })

    return res.json({
      message: 'Konten beranda berhasil disimpan',
      data: {
        role: saved.role,
        title: saved.title,
        subtitle: saved.subtitle ?? '',
      },
    })
  } catch (error) {
    console.error('Error saveHomeContent', error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' })
  }
}
