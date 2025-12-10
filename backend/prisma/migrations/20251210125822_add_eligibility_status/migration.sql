-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('MENUNGGU_BK', 'MENUNGGU_KEPSEK', 'ELIGIBLE', 'TIDAK_ELIGIBLE');

-- AlterTable
ALTER TABLE "SiswaProfile" ADD COLUMN     "eligibilityStatus" "EligibilityStatus" NOT NULL DEFAULT 'MENUNGGU_BK';
