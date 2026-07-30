'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function claimShift(shiftId: string) {
  const session = await requireAuth()

  if (!session.user.profession) {
    throw new Error('Only staff with a profession can claim shifts')
  }

  // Double check shift hasn't been claimed by others fully
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      requirements: { where: { deletedAt: null } },
      claims: { where: { deletedAt: null }, include: { user: true } },
    },
  })

  if (!shift) throw new Error('Shift not found')

  const req = shift.requirements.find((r) => r.profession === session.user.profession)
  if (!req) throw new Error('Shift does not require your profession')

  const currentClaims = shift.claims.filter((c) => c.user.profession === session.user.profession)
  if (currentClaims.length >= req.count) {
    throw new Error('Shift is already fully staffed for your profession')
  }

  // Create claim
  await prisma.shiftClaim.create({
    data: {
      shiftId,
      userId: session.user.id,
    },
  })

  revalidatePath('/dashboard')
}

export async function unclaimShift(shiftId: string) {
  const session = await requireAuth()

  // Find the claim
  const claim = await prisma.shiftClaim.findFirst({
    where: {
      shiftId,
      userId: session.user.id,
      deletedAt: null,
    },
  })

  if (!claim) throw new Error('You have not claimed this shift')

  await prisma.shiftClaim.update({
    where: { id: claim.id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/dashboard')
}
