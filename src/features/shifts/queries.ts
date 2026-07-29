import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

export async function getShifts() {
  await requireAuth() // Manager or Staff can view shifts

  return prisma.shift.findMany({
    where: { deletedAt: null },
    include: {
      requirements: true,
      claims: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profession: true,
            },
          },
        },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })
}

export async function getStaffUsers() {
  await requireAuth() // Managers can fetch staff

  return prisma.user.findMany({
    where: {
      role: 'STAFF',
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      profession: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}
