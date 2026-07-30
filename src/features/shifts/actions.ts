'use server'

import { requireManager } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { shiftSchema, type ShiftFormValues } from './schema'
import { revalidatePath } from 'next/cache'
import { Profession } from '@prisma/client'

export async function createShift(data: ShiftFormValues) {
  await requireManager()

  const parsed = shiftSchema.parse(data)

  // Construct dates for startTime and endTime
  const dateObj = new Date(parsed.date)

  // Time comes in as HH:mm
  const startParts = parsed.startTime.split(':')
  const startTime = new Date(dateObj)
  startTime.setUTCHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0)

  const endParts = parsed.endTime.split(':')
  const endTime = new Date(dateObj)
  endTime.setUTCHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0)

  const requirements: { profession: Profession; count: number }[] = []
  if (parsed.doctorCount > 0)
    requirements.push({ profession: Profession.DOCTOR, count: parsed.doctorCount })
  if (parsed.nurseCount > 0)
    requirements.push({ profession: Profession.NURSE, count: parsed.nurseCount })
  if (parsed.receptionistCount > 0)
    requirements.push({ profession: Profession.RECEPTIONIST, count: parsed.receptionistCount })

  const shift = await prisma.shift.create({
    data: {
      date: dateObj,
      startTime,
      endTime,
      requirements: {
        create: requirements,
      },
    },
  })

  revalidatePath('/dashboard/shifts')
  return { success: true, shift }
}

export async function updateShift(id: string, data: ShiftFormValues) {
  await requireManager()
  const parsed = shiftSchema.parse(data)

  const dateObj = new Date(parsed.date)

  const startParts = parsed.startTime.split(':')
  const startTime = new Date(dateObj)
  startTime.setUTCHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0)

  const endParts = parsed.endTime.split(':')
  const endTime = new Date(dateObj)
  endTime.setUTCHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0)

  const requirements: { profession: Profession; count: number }[] = []
  if (parsed.doctorCount > 0)
    requirements.push({ profession: Profession.DOCTOR, count: parsed.doctorCount })
  if (parsed.nurseCount > 0)
    requirements.push({ profession: Profession.NURSE, count: parsed.nurseCount })
  if (parsed.receptionistCount > 0)
    requirements.push({ profession: Profession.RECEPTIONIST, count: parsed.receptionistCount })

  await prisma.$transaction(
    async (tx) => {
      await tx.shift.update({
        where: { id },
        data: {
          date: dateObj,
          startTime,
          endTime,
        },
      })

      await tx.shiftRequirement.deleteMany({
        where: { shiftId: id },
      })

      if (requirements.length > 0) {
        await tx.shiftRequirement.createMany({
          data: requirements.map((req) => ({
            shiftId: id,
            profession: req.profession,
            count: req.count,
          })),
        })
      }

      // Re-validate existing claims
      const existingClaims = await tx.shiftClaim.findMany({
        where: { shiftId: id },
        include: { user: true },
        orderBy: { createdAt: 'asc' }, // Keep oldest claims first if quota shrinks
      })

      const countsByProfession: Record<string, number> = {}
      const claimsToDelete: string[] = []

      for (const claim of existingClaims) {
        const prof = claim.user.profession
        if (!prof) {
          claimsToDelete.push(claim.id)
          continue
        }

        // 1. Check Quota
        const reqCount = requirements.find((r) => r.profession === prof)?.count || 0
        countsByProfession[prof] = (countsByProfession[prof] || 0) + 1

        if (countsByProfession[prof] > reqCount) {
          claimsToDelete.push(claim.id)
          continue
        }

        // 2. Check Overlap
        const otherClaims = await tx.shiftClaim.findMany({
          where: {
            userId: claim.userId,
            id: { not: claim.id },
            shift: {
              date: dateObj,
              deletedAt: null,
            },
          },
          include: { shift: true },
        })

        const overlaps = otherClaims.some((other) => {
          const otherStart = other.shift.startTime.getTime()
          const otherEnd = other.shift.endTime.getTime()
          const thisStart = startTime.getTime()
          const thisEnd = endTime.getTime()
          return thisStart < otherEnd && thisEnd > otherStart
        })

        if (overlaps) {
          claimsToDelete.push(claim.id)
        }
      }

      if (claimsToDelete.length > 0) {
        await tx.shiftClaim.deleteMany({
          where: { id: { in: claimsToDelete } },
        })
      }
    },
    { isolationLevel: 'Serializable' },
  )

  revalidatePath('/dashboard/shifts')
  return { success: true }
}

export async function deleteShift(id: string) {
  await requireManager()

  await prisma.shift.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/dashboard/shifts')
  return { success: true }
}
