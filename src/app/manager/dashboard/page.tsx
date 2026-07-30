import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

  const kpiCards = [
    {
      title: 'Total Staff',
      value: totalStaff,
      subtitle: 'Active team members',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-l-blue-500',
    },
    {
      title: 'Shifts Today',
      value: shiftsToday,
      subtitle: 'Scheduled for today',
      icon: CalendarDays,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      border: 'border-l-violet-500',
    },
    {
      title: 'Unfilled Shifts',
      value: unfilledRequirements,
      subtitle: 'Need attention today',
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-l-amber-500',
    },
    {
      title: 'Claims Today',
      value: totalClaims,
      subtitle: 'Shifts claimed by staff',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-l-emerald-500',
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Today&apos;s overview of your clinic&apos;s scheduling status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.title}
            className={`border-l-4 ${kpi.border} hover:shadow-md transition-shadow duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
