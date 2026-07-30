import { PrismaClient, Prisma, Profession } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { importCsv } from '../src/services/importer'

const prisma = new PrismaClient()

import { auth } from '../src/server/auth'

async function createOrUpdateUser(
  email: string,
  name: string,
  role: 'MANAGER' | 'STAFF',
  profession: Profession | null,
  passwordPlain: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    // Clean up existing so we can create it freshly with correct password hash using better-auth
    await prisma.user.delete({ where: { id: existing.id } })
  }

  // Create via better-auth to ensure correct hash is generated in Account table
  await auth.api.signUpEmail({
    body: {
      email,
      password: passwordPlain,
      name,
      role,
    },
    headers: new Headers(),
  })

  // Update role and profession
  return prisma.user.update({
    where: { email },
    data: { role, profession },
  })
}

async function main() {
  console.log('Seeding initial users...')
  const managerPassword = 'manager123'
  const doctorPassword = 'doctor123'
  const nursePassword = 'nurse123'
  const receptionistPassword = 'receptionist123'

  // 1 Manager
  const manager = await createOrUpdateUser(
    'manager@clinic.com',
    'Admin Manager',
    'MANAGER',
    null,
    managerPassword,
  )

  // Multiple Doctors
  for (let i = 1; i <= 2; i++) {
    await createOrUpdateUser(
      `doctor${i}@clinic.com`,
      `Dr. Smith ${i}`,
      'STAFF',
      'DOCTOR',
      doctorPassword,
    )
  }

  // Multiple Nurses
  for (let i = 1; i <= 2; i++) {
    await createOrUpdateUser(
      `nurse${i}@clinic.com`,
      `Nurse Joy ${i}`,
      'STAFF',
      'NURSE',
      nursePassword,
    )
  }

  // Multiple Receptionists
  for (let i = 1; i <= 2; i++) {
    await createOrUpdateUser(
      `receptionist${i}@clinic.com`,
      `Rec. Anna ${i}`,
      'STAFF',
      'RECEPTIONIST',
      receptionistPassword,
    )
  }

  console.log('Starting CSV imports...')

  // Import Staff
  const staffCsvContent = fs.readFileSync(path.join(__dirname, '../staff.csv'), 'utf-8')
  const staffImportResult = await importCsv(staffCsvContent, 'STAFF')

  // Insert Staff into DB
  const defaultStaffPassword = 'staff123'
  for (const staff of staffImportResult.accepted as {
    email: string
    name: string
    profession: Profession
  }[]) {
    await createOrUpdateUser(
      staff.email,
      staff.name,
      'STAFF',
      staff.profession,
      defaultStaffPassword,
    )
  }

  // Record Staff Import
  await prisma.importHistory.create({
    data: {
      fileName: 'staff.csv',
      importedById: manager.id,
      reports: {
        create: {
          totalRows: staffImportResult.statistics.total,
          acceptedRows: staffImportResult.statistics.accepted,
          rejectedRows: staffImportResult.statistics.rejected,
          details: JSON.stringify({
            rejected: staffImportResult.rejected,
            merged: staffImportResult.merged,
          }),
        },
      },
    },
  })
  console.log(
    `staff.csv imported: ${staffImportResult.statistics.accepted} accepted, ${staffImportResult.statistics.rejected} rejected, ${staffImportResult.statistics.merged} merged.`,
  )

  // Import Shifts
  const shiftsCsvContent = fs.readFileSync(path.join(__dirname, '../shifts.csv'), 'utf-8')
  const shiftsImportResult = await importCsv(shiftsCsvContent, 'SHIFTS')

  // Insert Shifts into DB
  for (const shift of shiftsImportResult.accepted as Prisma.ShiftCreateInput[]) {
    await prisma.shift.upsert({
      where: { id: shift.id },
      update: {
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        requirements: {
          deleteMany: {},
          create: shift.requirements?.create as Prisma.ShiftRequirementCreateWithoutShiftInput[],
        },
      },
      create: {
        id: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        requirements:
          shift.requirements as Prisma.ShiftRequirementCreateNestedManyWithoutShiftInput,
      },
    })
  }

  // Record Shifts Import
  await prisma.importHistory.create({
    data: {
      fileName: 'shifts.csv',
      importedById: manager.id,
      reports: {
        create: {
          totalRows: shiftsImportResult.statistics.total,
          acceptedRows: shiftsImportResult.statistics.accepted,
          rejectedRows: shiftsImportResult.statistics.rejected,
          details: JSON.stringify({
            rejected: shiftsImportResult.rejected,
            merged: shiftsImportResult.merged,
          }),
        },
      },
    },
  })
  console.log(
    `shifts.csv imported: ${shiftsImportResult.statistics.accepted} accepted, ${shiftsImportResult.statistics.rejected} rejected, ${shiftsImportResult.statistics.merged} merged.`,
  )

  console.log('Database seeded successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed with error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
