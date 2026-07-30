'use server'

import { prisma } from '@/lib/db'
import { requireAuth, requireManager } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { shiftFormSchema } from '@/lib/schemas'
import { z } from 'zod'

export type ActionState = {
  success?: boolean
  error?: string
}

function createDateTime(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

export async function createShift(formData: z.infer<typeof shiftFormSchema>): Promise<ActionState> {
  try {
    await requireManager()
    const parsed = shiftFormSchema.parse(formData)

    const start = createDateTime(parsed.date, parsed.startTime)
    const end = createDateTime(parsed.date, parsed.endTime)

    await prisma.shift.create({
      data: {
        date: parsed.date,
        startTime: start,
        endTime: end,
        requirements: {
          create: parsed.requirements.map((r) => ({
            profession: r.profession,
            count: r.count,
          })),
        },
      },
    })

    return { success: true }
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return { error: 'Validation error: ' + e.issues[0].message }
    return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
  } finally {
    revalidatePath('/manager/shifts')
    revalidatePath('/manager/coverage')
  }
}

export async function updateShift(
  id: string,
  formData: z.infer<typeof shiftFormSchema>,
): Promise<ActionState> {
  try {
    await requireManager()
    const parsed = shiftFormSchema.parse(formData)
    const start = createDateTime(parsed.date, parsed.startTime)
    const end = createDateTime(parsed.date, parsed.endTime)

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.shift.findUnique({
        where: { id, deletedAt: null },
        include: { claims: { where: { deletedAt: null }, include: { user: true } } },
      })

      if (!existing) return { error: 'Shift not found' }

      // Validate requirement changes against claims
      for (const req of parsed.requirements) {
        const claimsForProf = existing.claims.filter(
          (c) => c.user.profession === req.profession,
        ).length
        if (claimsForProf > req.count) {
          return {
            error: `Cannot reduce ${req.profession} requirements below currently claimed count (${claimsForProf})`,
          }
        }
      }

      // Check for removed professions that have claims
      const requestedProfs = parsed.requirements.map((r) => r.profession)
      for (const claim of existing.claims) {
        if (claim.user.profession && !requestedProfs.includes(claim.user.profession)) {
          return {
            error: `Cannot remove ${claim.user.profession} requirement because there are existing claims for it.`,
          }
        }
      }

      // Revalidate time overlaps for existing claimants if time changed
      if (
        existing.startTime.getTime() !== start.getTime() ||
        existing.endTime.getTime() !== end.getTime()
      ) {
        for (const claim of existing.claims) {
          const overlap = await tx.shiftClaim.findFirst({
            where: {
              userId: claim.userId,
              deletedAt: null,
              id: { not: claim.id },
              shift: {
                date: parsed.date,
                startTime: { lt: end },
                endTime: { gt: start },
                deletedAt: null,
              },
            },
          })
          if (overlap)
            return {
              error: `User ${claim.user.name} has another shift that conflicts with the new time.`,
            }
        }
      }

      // Update shift
      await tx.shift.update({
        where: { id },
        data: {
          date: parsed.date,
          startTime: start,
          endTime: end,
          requirements: {
            deleteMany: {},
            create: parsed.requirements.map((r) => ({
              profession: r.profession,
              count: r.count,
            })),
          },
        },
      })
      return { success: true }
    })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return { error: 'Validation error: ' + e.issues[0].message }
    return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
  } finally {
    revalidatePath('/manager/shifts')
    revalidatePath('/manager/coverage')
  }
}

export async function deleteShift(id: string): Promise<ActionState> {
  try {
    await requireManager()
    await prisma.$transaction(async (tx) => {
      // Soft delete shift
      await tx.shift.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      // Soft delete claims
      await tx.shiftClaim.updateMany({
        where: { shiftId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      // Soft delete requirements
      await tx.shiftRequirement.updateMany({
        where: { shiftId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
    })
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
  } finally {
    revalidatePath('/manager/shifts')
    revalidatePath('/manager/coverage')
  }
}

export async function claimShift(shiftId: string): Promise<ActionState> {
  try {
    const session = await requireAuth()
    if (!session.user.profession) return { error: 'Only staff with a profession can claim shifts' }
    if (!shiftId) return { error: 'Shift ID is required' }

    return await prisma.$transaction(async (tx) => {
      const shift = await tx.shift.findUnique({
        where: { id: shiftId, deletedAt: null },
        include: {
          requirements: { where: { deletedAt: null } },
          claims: { where: { deletedAt: null }, include: { user: true } },
        },
      })
      if (!shift) return { error: 'Shift not found' }

      const req = shift.requirements.find((r) => r.profession === session.user.profession)
      if (!req) return { error: 'Shift does not require your profession' }

      const currentClaims = shift.claims.filter(
        (c) => c.user.profession === session.user.profession,
      )
      if (currentClaims.length >= req.count)
        return { error: 'Shift is already fully staffed for your profession' }

      // Check if user already claimed this shift
      if (shift.claims.some((c) => c.userId === session.user.id)) {
        return { error: 'You have already claimed this shift' }
      }

      // Overlap check
      const overlappingClaim = await tx.shiftClaim.findFirst({
        where: {
          userId: session.user.id,
          deletedAt: null,
          shift: {
            date: shift.date,
            deletedAt: null,
            startTime: { lt: shift.endTime },
            endTime: { gt: shift.startTime },
          },
        },
      })
      if (overlappingClaim) return { error: 'You already have a shift scheduled at this time' }

      await tx.shiftClaim.create({
        data: { shiftId, userId: session.user.id },
      })
      return { success: true }
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
  } finally {
    revalidatePath('/staff/shifts')
    revalidatePath('/staff/dashboard')
  }
}

export async function unclaimShift(shiftId: string): Promise<ActionState> {
  try {
    const session = await requireAuth()
    if (!shiftId) return { error: 'Shift ID is required' }

    const claim = await prisma.shiftClaim.findFirst({
      where: { shiftId, userId: session.user.id, deletedAt: null },
    })
    if (!claim) return { error: 'You have not claimed this shift' }

    await prisma.shiftClaim.update({
      where: { id: claim.id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
  } finally {
    revalidatePath('/staff/shifts')
    revalidatePath('/staff/dashboard')
  }
}
