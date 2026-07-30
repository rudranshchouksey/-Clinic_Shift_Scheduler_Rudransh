import { prisma } from '@/lib/db'
import { ManagerShiftsClient } from './_components/manager-shifts-client'
import { requireManager } from '@/lib/auth-utils'

export default async function ManagerShiftsPage() {
  await requireManager()

  // Fetch next 30 days of shifts for management
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const future = new Date(today)
  future.setDate(future.getDate() + 30)

  const shifts = await prisma.shift.findMany({
    where: {
      date: { gte: today, lte: future },
      deletedAt: null,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    include: {
      requirements: { where: { deletedAt: null } },
      claims: {
        where: { deletedAt: null },
        include: { user: true },
      },
    },
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Manage Shifts</h1>
      </div>
      <ManagerShiftsClient initialShifts={shifts} />
    </div>
  )
}
