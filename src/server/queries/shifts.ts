import { prisma } from '@/lib/db'

export async function getShiftsForWeek(startDate: Date, endDate: Date) {
  return prisma.shift.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    include: {
      requirements: {
        where: { deletedAt: null },
      },
      claims: {
        where: { deletedAt: null },
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
  })
}

export type ShiftWithRelations = Awaited<ReturnType<typeof getShiftsForWeek>>[0]
