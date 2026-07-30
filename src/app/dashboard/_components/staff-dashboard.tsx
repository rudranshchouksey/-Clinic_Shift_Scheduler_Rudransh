import { getStaffDashboardData } from '@/server/queries/staff-shifts'
import { ShiftCard } from './shift-card'
import { Profession } from '@prisma/client'
import { CalendarCheck, Inbox } from 'lucide-react'

export async function StaffDashboard({
  session,
}: {
  session: { user: { id: string; profession?: string | null } }
}) {
  if (!session.user.profession) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold tracking-tight">Profession Required</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Your account does not have a profession assigned. Please contact your manager to update
          your profile before claiming shifts.
        </p>
      </div>
    )
  }

  const { myShifts, availableShifts } = await getStaffDashboardData(
    session.user.id,
    session.user.profession as Profession,
  )

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your schedule and browse available shifts matching your role as a{' '}
          {session.user.profession}.
        </p>
      </div>

      <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">My Upcoming Shifts</h2>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
            {myShifts.length} Scheduled
          </span>
        </div>

        {myShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <CalendarCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg tracking-tight">No upcoming shifts</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You haven&apos;t claimed any shifts yet. Browse available shifts below to build your
              schedule.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} isClaimed={true} hasConflict={false} />
            ))}
          </div>
        )}
      </section>

      <section className="animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Available Shifts</h2>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
            {availableShifts.length} Available
          </span>
        </div>

        {availableShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg tracking-tight">No shifts available</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              There are no available shifts for your profession at this time. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                isClaimed={false}
                hasConflict={shift.hasConflict}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
