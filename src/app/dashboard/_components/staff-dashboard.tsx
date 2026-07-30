import { getStaffDashboardData } from '@/server/queries/staff-shifts'
import { ShiftCard } from './shift-card'
import { Profession } from '@prisma/client'

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

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">My Upcoming Shifts</h2>
          <span className="text-sm text-muted-foreground">{myShifts.length} Scheduled</span>
        </div>

        {myShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border rounded-xl border-dashed bg-muted/20">
            <p className="text-muted-foreground">You have no upcoming shifts scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} isClaimed={true} hasConflict={false} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Available Shifts</h2>
          <span className="text-sm text-muted-foreground">{availableShifts.length} Available</span>
        </div>

        {availableShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border rounded-xl border-dashed bg-muted/20">
            <p className="text-muted-foreground">
              There are no available shifts for your profession at this time.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
