import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function listUniversitas(req: Request, res: Response) {
  try {
    const rows = await prisma.prodi.findMany({
      distinct: ["universitas"],
      select: { universitas: true },
      orderBy: { universitas: "asc" },
    });

    const data = rows.map((row) => row.universitas);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching universitas", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar universitas",
    });
  }
}
