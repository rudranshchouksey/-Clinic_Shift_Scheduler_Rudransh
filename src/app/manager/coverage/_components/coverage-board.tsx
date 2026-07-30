'use client'

import * as React from 'react'
import Link from 'next/link'
import { format, addWeeks, subWeeks, addDays, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    claims: { user: { profession: string } }[]
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
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-2 rounded-lg border">
        <Link
          href={`?date=${prevWeekStr}`}
          className={buttonVariants({ variant: 'outline', size: 'icon' })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="font-medium text-lg">
          {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
        </div>
        <Link
          href={`?date=${nextWeekStr}`}
          className={buttonVariants({ variant: 'outline', size: 'icon' })}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayShifts = shifts.filter((s) => isSameDay(new Date(s.date), day))
          const isToday = isSameDay(day, new Date())

          return (
            <Card key={day.toISOString()} className={isToday ? 'border-primary' : ''}>
              <CardHeader className="p-3 text-center border-b bg-muted/50">
                <CardTitle className="text-sm font-medium">{format(day, 'EEEE')}</CardTitle>
                <div className="text-xs text-muted-foreground">{format(day, 'MMM d')}</div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 min-h-[150px]">
                {dayShifts.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground mt-4">No shifts</div>
                ) : (
                  dayShifts.map((shift) => {
                    shift.requirements.forEach(() => {
                      /* no-op */
                    })

                    return (
                      <div
                        key={shift.id}
                        className="text-xs border rounded p-2 bg-background space-y-2"
                      >
                        <div className="font-semibold">
                          {format(new Date(shift.startTime), 'HH:mm')} -{' '}
                          {format(new Date(shift.endTime), 'HH:mm')}
                        </div>
                        <div className="flex flex-col gap-1">
                          {shift.requirements.map(
                            (r: { id: string; profession: string; count: number }) => {
                              const profClaims = shift.claims.filter(
                                (c: { user: { profession: string } }) =>
                                  c.user.profession === r.profession,
                              ).length
                              const profFilled = profClaims >= r.count
                              return (
                                <div key={r.id} className="flex justify-between items-center">
                                  <span>{r.profession.slice(0, 3)}</span>
                                  <span
                                    className={
                                      profFilled
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-destructive font-medium'
                                    }
                                  >
                                    {profClaims}/{r.count}
                                  </span>
                                </div>
                              )
                            },
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
