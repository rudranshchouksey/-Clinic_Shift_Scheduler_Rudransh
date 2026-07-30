import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { format } from 'date-fns'
import { CalendarDays, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function StaffDashboardPage() {
  const session = await requireAuth()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const future = new Date(today)
  future.setDate(future.getDate() + 30)

  // Fetch claimed shifts
  const claims = await prisma.shiftClaim.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      shift: {
        date: { gte: today, lte: future },
        deletedAt: null,
      },
    },
    include: {
      shift: true,
    },
    orderBy: {
      shift: { date: 'asc' },
    },
  })

  const nextShift = claims.length > 0 ? claims[0].shift : null

  let totalHours = 0
  claims.forEach((c) => {
    const start = c.shift.startTime.getTime()
    const end = c.shift.endTime.getTime()
    totalHours += (end - start) / (1000 * 60 * 60)
  })

  const kpiCards = [
    {
      title: 'Upcoming Shifts',
      value: claims.length,
      subtitle: 'Next 30 days',
      icon: CalendarDays,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-l-blue-500',
    },
    {
      title: 'Scheduled Hours',
      value: `${totalHours.toFixed(1)}h`,
      subtitle: 'Total work hours',
      icon: Clock,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      border: 'border-l-violet-500',
    },
    {
      title: 'Next Shift',
      value: nextShift ? format(new Date(nextShift.date), 'MMM d') : '—',
      subtitle: nextShift
        ? `${format(new Date(nextShift.startTime), 'HH:mm')} – ${format(new Date(nextShift.endTime), 'HH:mm')}`
        : 'No upcoming shifts',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-l-emerald-500',
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {session.user.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {(session.user.profession || '').toLowerCase()}
            </Badge>
            <span>Your schedule overview</span>
          </p>
        </div>
        <Link href="/staff/shifts">
          <Button size="sm" className="gap-2">
            Browse Shifts
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
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

      {/* Schedule Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your Schedule</CardTitle>
          {claims.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {claims.length} shift{claims.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No scheduled shifts</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                You haven&apos;t claimed any shifts yet. Browse available shifts to get started.
              </p>
              <Link href="/staff/shifts">
                <Button variant="outline" size="sm" className="mt-4 gap-2">
                  Browse Shifts
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => {
                  const shift = claim.shift
                  const hours =
                    (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60)
                  return (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">
                        {format(new Date(shift.date), 'EEEE, MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(shift.startTime), 'HH:mm')} –{' '}
                        {format(new Date(shift.endTime), 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {hours.toFixed(1)}h
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
