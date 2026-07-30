import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { format } from 'date-fns'
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Welcome back, {session.user.name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts (30 days)</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Shift</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {nextShift ? (
                <>
                  {format(new Date(nextShift.date), 'MMM d')} <br />
                  <span className="text-sm font-normal text-muted-foreground">
                    {format(new Date(nextShift.startTime), 'HH:mm')} -{' '}
                    {format(new Date(nextShift.endTime), 'HH:mm')}
                  </span>
                </>
              ) : (
                'No upcoming shifts'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                    You have no scheduled shifts. Go to Browse Shifts to claim some!
                  </TableCell>
                </TableRow>
              )}
              {claims.map((claim) => {
                const shift = claim.shift
                const hours =
                  (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60)
                return (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">
                      {format(new Date(shift.date), 'EEEE, MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(shift.startTime), 'HH:mm')} -{' '}
                      {format(new Date(shift.endTime), 'HH:mm')}
                    </TableCell>
                    <TableCell>{hours.toFixed(1)} hrs</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
