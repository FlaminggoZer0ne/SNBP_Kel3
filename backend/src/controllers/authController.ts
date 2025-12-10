import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_snbp_secret";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Email sudah terdaftar. Silakan masuk atau gunakan email lain." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: "SISWA",
      },
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Error saat register:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error saat login:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
