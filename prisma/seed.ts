import { PrismaClient, Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'
import { importCsv } from '../src/services/importer'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial users...')
  const managerPassword = await bcrypt.hash('manager123', 10)
  const doctorPassword = await bcrypt.hash('doctor123', 10)
  const nursePassword = await bcrypt.hash('nurse123', 10)
  const receptionistPassword = await bcrypt.hash('receptionist123', 10)

  // 1 Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@clinic.com' },
    update: {},
    create: {
      email: 'manager@clinic.com',
      name: 'Admin Manager',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  // We are asked to seed staff, but since the staff.csv contains all our actual staff,
  // we could optionally just use the ones from the CSV and maybe give them default passwords.
  // Wait, PROJECT_BRIEF says "Seed at least one manager login and several staff logins, with credentials listed in the README."
  // So the existing dummy staff are fine. The CSV will add more staff.

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

  console.log('Starting CSV imports...')

  // Import Staff
  const staffCsvContent = fs.readFileSync(path.join(__dirname, '../staff.csv'), 'utf-8')
  const staffImportResult = await importCsv(staffCsvContent, 'STAFF')

  // Insert Staff into DB
  // Give them a default password so they can log in if needed
  const defaultStaffPassword = await bcrypt.hash('staff123', 10)
  for (const staff of staffImportResult.accepted as Prisma.UserCreateInput[]) {
    // Note: UserCreateInput doesn't have the password typed strongly if it's optional, but we can add it
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        name: staff.name,
        profession: staff.profession,
      },
      create: {
        ...staff,
        password: defaultStaffPassword,
      },
    })
  }

  // Record Staff Import
  const staffHistory = await prisma.importHistory.create({
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
    // Using an upsert based on shift ID
    // Prisma upsert needs a unique identifier. `id` is a unique identifier, but it might not be in the where clause if it's just the default CUID.
    // Wait, the schema has `id String @id`. So we can upsert on `id`.
    await prisma.shift.upsert({
      where: { id: shift.id },
      update: {
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        // For requirements, we usually want to delete old and insert new,
        // but since this is a seed, we can assume it's just inserting or updating basic fields.
        // Doing full nested updates for requirements is tricky, so if it exists we just keep it, or delete-insert.
        requirements: {
          deleteMany: {},
          create: shift.requirements?.create,
        },
      },
      create: {
        id: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        requirements: shift.requirements,
      },
    })
  }

  // Record Shifts Import
  const shiftsHistory = await prisma.importHistory.create({
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
