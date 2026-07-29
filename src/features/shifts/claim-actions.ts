'use server'

import { requireManager } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { headers } from 'next/headers'

// Helper to validate claiming logic
async function validateAndClaimShift(
  tx: Prisma.TransactionClient,
  shiftId: string,
  userId: string,
) {
  // 1. Fetch user to check profession
  const user = await tx.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  if (!user.profession) throw new Error('User must have a profession to claim a shift')

  // 2. Fetch shift and its requirements and existing claims
  const shift = await tx.shift.findUnique({
    where: { id: shiftId, deletedAt: null },
    include: {
      requirements: true,
      claims: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!shift) throw new Error('Shift not found')

  // 3. Check if user already claimed this shift
  const alreadyClaimed = shift.claims.some((c) => c.userId === userId)
  if (alreadyClaimed) throw new Error('User has already claimed this shift')

  // 4. Check quota for this profession
  const requiredCount = shift.requirements.find((r) => r.profession === user.profession)?.count || 0
  if (requiredCount === 0) throw new Error(`This shift does not require a ${user.profession}`)

  const currentCount = shift.claims.filter((c) => c.user.profession === user.profession).length
  if (currentCount >= requiredCount) {
    throw new Error(`The quota for ${user.profession} is already filled for this shift`)
  }

  // 5. Check overlapping shifts on the same day for this user
  const userSameDayClaims = await tx.shiftClaim.findMany({
    where: {
      userId,
      shift: {
        date: shift.date,
        deletedAt: null,
      },
    },
    include: { shift: true },
  })

  const newStart = shift.startTime.getTime()
  const newEnd = shift.endTime.getTime()

  for (const claim of userSameDayClaims) {
    const existingStart = claim.shift.startTime.getTime()
    const existingEnd = claim.shift.endTime.getTime()

    // Overlap condition: New starts before existing ends AND New ends after existing starts
    if (newStart < existingEnd && newEnd > existingStart) {
      throw new Error('This shift overlaps with another claimed shift')
    }
  }

  // 6. Create the claim
  await tx.shiftClaim.create({
    data: {
      shiftId,
      userId,
    },
  })
}

export async function claimShift(shiftId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) throw new Error('Unauthorized')

  try {
    await prisma.$transaction(
      async (tx) => {
        await validateAndClaimShift(tx, shiftId, session.user.id)
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000, // 5 seconds max wait to acquire transaction lock
        timeout: 10000, // 10 seconds transaction timeout
      },
    )

    revalidatePath('/dashboard/shifts')
    return { success: true }
  } catch (error: unknown) {
    // If it's a serialization failure (P2034 in Prisma), we can catch it or pass it along.
    // We'll return a friendly error message.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2034') {
      return { success: false, error: 'The shift was updated by someone else. Please try again.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to claim shift',
    }
  }
}

export async function assignShift(shiftId: string, userId: string) {
  await requireManager()

  try {
    await prisma.$transaction(
      async (tx) => {
        await validateAndClaimShift(tx, shiftId, userId)
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    )

    revalidatePath('/dashboard/shifts')
    return { success: true }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2034') {
      return { success: false, error: 'Transaction conflict. Please try again.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign shift',
    }
  }
}

export async function unclaimShift(shiftId: string, targetUserId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) throw new Error('Unauthorized')

  // If a target userId is specified, ensure caller is a manager
  let userIdToUnclaim = session.user.id
  if (targetUserId && targetUserId !== session.user.id) {
    if (session.user.role !== 'MANAGER')
      throw new Error('Only managers can unclaim shifts for others')
    userIdToUnclaim = targetUserId
  }

  await prisma.shiftClaim.deleteMany({
    where: {
      shiftId,
      userId: userIdToUnclaim,
    },
  })

  revalidatePath('/dashboard/shifts')
  return { success: true }
}
