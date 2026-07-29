import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const managerPassword = await bcrypt.hash('manager123', 10)
  const doctorPassword = await bcrypt.hash('doctor123', 10)
  const nursePassword = await bcrypt.hash('nurse123', 10)
  const receptionistPassword = await bcrypt.hash('receptionist123', 10)

  // 1 Manager
  await prisma.user.upsert({
    where: { email: 'manager@clinic.com' },
    update: {},
    create: {
      email: 'manager@clinic.com',
      name: 'Admin Manager',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  // Multiple Doctors
  for (let i = 1; i <= 2; i++) {
    await prisma.user.upsert({
      where: { email: `doctor${i}@clinic.com` },
      update: {},
      create: {
        email: `doctor${i}@clinic.com`,
        name: `Dr. Smith ${i}`,
        password: doctorPassword,
        role: 'STAFF',
        profession: 'DOCTOR',
      },
    })
  }

  // Multiple Nurses
  for (let i = 1; i <= 2; i++) {
    await prisma.user.upsert({
      where: { email: `nurse${i}@clinic.com` },
      update: {},
      create: {
        email: `nurse${i}@clinic.com`,
        name: `Nurse Joy ${i}`,
        password: nursePassword,
        role: 'STAFF',
        profession: 'NURSE',
      },
    })
  }

  // Multiple Receptionists
  for (let i = 1; i <= 2; i++) {
    await prisma.user.upsert({
      where: { email: `receptionist${i}@clinic.com` },
      update: {},
      create: {
        email: `receptionist${i}@clinic.com`,
        name: `Rec. Anna ${i}`,
        password: receptionistPassword,
        role: 'STAFF',
        profession: 'RECEPTIONIST',
      },
    })
  }

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
