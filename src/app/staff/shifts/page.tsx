import { prisma } from '@/lib/db'
import { Profession } from '@prisma/client'
import { requireAuth } from '@/lib/auth-utils'
import { StaffShiftsClient } from './_components/staff-shifts-client'
import { CalendarDays } from 'lucide-react'

export default async function StaffShiftsPage() {
  const session = await requireAuth()
  if (!session.user.profession) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center max-w-md text-center p-8 rounded-2xl bg-muted/30 border">
          <div className="p-4 rounded-full bg-muted mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-2">No Profession Assigned</h2>
          <p className="text-muted-foreground">
            You must have a profession assigned to claim shifts. Please contact a clinic manager to
            update your profile.
          </p>
        </div>
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
    <div className="flex flex-1 flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Available Shifts</h1>
        <p className="text-muted-foreground mt-1">
          Browse and claim upcoming shifts that require a {session.user.profession.toLowerCase()}.
        </p>
      </div>
      <StaffShiftsClient
        initialShifts={shifts}
        userId={session.user.id}
        userProfession={session.user.profession}
      />
    </div>
  )
}
