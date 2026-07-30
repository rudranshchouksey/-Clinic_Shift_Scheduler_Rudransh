import { prisma } from '@/lib/db'
import { Profession } from '@prisma/client'
import { requireAuth } from '@/lib/auth-utils'
import { StaffShiftsClient } from './_components/staff-shifts-client'

export default async function StaffShiftsPage() {
  const session = await requireAuth()
  if (!session.user.profession) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You must have a profession assigned to claim shifts. Please contact a manager.
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const future = new Date(today)
  future.setDate(future.getDate() + 30)

  // Only fetch shifts that require the user's profession
  const shifts = await prisma.shift.findMany({
    where: {
      date: { gte: today, lte: future },
      deletedAt: null,
      requirements: {
        some: { profession: session.user.profession as Profession, deletedAt: null },
      },
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
        <h1 className="text-lg font-semibold md:text-2xl">Browse Available Shifts</h1>
      </div>
      <StaffShiftsClient
        initialShifts={shifts}
        userId={session.user.id}
        userProfession={session.user.profession}
      />
    </div>
  )
}
