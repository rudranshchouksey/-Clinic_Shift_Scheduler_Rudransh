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
