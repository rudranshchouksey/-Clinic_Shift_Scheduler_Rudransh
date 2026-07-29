import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Upsert Manager
  await prisma.user.upsert({
    where: { email: 'manager@clinic.com' },
    update: {},
    create: {
      email: 'manager@clinic.com',
      name: 'Admin Manager',
      password: hashedPassword,
      role: 'MANAGER',
    },
  })

  // Upsert a few staff
  await prisma.user.upsert({
    where: { email: 'doctor@clinic.com' },
    update: {},
    create: {
      email: 'doctor@clinic.com',
      name: 'Dr. Smith',
      password: hashedPassword,
      role: 'STAFF',
      profession: 'DOCTOR',
    },
  })

  await prisma.user.upsert({
    where: { email: 'nurse@clinic.com' },
    update: {},
    create: {
      email: 'nurse@clinic.com',
      name: 'Nurse Joy',
      password: hashedPassword,
      role: 'STAFF',
      profession: 'NURSE',
    },
  })

  await prisma.user.upsert({
    where: { email: 'receptionist@clinic.com' },
    update: {},
    create: {
      email: 'receptionist@clinic.com',
      name: 'Rec. Anna',
      password: hashedPassword,
      role: 'STAFF',
      profession: 'RECEPTIONIST',
    },
  })

  console.log('Database seeded successfully')
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
