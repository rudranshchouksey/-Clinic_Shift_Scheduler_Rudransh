import { prisma } from '@/lib/db'
import { requireManager } from '@/lib/auth-utils'
import { CoverageBoard } from './_components/coverage-board'
import { startOfWeek, endOfWeek, parseISO } from 'date-fns'

export default async function ManagerCoveragePage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  await requireManager()

  const baseDate = searchParams.date ? parseISO(searchParams.date) : new Date()

  // Find start and end of week (Monday to Sunday)
  const startDate = startOfWeek(baseDate, { weekStartsOn: 1 })
  startDate.setHours(0, 0, 0, 0)
  const endDate = endOfWeek(baseDate, { weekStartsOn: 1 })
  endDate.setHours(23, 59, 59, 999)

  const shifts = await prisma.shift.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
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
        <h1 className="text-2xl font-bold tracking-tight">Coverage</h1>
        <p className="text-muted-foreground mt-1">
          Weekly view of shift coverage across all roles.
        </p>
      </div>
      <CoverageBoard shifts={shifts} baseDate={baseDate} startDate={startDate} endDate={endDate} />
    </div>
  )
}
