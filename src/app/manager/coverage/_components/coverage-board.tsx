'use client'

import * as React from 'react'
import Link from 'next/link'
import { format, addWeeks, subWeeks, addDays, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const professionShort: Record<string, string> = {
  DOCTOR: 'Doc',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Recep',
}

const professionDotColor: Record<string, string> = {
  DOCTOR: 'bg-blue-500',
  NURSE: 'bg-emerald-500',
  RECEPTIONIST: 'bg-violet-500',
}

export function CoverageBoard({
  shifts,
  baseDate,
  startDate,
  endDate,
}: {
  shifts: {
    id: string
    date: Date | string
    startTime: Date | string
    endTime: Date | string
    requirements: { id: string; profession: string; count: number }[]
    claims: { user: { profession: string | null } }[]
  }[]
  baseDate: Date
  startDate: Date
  endDate: Date
}) {
  const prevWeekStr = format(subWeeks(baseDate, 1), 'yyyy-MM-dd')
  const nextWeekStr = format(addWeeks(baseDate, 1), 'yyyy-MM-dd')

  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i))
  }

  return (
    <div className="space-y-6">
      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <Link
          href={`?date=${prevWeekStr}`}
          className={buttonVariants({ variant: 'outline', size: 'icon', className: 'h-9 w-9' })}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">
            {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
          </span>
        </div>
        <Link
          href={`?date=${nextWeekStr}`}
          className={buttonVariants({ variant: 'outline', size: 'icon', className: 'h-9 w-9' })}
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const dayShifts = shifts.filter((s) => isSameDay(new Date(s.date), day))
          const isToday = isSameDay(day, new Date())
          const isWeekend = day.getDay() === 0 || day.getDay() === 6

          return (
            <Card
              key={day.toISOString()}
              className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                isToday ? 'border-primary ring-1 ring-primary/20' : isWeekend ? 'bg-muted/30' : ''
              }`}
            >
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {format(day, 'EEE')}
                  </CardTitle>
                  <span
                    className={`text-sm font-bold ${
                      isToday
                        ? 'bg-primary text-primary-foreground h-7 w-7 rounded-full flex items-center justify-center'
                        : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2 min-h-[120px]">
                {dayShifts.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[80px]">
                    <span className="text-xs text-muted-foreground/50">No shifts</span>
                  </div>
                ) : (
                  dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="rounded-lg border bg-card p-2.5 space-y-2 hover:bg-accent/30 transition-colors"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {format(new Date(shift.startTime), 'HH:mm')} –{' '}
                        {format(new Date(shift.endTime), 'HH:mm')}
                      </p>
                      <div className="space-y-1">
                        {shift.requirements.map(
                          (r: { id: string; profession: string; count: number }) => {
                            const profClaims = shift.claims.filter(
                              (c: { user: { profession: string | null } }) =>
                                c.user.profession === r.profession,
                            ).length
                            const profFilled = profClaims >= r.count
                            return (
                              <div key={r.id} className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={`h-1.5 w-1.5 rounded-full ${professionDotColor[r.profession] || 'bg-gray-400'}`}
                                  />
                                  <span className="text-[11px] text-muted-foreground">
                                    {professionShort[r.profession] || r.profession}
                                  </span>
                                </div>
                                <Badge
                                  variant={profFilled ? 'default' : 'destructive'}
                                  className="text-[10px] h-4 px-1.5 font-mono"
                                >
                                  {profClaims}/{r.count}
                                </Badge>
                              </div>
                            )
                          },
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
