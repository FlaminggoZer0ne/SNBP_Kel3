import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'kepsek@snbp.ac.id'
  const passwordPlain = 'passwordkepsek'
  const passwordHash = await bcrypt.hash(passwordPlain, 10)

  await prisma.user.upsert({
    where: { email },
    update: { role: 'KEPALA_SEKOLAH' },
    create: {
      email,
      password: passwordHash,
      role: 'KEPALA_SEKOLAH',
    },
  })

  console.log('User Kepala Sekolah siap digunakan:')
  console.log(`Email: ${email}`)
  console.log(`Password: ${passwordPlain}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
