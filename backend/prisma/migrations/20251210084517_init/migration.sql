-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SISWA', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusPendaftaran" AS ENUM ('MENUNGGU', 'DITERIMA', 'DITOLAK');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SISWA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiswaProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "sekolah" TEXT,
    "nisn" TEXT,

    CONSTRAINT "SiswaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NilaiRapor" (
    "id" SERIAL NOT NULL,
    "siswaId" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "mataPelajaran" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NilaiRapor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestasi" (
    "id" SERIAL NOT NULL,
    "siswaId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tingkat" TEXT,
    "tahun" INTEGER,

    CONSTRAINT "Prestasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prodi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "universitas" TEXT NOT NULL,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendaftaran" (
    "id" SERIAL NOT NULL,
    "siswaId" INTEGER NOT NULL,
    "prodi1Id" INTEGER,
    "prodi2Id" INTEGER,
    "status" "StatusPendaftaran" NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokumen" (
    "id" SERIAL NOT NULL,
    "siswaId" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SiswaProfile_userId_key" ON "SiswaProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SiswaProfile_nisn_key" ON "SiswaProfile"("nisn");

-- AddForeignKey
ALTER TABLE "SiswaProfile" ADD CONSTRAINT "SiswaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiRapor" ADD CONSTRAINT "NilaiRapor_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "SiswaProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestasi" ADD CONSTRAINT "Prestasi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "SiswaProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "SiswaProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_prodi1Id_fkey" FOREIGN KEY ("prodi1Id") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_prodi2Id_fkey" FOREIGN KEY ("prodi2Id") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokumen" ADD CONSTRAINT "Dokumen_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "SiswaProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
