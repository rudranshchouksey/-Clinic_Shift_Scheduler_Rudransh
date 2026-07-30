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
    <div className="flex flex-1 flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shifts</h1>
        <p className="text-muted-foreground mt-1">Create and manage shifts for the next 30 days.</p>
      </div>
      <ManagerShiftsClient initialShifts={shifts} />
    </div>
  )
}
