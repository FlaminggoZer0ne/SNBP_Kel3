import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'bk@snbp.ac.id'
  const passwordPlain = 'passwordbk'
  const passwordHash = await bcrypt.hash(passwordPlain, 10)

  await prisma.user.upsert({
    where: { email },
    update: { role: 'GURU_BK' },
    create: {
      email,
      password: passwordHash,
      role: 'GURU_BK',
    },
  })

  console.log('User Guru BK siap digunakan:')
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
