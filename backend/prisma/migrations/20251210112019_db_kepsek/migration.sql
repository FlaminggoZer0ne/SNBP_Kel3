-- CreateEnum
CREATE TYPE "KepsekStatus" AS ENUM ('BELUM_DITINJAU', 'DISETUJUI', 'DITOLAK');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'KEPALA_SEKOLAH';

-- AlterTable
ALTER TABLE "Pendaftaran" ADD COLUMN     "dikirimKeKepsek" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kepsekAlasan" TEXT,
ADD COLUMN     "kepsekStatus" "KepsekStatus";
