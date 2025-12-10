/*
  Warnings:

  - Added the required column `prodi1Name` to the `Pendaftaran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pendaftaran" ADD COLUMN     "prodi1Name" TEXT NOT NULL,
ADD COLUMN     "prodi2Name" TEXT;
