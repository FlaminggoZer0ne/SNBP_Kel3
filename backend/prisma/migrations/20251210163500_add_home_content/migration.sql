-- CreateEnum
CREATE TYPE "HomeRole" AS ENUM ('PUBLIC', 'SISWA', 'ADMIN', 'GURU_BK', 'KEPALA_SEKOLAH');

-- CreateTable
CREATE TABLE "HomeContent" (
    "id" SERIAL NOT NULL,
    "role" "HomeRole" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeContent_role_key" ON "HomeContent"("role");
