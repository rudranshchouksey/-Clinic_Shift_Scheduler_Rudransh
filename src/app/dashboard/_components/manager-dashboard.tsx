import { getShiftsForWeek } from '@/server/queries/shifts'
import { endOfWeek, parse, startOfWeek } from 'date-fns'
import { WeekNavigation } from './week-navigation'
import { ShiftCoverageBoard } from './shift-coverage-board'

export async function ManagerDashboard({ searchParams }: { searchParams: { week?: string } }) {
  // Parse the week parameter or default to the current week
  let currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  if (searchParams.week) {
    const parsed = parse(searchParams.week, 'yyyy-MM-dd', new Date())
    if (!isNaN(parsed.getTime())) {
      currentWeekStart = startOfWeek(parsed, { weekStartsOn: 1 })
    }
  }

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

  // Fetch exactly the shifts needed for this week
  const shifts = await getShiftsForWeek(currentWeekStart, currentWeekEnd)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Coverage</h1>
          <p className="text-muted-foreground mt-2">
            Monitor staffing levels, missing roles, and schedule requirements.
          </p>
        </div>

        <WeekNavigation currentWeekStart={currentWeekStart} />
      </div>

      <ShiftCoverageBoard shifts={shifts} />
    </div>
  )
}
