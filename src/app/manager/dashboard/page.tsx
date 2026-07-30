import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default async function ManagerDashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalStaff, shiftsToday, allShiftsToday] = await Promise.all([
    prisma.user.count({ where: { role: 'STAFF' } }),
    prisma.shift.count({
      where: {
        date: { gte: today, lt: tomorrow },
        deletedAt: null,
      },
    }),
    prisma.shift.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        deletedAt: null,
      },
      include: {
        requirements: { where: { deletedAt: null } },
        claims: { where: { deletedAt: null } },
      },
    }),
  ])

  let unfilledRequirements = 0
  let totalClaims = 0

  allShiftsToday.forEach((shift) => {
    totalClaims += shift.claims.length
    let requiredTotal = 0
    shift.requirements.forEach((r) => {
      requiredTotal += r.count
    })
    if (shift.claims.length < requiredTotal) {
      unfilledRequirements++
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Manager Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shifts Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shiftsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unfilled Shifts Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unfilledRequirements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
